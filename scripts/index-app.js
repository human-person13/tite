import {
    buyShopItem,
    getIslandLevels,
    getSessionData,
    signOutUser,
    updatePlayerData,
    uploadAvatarData
} from './firebase-service.js';

(function () {
    const appState = {
        islands: []
    };

    function redirectToLogin() {
        window.location.href = 'Login.html';
    }

    function syncApp(data) {
        appState.islands = data.islands || [];
        setPlayerProfile(data.player);
        setIslands(appState.islands);
        setShopItems(data.shopItems || []);
    }

    async function loadSession() {
        const data = await getSessionData();
        syncApp(data);
    }

    window.confirmSave = async function confirmSave() {
        const payload = {
            name: document.getElementById('id-inp-name').value.trim()
        };
        const newPassword = document.getElementById('id-inp-pw').value;
        if (newPassword) {
            payload.newPassword = newPassword;
        }

        try {
            const data = await updatePlayerData(payload);
            setPlayerProfile(data);
            cancelEdit();
            dismissConfirm();
        } catch (error) {
            alert(error.message);
        }
    };

    window.handleChangePicture = function handleChangePicture() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async event => {
            const file = event.target.files && event.target.files[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const data = await uploadAvatarData(reader.result);
                    setAvatarImage(data.avatarUrl);
                } catch (error) {
                    alert(error.message);
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    window.openIslandModal = async function openIslandModal(islandId, islandName, levelsArray) {
        try {
            const island = levelsArray
                ? { id: islandId, name: islandName, levels: levelsArray }
                : await getIslandLevels(islandId);
            const resolvedName = island.name || islandName;
            document.getElementById('island-modal-title').textContent = `⚔ ${resolvedName} — Stages`;
            const grid = document.getElementById('levels-grid-modal');
            grid.innerHTML = '';
            island.levels.forEach(level => {
                const btn = document.createElement('button');
                btn.className = `level-cell-fantasy lv-${level.status}`;
                btn.dataset.levelId = level.id;
                btn.dataset.islandId = island.id;
                if (level.status === 'locked') {
                    btn.innerHTML = '<span style="font-size:1.4rem">🔒</span>';
                    btn.disabled = true;
                } else {
                    btn.innerHTML = `<span class="lv-num">${level.id}</span><span class="lv-stars">${'★'.repeat(level.stars)}${'☆'.repeat(3 - level.stars)}</span>`;
                    btn.onclick = function () {
                        startLevel(level.id, island.id);
                    };
                }
                grid.appendChild(btn);
            });
            document.getElementById('island-modal-overlay').classList.add('open');
        } catch (error) {
            alert(error.message);
        }
    };

    window.buyItem = async function buyItem(itemId) {
        try {
            const data = await buyShopItem(itemId);
            setPlayerProfile(data.player);
            alert(data.message);
        } catch (error) {
            alert(error.message);
        }
    };

    window.startPractice = function startPractice(mode) {
        alert(`Practice mode "${mode}" not wired yet.`);
    };

    window.logout = async function logout() {
        try {
            await signOutUser();
        } catch (error) {
            if (error.message !== 'Login required.') {
                alert(error.message);
            }
        }
        redirectToLogin();
    };

    loadSession().catch(error => {
        if (error.message === 'Login required.') {
            redirectToLogin();
            return;
        }
        alert(error.message);
    });
}());
