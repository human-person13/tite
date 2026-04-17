import { app } from '../main.js';
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
    get,
    getDatabase,
    ref,
    update
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';
import {
    getDownloadURL,
    getStorage,
    ref as storageRef,
    uploadString
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

const defaultShopItems = [
    { id: 'shield_skin', name: 'Knight Shield', price: 180, emoji: '🛡' },
    { id: 'sword_skin', name: 'Hero Sword', price: 220, emoji: '⚔' },
    { id: 'hint_pack', name: 'Hint Pack', price: 90, emoji: '💡' },
    { id: 'xp_boost', name: 'XP Boost', price: 150, emoji: '✨' }
];

function makeDefaultIslands() {
    return [
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
    ];
}

function makeDefaultProfile(user, name) {
    const resolvedName = name || user.displayName || user.email?.split('@')[0] || 'Player';
    return {
        id: user.uid,
        name: resolvedName,
        initials: resolvedName.slice(0, 2).toUpperCase(),
        email: user.email || '',
        rank: 'Novice Rank',
        level: 1,
        xp: 0,
        xpMax: 100,
        stages: 0,
        winRate: 0,
        wins: 0,
        losses: 0,
        coins: 250,
        avatarUrl: ''
    };
}

function normalizeProfile(profile) {
    const wins = profile.wins || 0;
    const losses = profile.losses || 0;
    const totalMatches = wins + losses;
    return {
        ...profile,
        initials: (profile.name || 'Player').slice(0, 2).toUpperCase(),
        winRate: totalMatches ? Math.round((wins / totalMatches) * 100) : 0
    };
}

function summarizeIslands(progress) {
    return (progress?.islands || []).map(({ levels, ...island }) => island);
}

function getUserRoot(uid) {
    return `users/${uid}`;
}

function requireUser() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Login required.');
    }
    return user;
}

function waitForAuth() {
    return new Promise(resolve => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            unsubscribe();
            resolve(user);
        });
    });
}

async function ensureShopItems() {
    const shopItemsRef = ref(database, 'meta/shopItems');
    const snapshot = await get(shopItemsRef);
    if (snapshot.exists()) {
        return snapshot.val();
    }

    await update(ref(database), {
        'meta/shopItems': defaultShopItems
    });
    return defaultShopItems;
}

async function ensureUserData(user, name) {
    const rootPath = getUserRoot(user.uid);
    const snapshot = await get(ref(database, rootPath));
    const value = snapshot.val() || {};
    const updates = {};

    if (!value.profile) {
        updates[`${rootPath}/profile`] = makeDefaultProfile(user, name);
    } else if (name && value.profile.name !== name) {
        updates[`${rootPath}/profile/name`] = name;
        updates[`${rootPath}/profile/initials`] = name.slice(0, 2).toUpperCase();
    }

    if (!value.progress) {
        updates[`${rootPath}/progress`] = {
            islands: makeDefaultIslands()
        };
    }

    if (Object.keys(updates).length) {
        await update(ref(database), updates);
    }
}

export async function signUpUser({ name, email, password }) {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credentials.user, { displayName: name });
    await ensureUserData(credentials.user, name);
    return getSessionData();
}

export async function signInUser({ email, password }) {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserData(credentials.user);
    return getSessionData();
}

export async function signOutUser() {
    await signOut(auth);
}

export async function getSessionData() {
    const user = auth.currentUser || await waitForAuth();
    if (!user) {
        throw new Error('Login required.');
    }

    await ensureUserData(user);

    const [profileSnapshot, progressSnapshot, shopItems] = await Promise.all([
        get(ref(database, `${getUserRoot(user.uid)}/profile`)),
        get(ref(database, `${getUserRoot(user.uid)}/progress`)),
        ensureShopItems()
    ]);

    const profile = normalizeProfile(profileSnapshot.val() || makeDefaultProfile(user));
    const progress = progressSnapshot.val() || { islands: makeDefaultIslands() };

    return {
        player: profile,
        islands: summarizeIslands(progress),
        shopItems
    };
}

export async function updatePlayerData({ name, newPassword }) {
    const user = requireUser();
    if (!name) {
        throw new Error('Name required.');
    }

    await update(ref(database), {
        [`${getUserRoot(user.uid)}/profile/name`]: name,
        [`${getUserRoot(user.uid)}/profile/initials`]: name.slice(0, 2).toUpperCase()
    });
    await updateProfile(user, { displayName: name });

    if (newPassword) {
        if (newPassword.length < 6) {
            throw new Error('Password too short.');
        }
        await updatePassword(user, newPassword);
    }

    const snapshot = await get(ref(database, `${getUserRoot(user.uid)}/profile`));
    return normalizeProfile(snapshot.val());
}

