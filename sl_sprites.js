// ================================
// SISTEMA DE SPRITES DIRECCIONALES
// ================================
// Archivo: sl_sprites.js
// Gestiona los sprites del jugador según la dirección

console.log('Cargando sl_sprites.js...');

// Configuración de sprites
const spriteConfig = {
    enabled: true,
    basePath: './characters/prota/',
    sprites: {
        up: 'arriba1.png',      // Frame idle para arriba
        down: 'abajo1.png',     // Frame idle para abajo
        left: 'izquierda1.png', // Frame idle para izquierda
        right: 'derecha1.png',  // Frame idle para derecha
        'up-right': 'wd1.png',  // Frame idle para arriba-derecha
        'up-left': 'aw1.png',   // Frame idle para arriba-izquierda
        'down-right': 'ds1.png', // Frame idle para abajo-derecha
        'down-left': 'sa1.png'  // Frame idle para abajo-izquierda
    },
    currentDirection: 'down', // Dirección inicial
    // Sistema de animación con múltiples frames
    animatedSprites: {
        up: {
            frames: 9,          // Total de frames (1-9)
            animationFrames: 8, // Frames de movimiento (2-9)
            firstFrame: 2,      // Comenzar en frame 2 al moverse
            idleFrame: 1,       // Frame 1 es idle
            baseName: 'arriba',
            extension: '.png'
        },
        down: {
            frames: 9,
            animationFrames: 8,
            firstFrame: 2,
            idleFrame: 1,
            baseName: 'abajo',
            extension: '.png'
        },
        left: {
            frames: 9,          // Total de frames (1-9)
            animationFrames: 8, // Frames de movimiento (2-9)
            firstFrame: 2,      // Comenzar en frame 2 al moverse
            idleFrame: 1,       // Frame 1 es idle
            baseName: 'izquierda',
            extension: '.png'
        },
        right: {
            frames: 9,
            animationFrames: 8,
            firstFrame: 2,
            idleFrame: 1,
            baseName: 'derecha',
            extension: '.png'
        },
        'up-right': {
            frames: 9,
            animationFrames: 8,
            firstFrame: 2,
            idleFrame: 1,
            baseName: 'wd',
            extension: '.png'
        },
        'up-left': {
            frames: 9,
            animationFrames: 8,
            firstFrame: 2,
            idleFrame: 1,
            baseName: 'aw',
            extension: '.png'
        },
        'down-right': {
            frames: 9,
            animationFrames: 8,
            firstFrame: 2,
            idleFrame: 1,
            baseName: 'ds',
            extension: '.png'
        },
        'down-left': {
            frames: 9,
            animationFrames: 8,
            firstFrame: 2,
            idleFrame: 1,
            baseName: 'sa',
            extension: '.png'
        }
    },
    isMoving: false, // Estado de movimiento
    currentFrame: 0, // Frame actual de la animación (global)
    animationInterval: null // Intervalo de animación global
};

// Precargar sprites
const spriteImages = {};
const animatedSpriteImages = {};

function preloadSprites() {
    console.log('Precargando sprites del jugador...');
    
    // Cargar sprites estáticos
    Object.keys(spriteConfig.sprites).forEach(direction => {
        const img = new Image();
        img.src = spriteConfig.basePath + spriteConfig.sprites[direction];
        img.onerror = () => {
            console.warn(`No se pudo cargar sprite: ${img.src}`);
        };
        img.onload = () => {
            console.log(`Sprite cargado: ${direction}`);
        };
        spriteImages[direction] = img;
    });
    
    // Cargar sprites animados (múltiples frames)
    Object.keys(spriteConfig.animatedSprites).forEach(direction => {
        const config = spriteConfig.animatedSprites[direction];
        animatedSpriteImages[direction] = [];
        
        for (let i = 1; i <= config.frames; i++) {
            const img = new Image();
            img.src = `${spriteConfig.basePath}${config.baseName}${i}${config.extension}`;
            img.onerror = () => {
                console.warn(`No se pudo cargar frame ${i} de ${direction}: ${img.src}`);
            };
            img.onload = () => {
                console.log(`Frame ${i}/${config.frames} de ${direction} cargado`);
            };
            animatedSpriteImages[direction].push(img);
        }
    });
}

