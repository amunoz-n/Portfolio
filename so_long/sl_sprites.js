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
        up: 'arriba.png',
        down: 'abajo.png',
        left: 'izquierda.png',
        right: 'derecha.png',
        'up-right': 'wd.png',
        'up-left': 'aw.png',
        'down-right': 'ds.png',
        'down-left': 'sa.png'
    },
    currentDirection: 'down' // Dirección inicial
};

// Precargar sprites
const spriteImages = {};
function preloadSprites() {
    console.log('Precargando sprites del jugador...');
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
}

// Actualizar sprite del jugador según dirección
function updatePlayerSprite(cellElement) {
    if (!spriteConfig.enabled || !cellElement) return;
    
    const direction = spriteConfig.currentDirection;
    const sprite = spriteImages[direction];
    
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
        img.style.zIndex = '6';

        // Reset anchors
        img.style.left = '';
        img.style.right = '';
        img.style.top = '';
        img.style.bottom = '';
        img.style.transform = '';

        switch (direction) {
            case 'left':
                // Anclar al borde izquierdo, centrado verticalmente de la celda
                img.style.left = '0';
                img.style.top = '50%';
                img.style.transform = 'translateY(-50%)';
                break;
            case 'right':
                // Anclar al borde derecho
                img.style.right = '0';
                img.style.top = '50%';
                img.style.transform = 'translateY(-50%)';
                break;
            case 'up':
                // Anclar al borde superior, centrado horizontalmente
                img.style.top = '0';
                img.style.left = '50%';
                img.style.transform = 'translateX(-50%)';
                break;
            case 'up-right':
                // Esquina superior derecha
                img.style.top = '0';
                img.style.right = '0';
                img.style.transform = 'translate(0, 0)';
                break;
            case 'up-left':
                // Esquina superior izquierda
                img.style.top = '0';
                img.style.left = '0';
                img.style.transform = 'translate(0, 0)';
                break;
            case 'down-right':
                // Esquina inferior derecha
                img.style.bottom = '0';
                img.style.right = '0';
                img.style.transform = 'translate(0, 0)';
                break;
            case 'down-left':
                // Esquina inferior izquierda
                img.style.bottom = '0';
                img.style.left = '0';
                img.style.transform = 'translate(0, 0)';
                break;
            case 'down':
            default:
                // Anclar al borde inferior, centrado horizontalmente
                img.style.bottom = '0';
                img.style.left = '50%';
                img.style.transform = 'translateX(-50%)';
                break;
        }

        cellElement.appendChild(img);
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

// Exportar funciones globales
window.updatePlayerSprite = updatePlayerSprite;
window.setPlayerDirection = setPlayerDirection;
window.updateDirectionFromMovement = updateDirectionFromMovement;

// Precargar al iniciar
preloadSprites();
