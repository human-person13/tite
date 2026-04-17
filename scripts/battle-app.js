import { completeBattleRun, getSessionData } from './firebase-service.js';

(function () {
    let resultReported = false;

    async function loadSession() {
        try {
            const data = await getSessionData();
            const playerName = document.getElementById('player-name');
            if (playerName && data.player?.name) {
                playerName.textContent = data.player.name;
                window.dispatchEvent(new CustomEvent('studyquest:player-name', {
                    detail: { name: data.player.name }
                }));
            }
        } catch (error) {
            if (error.message === 'Login required.') {
                window.location.href = 'Login.html';
                return;
            }
            console.error(error);
        }
    }

    const baseShowResult = window.showResult;
    window.showResult = async function patchedShowResult(type) {
        if (!resultReported) {
            resultReported = true;
            try {
                await completeBattleRun({
                    islandId,
                    stageId,
                    victory: type === 'victory',
                    coins: type === 'victory' ? battleConfig.rewards.coins : 0,
                    xp: type === 'victory' ? battleConfig.rewards.xp : 0
                });
            } catch (error) {
                console.error(error);
            }
        }
        return baseShowResult(type);
    };

    loadSession();
}());
