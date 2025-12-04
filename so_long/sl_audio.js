// ================================
// SISTEMA DE AUDIO
// ================================
// Archivo: sl_audio.js
// Gestiona todos los efectos de sonido del juego

const audioSystem = {
    firstInteraction: {
        Rafael: './audio/rafael_gema.mp3',
        Ana: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        Seba: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        Domingo: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        MariaJuana: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        Duku: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        Elena: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        Carlos: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        Laura: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        Miguel: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
        Carmela: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3'
    },
    subsequentInteraction: {
        Rafael: './audio/rafael_sin_gema.mp3',
        Ana: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        Seba: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        Domingo: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        MariaJuana: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        Duku: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        Elena: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        Carlos: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        Laura: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        Miguel: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        Carmela: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'
    },
    effects: {
        collect: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
        movement: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        mapChange: 'https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkles-300.mp3',
        unlock: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'
    },
    cache: {},
    
    playSound: function(audioUrl) {
        if (!gameState.audioEnabled) return;
        
        try {
            let audio = this.cache[audioUrl];
            if (!audio) {
                audio = new Audio(audioUrl);
                audio.preload = 'auto';
                this.cache[audioUrl] = audio;
            }
            
            audio.currentTime = 0;
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Error reproduciendo audio:", e));
        } catch (error) {
            console.log("Error en sistema de audio:", error);
        }
    },
    
    playNPCInteraction: function(npcId, isFirstInteraction) {
        const soundType = isFirstInteraction ? 'firstInteraction' : 'subsequentInteraction';
        const audioUrl = this[soundType][npcId];
        
        if (audioUrl) {
            this.playSound(audioUrl);
        }
        
        if (isFirstInteraction && this.effects.collect) {
            setTimeout(() => {
                this.playSound(this.effects.collect);
            }, 300);
        }
    },
    
    playMapChange: function() {
        if (this.effects.mapChange) {
            this.playSound(this.effects.mapChange);
        }
    },
    
    playUnlock: function() {
        if (this.effects.unlock) {
            this.playSound(this.effects.unlock);
        }
    }
};
