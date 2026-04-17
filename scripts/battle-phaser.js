import * as Phaser from '../node_modules/phaser/dist/phaser.esm.js';

const host = document.getElementById('battle-phaser');
const playerAnchor = document.getElementById('player-sprite');
const enemyAnchor = document.getElementById('enemy-sprite');

if (!host || !playerAnchor || !enemyAnchor) {
    throw new Error('Missing battle anchors.');
}

const arenaState = {
    scene: null
};

class BattleArenaScene extends Phaser.Scene {
    constructor() {
        super('battle-arena');
        this.spriteMap = {};
    }

    preload() {
        this.loadSprites('player', window.playerSprites || {});
        this.loadSprites('enemy', window.battleConfig?.enemySprites || window.defaultEnemySprites || {});
    }

    create() {
        arenaState.scene = this;
        this.playerShadow = this.add.ellipse(0, 0, 92, 22, 0x000000, 0.28);
        this.enemyShadow = this.add.ellipse(0, 0, 92, 22, 0x000000, 0.28);
        this.player = this.add.sprite(0, 0, this.getTextureKey('player', 'idle'));
        this.enemy = this.add.sprite(0, 0, this.getTextureKey('enemy', 'idle'));

        this.player.setOrigin(0.5, 0.82);
        this.enemy.setOrigin(0.5, 0.82);
        this.enemy.setFlipX(true);

        this.playerWrap = this.add.container(0, 0, [this.playerShadow, this.player]);
        this.enemyWrap = this.add.container(0, 0, [this.enemyShadow, this.enemy]);
        this.playerShadow.setPosition(-25, 25);
        this.enemyShadow.setPosition(3, 25);
        this.player.setPosition(0, 0);
        this.enemy.setPosition(0, 0);

        this.playState('player', 'idle');
        this.playState('enemy', 'idle');
        this.layout();
        this.scale.on('resize', this.layout, this);

        // Hide DOM-driven sprite layer only after Phaser idle anims exist.
        this.time.delayedCall(0, () => {
            document.documentElement.classList.add('phaser-battle-ready');
        });
    }

    loadSprites(side, definitions) {
        Object.entries(definitions).forEach(([state, def]) => {
            if (!def?.src) {
                return;
            }

            const key = this.getTextureKey(side, state);
            this.load.spritesheet(key, `../${def.src}`, {
                frameWidth: 128,
                frameHeight: 128
            });
        });
    }

    getTextureKey(side, state) {
        return `${side}-${state}`;
    }

    getSpriteConfig(side, state) {
        const map = side === 'player'
            ? (window.playerSprites || {})
            : (window.battleConfig?.enemySprites || window.defaultEnemySprites || {});
        return map[state] || map.idle;
    }

    ensureAnimation(side, state) {
        const def = this.getSpriteConfig(side, state);
        if (!def) {
            return null;
        }

        const key = `${side}-${state}-anim`;
        if (this.anims.exists(key)) {
            return key;
        }

        this.anims.create({
            key,
            frames: def.frames.map(frame => ({ key: this.getTextureKey(side, state), frame })),
            frameRate: def.fps || 8,
            repeat: def.loop ? -1 : 0
        });

        return key;
    }

    layout() {
        const hostBox = host.getBoundingClientRect();
        this.placeSprite(this.playerWrap, playerAnchor, hostBox);
        this.placeSprite(this.enemyWrap, enemyAnchor, hostBox);
    }

    placeSprite(wrapper, anchor, hostBox) {
        const box = anchor.getBoundingClientRect();
        const isPlayer = anchor.id === 'player-sprite';
        const xOffset = isPlayer ? 20 : 0;
        const yOffset = -20;
        const x = box.left - hostBox.left + (box.width / 2) + xOffset;
        const y = box.top - hostBox.top + box.height - 22 + yOffset;
        wrapper.setPosition(x, y);
    }

    playState(side, state) {
        const sprite = side === 'player' ? this.player : this.enemy;
        const animKey = this.ensureAnimation(side, state);
        if (!sprite || !animKey) {
            return;
        }

        sprite.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);
        sprite.anims.stop();
        sprite.play(animKey, true);

        const def = this.getSpriteConfig(side, state);
        if (!def?.loop && state !== 'dead') {
            sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.playState(side, 'idle');
            });
        }
    }

    attackEnemy(damage) {
        this.layout();
        this.tweens.add({
            targets: this.playerWrap,
            x: this.playerWrap.x + 28,
            duration: 120,
            yoyo: true
        });
        this.tweens.add({
            targets: this.enemyWrap,
            x: this.enemyWrap.x + 10,
            angle: 6,
            duration: 90,
            yoyo: true,
            repeat: 1
        });
        this.floatDamage(this.enemyWrap.x, this.enemyWrap.y - 120, `-${damage}`, '#ffe08a');
    }

    hurtPlayer(damage) {
        this.layout();
        this.tweens.add({
            targets: this.enemyWrap,
            x: this.enemyWrap.x - 28,
            duration: 120,
            yoyo: true
        });
        this.tweens.add({
            targets: this.playerWrap,
            x: this.playerWrap.x - 10,
            angle: -6,
            duration: 90,
            yoyo: true,
            repeat: 1
        });
        this.floatDamage(this.playerWrap.x, this.playerWrap.y - 120, `-${damage}`, '#ffb3b3');
    }

    finish(type) {
        const sprite = type === 'victory' ? this.enemyWrap : this.playerWrap;
        this.tweens.add({
            targets: sprite,
            alpha: 0.28,
            duration: 500,
            ease: 'Cubic.easeOut'
        });
    }

    floatDamage(x, y, text, color) {
        const damageText = this.add.text(x, y, text, {
            fontFamily: '"Cinzel", serif',
            fontSize: '26px',
            fontStyle: '700',
            color
        }).setOrigin(0.5);

        this.tweens.add({
            targets: damageText,
            y: y - 36,
            alpha: 0,
            duration: 800,
            ease: 'Sine.out',
            onComplete: () => damageText.destroy()
        });
    }
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host,
    transparent: true,
    backgroundColor: 'rgba(0,0,0,0)',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: host.clientWidth || 640,
        height: host.clientHeight || 280
    },
    scene: BattleArenaScene
});

const resizeObserver = new ResizeObserver(entries => {
    const entry = entries[0];
    if (!entry) {
        return;
    }

    game.scale.resize(
        Math.max(320, Math.round(entry.contentRect.width)),
        Math.max(220, Math.round(entry.contentRect.height))
    );
    arenaState.scene?.layout();
});

resizeObserver.observe(host);
resizeObserver.observe(playerAnchor);
resizeObserver.observe(enemyAnchor);

window.addEventListener('studyquest:sprite-state', event => {
    arenaState.scene?.playState(event.detail.side, event.detail.state);
});

window.addEventListener('studyquest:battle-correct', event => {
    arenaState.scene?.attackEnemy(event.detail.damage);
});

window.addEventListener('studyquest:battle-wrong', event => {
    arenaState.scene?.hurtPlayer(event.detail.damage);
});

window.addEventListener('studyquest:battle-finished', event => {
    arenaState.scene?.finish(event.detail.type);
});