// Crear sprite animado usando CSS animation con steps
function createAnimatedSprite(cellElement, direction, forcePosition = false) {
    const config = spriteConfig.animatedSprites[direction];
    if (!config) return;
    
    // Permitir overlays más grandes que la celda
    cellElement.style.position = 'relative';
    cellElement.style.overflow = 'visible';
    
    // Eliminar overlay previo si existe
    const prev = cellElement.querySelector('.sprite-overlay');
    if (prev) prev.remove();
    
    // Crear imagen para el sprite animado
    const base = (window.CONFIG && window.CONFIG.CELL_SIZE ? window.CONFIG.CELL_SIZE : 25.6);
    const sizePx = base * 3.5;
    const img = document.createElement('img');
    
    // Usar el frame actual global, no reiniciar
    const frames = animatedSpriteImages[direction];
    if (!frames || frames.length === 0) return;
    
    // Calcular el frame actual de la animación (frames 2-9, índices 1-8)
    // currentFrame va de 0 a 7 (8 frames de movimiento)
    const frameIndex = config.firstFrame - 1 + (spriteConfig.currentFrame % config.animationFrames);
    if (frames[frameIndex] && frames[frameIndex].complete) {
        img.src = frames[frameIndex].src;
    }
    
    img.className = 'sprite-overlay sprite-animated';
    img.style.position = 'absolute';
    img.style.width = `${sizePx}px`;
    img.style.height = `${sizePx}px`;
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'none';
    img.style.zIndex = '2';
    
    // Si se fuerza la posición (colisión con muro), desactivar transición temporalmente
    if (forcePosition) {
        img.style.transition = 'none';
    } else {
        img.style.transition = 'all 0.05s linear';
    }
    
    // Posicionar centrado en la celda
    img.style.left = '50%';
    img.style.top = '50%';
    img.style.transform = 'translate(-50%, -50%)';
    img.style.right = '';
    img.style.bottom = '';
    
    cellElement.appendChild(img);
    
    // Guardar referencia a la imagen para actualizarla desde el interval global
    cellElement.spriteImage = img;
    
    // Si se forzó la posición, reactivar la transición después de un frame
    if (forcePosition) {
        requestAnimationFrame(() => {
            img.style.transition = 'all 0.05s linear';
        });
    }
}

// Actualizar sprite del jugador según dirección
function updatePlayerSprite(cellElement, forcePosition = false) {
    if (!spriteConfig.enabled || !cellElement) return;
    
    const direction = spriteConfig.currentDirection;
    const hasAnimation = spriteConfig.animatedSprites[direction];
    
    // Si la dirección tiene animación multi-frame
    if (hasAnimation && spriteConfig.isMoving) {
        createAnimatedSprite(cellElement, direction, forcePosition);
        return;
    }
    
    // Usar sprite estático (idle o direcciones sin animación)
    const sprite = spriteImages[direction];
    
    // Limpiar referencia a imagen animada
    if (cellElement.spriteImage) {
        cellElement.spriteImage = null;
    }
    
    if (sprite && sprite.complete) {
        // Permitir overlays más grandes que la celda
        cellElement.style.position = 'relative';
        cellElement.style.overflow = 'visible';
        
        // Eliminar overlay previo si existe
        const prev = cellElement.querySelector('.sprite-overlay');
        if (prev) prev.remove();
        
        // Crear imagen overlay más grande y anclar según dirección
        const base = (window.CONFIG && window.CONFIG.CELL_SIZE ? window.CONFIG.CELL_SIZE : 25.6);
        const sizePx = base * 3.5; // un poco más grande
        const img = document.createElement('img');
        img.src = sprite.src;
        img.className = 'sprite-overlay';
        img.style.position = 'absolute';
        img.style.width = `${sizePx}px`;
        img.style.height = `${sizePx}px`;
        img.style.objectFit = 'contain';
        img.style.pointerEvents = 'none';
        img.style.zIndex = '2';
        
        // Si se fuerza la posición (colisión con muro), desactivar transición temporalmente
        if (forcePosition) {
            img.style.transition = 'none';
        } else {
            img.style.transition = 'all 0.05s linear';
        }

        // Centrar en la celda (igual para todas las direcciones)
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.right = '';
        img.style.bottom = '';

        cellElement.appendChild(img);
        
        // Si se forzó la posición, reactivar la transición después de un frame
        if (forcePosition) {
            requestAnimationFrame(() => {
                img.style.transition = 'all 0.05s linear';
            });
        }
    }
}

