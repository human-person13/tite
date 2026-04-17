const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SESSION_COOKIE = 'studyquest_sid';
const sessions = new Map();

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

function loadStore() {
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
}

function saveStore(store) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hashPassword(password, salt) {
  return sha256(`${salt}:${password}`);
}

function randomId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getCookies(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce((acc, entry) => {
    const [key, ...rest] = entry.trim().split('=');
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...headers
  });
  res.end(payload);
}

function setSession(res, playerId) {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, playerId);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${sessionId}; HttpOnly; Path=/; SameSite=Lax`);
}

function clearSession(res, req) {
  const cookies = getCookies(req);
  if (cookies[SESSION_COOKIE]) {
    sessions.delete(cookies[SESSION_COOKIE]);
  }
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

function getPlayerFromSession(req, store) {
  const cookies = getCookies(req);
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) {
    return null;
  }
  const playerId = sessions.get(sessionId);
  if (!playerId) {
    return null;
  }
  return store.players.find(player => player.id === playerId) || null;
}

function getPlayerProgress(store, playerId) {
  if (!store.progress[playerId]) {
    store.progress[playerId] = { islands: [] };
  }
  return store.progress[playerId];
}

function toPlayerProfile(player) {
  const totalMatches = player.wins + player.losses;
  const winRate = totalMatches ? Math.round((player.wins / totalMatches) * 100) : 0;
  return {
    id: player.id,
    name: player.name,
    initials: player.name.slice(0, 2).toUpperCase(),
    email: player.email,
    rank: player.rank,
    level: player.level,
    xp: player.xp,
    xpMax: player.xpMax,
    stages: player.stages,
    winRate,
    coins: player.coins,
    avatarUrl: player.avatarUrl || ''
  };
}

function getAppData(store, player) {
  const progress = getPlayerProgress(store, player.id);
  return {
    player: toPlayerProfile(player),
    islands: progress.islands.map(({ levels, ...island }) => island),
    shopItems: store.shopItems
  };
}

function ensurePublicAsset(filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(ROOT_DIR))) {
    return null;
  }
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return null;
  }
  return resolved;
}

function serveStatic(req, res) {
  let requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  if (requestPath === '/') {
    requestPath = '/Login.html';
  }

  const safePath = requestPath.replace(/^\/+/, '');
  const filePath = ensurePublicAsset(path.join(ROOT_DIR, safePath));
  if (!filePath) {
    sendText(res, 404, 'Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const store = loadStore();
  const player = getPlayerFromSession(req, store);

  if (url.pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (url.pathname === '/api/auth/session' && req.method === 'GET') {
    if (!player) {
      sendJson(res, 401, { error: 'Not authenticated.' });
      return true;
    }
    sendJson(res, 200, getAppData(store, player));
    return true;
  }

  if (url.pathname === '/api/auth/signup' && req.method === 'POST') {
    const body = await readJson(req);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!name || !email || password.length < 6) {
      sendJson(res, 400, { error: 'Valid name, email, password needed.' });
      return true;
    }

    if (store.players.some(entry => entry.email === email)) {
      sendJson(res, 409, { error: 'Email already used.' });
      return true;
    }

    const playerId = randomId('player');
    const salt = crypto.randomUUID();
    const newPlayer = {
      id: playerId,
      email,
      name,
      passwordHash: hashPassword(password, salt),
      salt,
      rank: 'Novice Rank',
      level: 1,
      xp: 0,
      xpMax: 100,
      stages: 0,
      wins: 0,
      losses: 0,
      coins: 250,
      avatarUrl: ''
    };

    store.players.push(newPlayer);
    store.progress[playerId] = {
      islands: [
        {
          id: 1,
          name: 'Island 1',
          status: 'unlocked',
          cleared: 0,
          total: 10,
          levels: Array.from({ length: 10 }, (_, index) => ({
            id: index + 1,
            status: index === 0 ? 'unlocked' : 'locked',
            stars: 0
          }))
        },
        {
          id: 2,
          name: 'Island 2',
          status: 'locked',
          cleared: 0,
          total: 10,
          levels: Array.from({ length: 10 }, (_, index) => ({
            id: index + 1,
            status: 'locked',
            stars: 0
          }))
        },
        {
          id: 3,
          name: 'Island 3',
          status: 'locked',
          cleared: 0,
          total: 10,
          levels: Array.from({ length: 10 }, (_, index) => ({
            id: index + 1,
            status: 'locked',
            stars: 0
          }))
        },
        {
          id: 4,
          name: 'Island 4',
          status: 'locked',
          cleared: 0,
          total: 10,
          levels: Array.from({ length: 10 }, (_, index) => ({
            id: index + 1,
            status: 'locked',
            stars: 0
          }))
        }
      ]
    };
    saveStore(store);
    setSession(res, newPlayer.id);
    sendJson(res, 201, getAppData(store, newPlayer));
    return true;
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await readJson(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const found = store.players.find(entry => entry.email === email);

    if (!found || found.passwordHash !== hashPassword(password, found.salt)) {
      sendJson(res, 401, { error: 'Wrong email or password.' });
      return true;
    }

    setSession(res, found.id);
    sendJson(res, 200, getAppData(store, found));
    return true;
  }

  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    clearSession(res, req);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (!player) {
    sendJson(res, 401, { error: 'Login required.' });
    return true;
  }

  if (url.pathname === '/api/player/update' && req.method === 'POST') {
    const body = await readJson(req);
    const name = String(body.name || '').trim();
    const newPassword = String(body.newPassword || '');

    if (!name) {
      sendJson(res, 400, { error: 'Name required.' });
      return true;
    }

    player.name = name;
    if (newPassword) {
      if (newPassword.length < 6) {
        sendJson(res, 400, { error: 'Password too short.' });
        return true;
      }
      player.passwordHash = hashPassword(newPassword, player.salt);
    }
    saveStore(store);
    sendJson(res, 200, toPlayerProfile(player));
    return true;
  }

  if (url.pathname === '/api/player/avatar' && req.method === 'POST') {
    const body = await readJson(req);
    const imageData = String(body.imageData || '');
    if (!imageData.startsWith('data:image/')) {
      sendJson(res, 400, { error: 'Invalid image payload.' });
      return true;
    }

    const match = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      sendJson(res, 400, { error: 'Invalid image format.' });
      return true;
    }

    const extension = match[1].split('/')[1].replace('jpeg', 'jpg');
    const uploadsDir = path.join(DATA_DIR, 'uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const fileName = `${player.id}.${extension}`;
    fs.writeFileSync(path.join(uploadsDir, fileName), Buffer.from(match[2], 'base64'));
    player.avatarUrl = `/data/uploads/${fileName}`;
    saveStore(store);
    sendJson(res, 200, { avatarUrl: player.avatarUrl });
    return true;
  }

  if (url.pathname === '/api/islands' && req.method === 'GET') {
    const progress = getPlayerProgress(store, player.id);
    sendJson(res, 200, progress.islands.map(({ levels, ...island }) => island));
    return true;
  }

  const islandLevelsMatch = url.pathname.match(/^\/api\/islands\/(\d+)\/levels$/);
  if (islandLevelsMatch && req.method === 'GET') {
    const islandId = Number.parseInt(islandLevelsMatch[1], 10);
    const progress = getPlayerProgress(store, player.id);
    const island = progress.islands.find(entry => entry.id === islandId);
    if (!island) {
      sendJson(res, 404, { error: 'Island not found.' });
      return true;
    }
    sendJson(res, 200, island);
    return true;
  }

  if (url.pathname === '/api/shop/items' && req.method === 'GET') {
    sendJson(res, 200, store.shopItems);
    return true;
  }

  if (url.pathname === '/api/shop/buy' && req.method === 'POST') {
    const body = await readJson(req);
    const itemId = String(body.itemId || '');
    const item = store.shopItems.find(entry => entry.id === itemId);
    if (!item) {
      sendJson(res, 404, { error: 'Item not found.' });
      return true;
    }
    if (player.coins < item.price) {
      sendJson(res, 400, { error: 'Not enough coins.' });
      return true;
    }
    player.coins -= item.price;
    saveStore(store);
    sendJson(res, 200, {
      message: `${item.name} bought.`,
      player: toPlayerProfile(player)
    });
    return true;
  }

  if (url.pathname === '/api/battle/complete' && req.method === 'POST') {
    const body = await readJson(req);
    const islandId = Number.parseInt(body.islandId, 10);
    const stageId = Number.parseInt(body.stageId, 10);
    const victory = Boolean(body.victory);
    const coins = Math.max(0, Number.parseInt(body.coins, 10) || 0);
    const xp = Math.max(0, Number.parseInt(body.xp, 10) || 0);

    if (!Number.isInteger(islandId) || !Number.isInteger(stageId)) {
      sendJson(res, 400, { error: 'Invalid battle payload.' });
      return true;
    }

    const progress = getPlayerProgress(store, player.id);
    const island = progress.islands.find(entry => entry.id === islandId);
    const level = island?.levels.find(entry => entry.id === stageId);
    if (!island || !level) {
      sendJson(res, 404, { error: 'Stage not found.' });
      return true;
    }

    if (!victory) {
      player.losses += 1;
      saveStore(store);
      sendJson(res, 200, { player: toPlayerProfile(player), islands: progress.islands.map(({ levels, ...entry }) => entry) });
      return true;
    }

    player.wins += 1;
    player.coins += coins;
    player.xp += xp;
    while (player.xp >= player.xpMax) {
      player.xp -= player.xpMax;
      player.level += 1;
      player.xpMax += 150;
    }

    const wasCompleted = level.status === 'completed';
    level.status = 'completed';
    level.stars = Math.max(level.stars, 3);

    const nextLevel = island.levels.find(entry => entry.id === stageId + 1);
    if (nextLevel && nextLevel.status === 'locked') {
      nextLevel.status = 'unlocked';
    }

    island.cleared = island.levels.filter(entry => entry.status === 'completed').length;
    if (!wasCompleted) {
      player.stages += 1;
    }

    const nextIsland = progress.islands.find(entry => entry.id === islandId + 1);
    if (nextIsland && island.cleared >= island.total && nextIsland.status === 'locked') {
      nextIsland.status = 'unlocked';
      const firstLevel = nextIsland.levels.find(entry => entry.id === 1);
      if (firstLevel && firstLevel.status === 'locked') {
        firstLevel.status = 'unlocked';
      }
    }

    saveStore(store);
    sendJson(res, 200, {
      player: toPlayerProfile(player),
      islands: progress.islands.map(({ levels, ...entry }) => entry)
    });
    return true;
  }

  sendJson(res, 404, { error: 'API route not found.' });
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    if ((req.url || '').startsWith('/api/')) {
      await handleApi(req, res);
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`StudyQuest server running at http://localhost:${PORT}`);
});