export async function uploadAvatarData(imageData) {
    const user = requireUser();
    const match = String(imageData || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid image format.');
    }

    const extension = match[1].split('/')[1].replace('jpeg', 'jpg');
    const avatarRef = storageRef(storage, `avatars/${user.uid}.${extension}`);
    await uploadString(avatarRef, imageData, 'data_url');
    const avatarUrl = await getDownloadURL(avatarRef);
    await update(ref(database), {
        [`${getUserRoot(user.uid)}/profile/avatarUrl`]: avatarUrl
    });
    return { avatarUrl };
}

export async function getIslandLevels(islandId) {
    const user = requireUser();
    const snapshot = await get(ref(database, `${getUserRoot(user.uid)}/progress/islands`));
    const islands = snapshot.val() || [];
    const island = islands.find(entry => Number(entry.id) === Number(islandId));
    if (!island) {
        throw new Error('Island not found.');
    }
    return island;
}

export async function buyShopItem(itemId) {
    const user = requireUser();
    const snapshot = await get(ref(database));
    const data = snapshot.val() || {};
    const shopItems = data.meta?.shopItems || defaultShopItems;
    const item = shopItems.find(entry => entry.id === itemId);
    const profile = data.users?.[user.uid]?.profile;

    if (!item) {
        throw new Error('Item not found.');
    }
    if (!profile) {
        throw new Error('Player not found.');
    }
    if ((profile.coins || 0) < item.price) {
        throw new Error('Not enough coins.');
    }

    profile.coins -= item.price;

    await update(ref(database), {
        [`${getUserRoot(user.uid)}/profile`]: profile
    });

    return {
        message: `${item.name} bought.`,
        player: normalizeProfile(profile)
    };
}

export async function completeBattleRun({ islandId, stageId, victory, coins, xp }) {
    const user = requireUser();
    const snapshot = await get(ref(database));
    const data = snapshot.val() || {};
    const profile = data.users?.[user.uid]?.profile;
    const progress = data.users?.[user.uid]?.progress;
    const islands = progress?.islands || [];
    const island = islands.find(entry => Number(entry.id) === Number(islandId));
    const level = island?.levels?.find(entry => Number(entry.id) === Number(stageId));

    if (!profile || !progress || !island || !level) {
        throw new Error('Stage not found.');
    }

    if (!victory) {
        profile.losses = (profile.losses || 0) + 1;
        await update(ref(database), {
            [`${getUserRoot(user.uid)}/profile`]: profile
        });
        return {
            player: normalizeProfile(profile),
            islands: summarizeIslands(progress)
        };
    }

    profile.wins = (profile.wins || 0) + 1;
    profile.coins = (profile.coins || 0) + Math.max(0, Number(coins) || 0);
    profile.xp = (profile.xp || 0) + Math.max(0, Number(xp) || 0);

    while (profile.xp >= profile.xpMax) {
        profile.xp -= profile.xpMax;
        profile.level += 1;
        profile.xpMax += 150;
    }

    const wasCompleted = level.status === 'completed';
    level.status = 'completed';
    level.stars = Math.max(level.stars || 0, 3);

    const nextLevel = island.levels.find(entry => Number(entry.id) === Number(stageId) + 1);
    if (nextLevel && nextLevel.status === 'locked') {
        nextLevel.status = 'unlocked';
    }

    island.cleared = island.levels.filter(entry => entry.status === 'completed').length;
    if (!wasCompleted) {
        profile.stages = (profile.stages || 0) + 1;
    }

    const nextIsland = islands.find(entry => Number(entry.id) === Number(islandId) + 1);
    if (nextIsland && island.cleared >= island.total && nextIsland.status === 'locked') {
        nextIsland.status = 'unlocked';
        const firstLevel = nextIsland.levels.find(entry => Number(entry.id) === 1);
        if (firstLevel && firstLevel.status === 'locked') {
            firstLevel.status = 'unlocked';
        }
    }

    await update(ref(database), {
        [`${getUserRoot(user.uid)}/profile`]: profile,
        [`${getUserRoot(user.uid)}/progress`]: progress
    });

    return {
        player: normalizeProfile(profile),
        islands: summarizeIslands(progress)
    };
}

export { auth };