// Cambiar dirección del sprite
function setPlayerDirection(direction) {
    if (spriteConfig.sprites[direction]) {
        spriteConfig.currentDirection = direction;
        
        // Actualizar celda del jugador inmediatamente
        const playerCell = document.querySelector('.cell.player');
        if (playerCell) {
            updatePlayerSprite(playerCell);
        }
    }
}

// Detectar dirección del movimiento
function updateDirectionFromMovement(dx, dy) {
    // Verificar movimientos diagonales primero
    if (dx > 0 && dy < 0) {
        setPlayerDirection('up-right');
    } else if (dx < 0 && dy < 0) {
        setPlayerDirection('up-left');
    } else if (dx > 0 && dy > 0) {
        setPlayerDirection('down-right');
    } else if (dx < 0 && dy > 0) {
        setPlayerDirection('down-left');
    }
    // Movimientos cardinales
    else if (dx > 0) {
        setPlayerDirection('right');
    } else if (dx < 0) {
        setPlayerDirection('left');
    } else if (dy < 0) {
        setPlayerDirection('up');
    } else if (dy > 0) {
        setPlayerDirection('down');
    }
}

// Iniciar movimiento (activa animación)
function startMoving() {
    if (spriteConfig.isMoving) return; // Ya está en movimiento
    
    spriteConfig.isMoving = true;
    
    // Actualizar sprite inmediatamente
    const playerCell = document.querySelector('.cell.player');
    if (playerCell) {
        updatePlayerSprite(playerCell);
    }
    
    // Limpiar interval anterior si existe
    if (spriteConfig.animationInterval) {
        clearInterval(spriteConfig.animationInterval);
    }
    
    // Iniciar interval global para avanzar frames
    const frameDuration = 60; // 60ms por frame para animación más fluida
    
    spriteConfig.animationInterval = setInterval(() => {
        // Obtener dirección actual en tiempo real
        const currentDirection = spriteConfig.currentDirection;
        const config = spriteConfig.animatedSprites[currentDirection];
        
        // Si la dirección actual no tiene animación, no actualizar frames
        if (!config) return;
        
        // Avanzar al siguiente frame (ciclo de 0 a 7, que corresponde a frames 2-9)
        spriteConfig.currentFrame = (spriteConfig.currentFrame + 1) % config.animationFrames;
        
        // Actualizar la imagen en la celda del jugador
        const cell = document.querySelector('.cell.player');
        if (cell && cell.spriteImage) {
            const frames = animatedSpriteImages[currentDirection];
            // Calcular índice real: firstFrame-1 + currentFrame = 1 + (0-7) = frames 2-9
            const frameIndex = config.firstFrame - 1 + spriteConfig.currentFrame;
            if (frames && frames[frameIndex] && frames[frameIndex].complete) {
                cell.spriteImage.src = frames[frameIndex].src;
            }
        }
    }, frameDuration);
}

// Detener movimiento (vuelve a idle)
function stopMoving() {
    spriteConfig.isMoving = false;
    
    // Limpiar interval global
    if (spriteConfig.animationInterval) {
        clearInterval(spriteConfig.animationInterval);
        spriteConfig.animationInterval = null;
    }
    
    // Resetear al frame inicial (idle)
    spriteConfig.currentFrame = 0;
    
    // Actualizar sprite a idle
    const playerCell = document.querySelector('.cell.player');
    if (playerCell) {
        updatePlayerSprite(playerCell);
    }
}

// Exportar funciones globales
window.updatePlayerSprite = updatePlayerSprite;
window.setPlayerDirection = setPlayerDirection;
window.updateDirectionFromMovement = updateDirectionFromMovement;
window.startMoving = startMoving;
window.stopMoving = stopMoving;

// Precargar al iniciar
preloadSprites();
