// ================================
// INTERFAZ DE USUARIO Y RENDERIZADO
// ================================
// Archivo: sl_ui.js
// Contiene todas las funciones de renderizado, actualización de UI e inicialización de mapas

// Elementos del DOM
const npcDialogue = document.getElementById('npc-dialogue');
const dialogueText = document.getElementById('dialogue-text');
const dialogueLogo = document.getElementById('dialogue-logo');
const muteBtn = document.getElementById('mute-btn');
const unlockNotification = document.getElementById('unlock-notification');

// Inicializar estado de un mapa
function initMapState(mapId) {
    const map = MAPS[mapId];
    if (!map) {
        console.error('❌ Mapa no encontrado:', mapId);
        return null;
    }
    
    console.log('🗺️ Inicializando mapa:', mapId);
    
    const mapState = {
        board: JSON.parse(JSON.stringify(map.layout)),
        playerPosition: { x: 0, y: 0 },
        collected: 0,
        collectibles: map.collectibles,
        requiredForExit: map.requiredForExit || map.collectibles,
        exitCount: map.exitCount || 0,
        npcInteracted: {},
        npcs: [],
        exits: map.exits || {}
    };
    
    // Identificar NPCs y salidas
    for (let y = 0; y < mapState.board.length; y++) {
        for (let x = 0; x < mapState.board[y].length; x++) {
            const cellValue = mapState.board[y][x];
            if (typeof cellValue === 'string') {
                if (CONFIG.NPC_NAMES.includes(cellValue)) {
                    mapState.npcs.push({ x, y, id: cellValue });
                    mapState.npcInteracted[cellValue] = false;
                }
            }
        }
    }
    
    console.log('👥 NPCs encontrados:', mapState.npcs.length);
    
    // Colocar al jugador en una posición válida
    placePlayer(mapState);
    
    console.log('👤 Jugador colocado en:', mapState.playerPosition);
    
    return mapState;
}

// Colocar al jugador en una posición válida
function placePlayer(mapState, entranceCell = null) {
    // Si se especifica una celda de entrada, colocar al jugador en una celda adyacente
    if (entranceCell) {
        // Primero: si existe un marcador de spawn específico (p0..p4) usarlo
        if (typeof entranceCell === 'string' && entranceCell.startsWith('p')) {
            for (let y = 0; y < mapState.board.length; y++) {
                for (let x = 0; x < mapState.board[y].length; x++) {
                    if (mapState.board[y][x] === entranceCell) {
                        mapState.board[y][x] = 'P';
                        mapState.playerPosition = { x, y };
                        return;
                    }
                }
            }
        }
        for (let y = 0; y < mapState.board.length; y++) {
            for (let x = 0; x < mapState.board[y].length; x++) {
                if (mapState.board[y][x] === entranceCell) {
                    // Buscar una celda vacía adyacente (arriba, derecha, abajo, izquierda)
                    const directions = [
                        { dx: 0, dy: -1 },  // arriba
                        { dx: 1, dy: 0 },   // derecha
                        { dx: 0, dy: 1 },   // abajo
                        { dx: -1, dy: 0 }   // izquierda
                    ];
                    
                    for (const dir of directions) {
                        const newX = x + dir.dx;
                        const newY = y + dir.dy;
                        
                        // Verificar límites y que sea una celda vacía
                        if (newX >= 0 && newX < mapState.board[0].length &&
                            newY >= 0 && newY < mapState.board.length &&
                            mapState.board[newY][newX] === 0) {
                            
                            mapState.board[newY][newX] = 'P';
                            mapState.playerPosition = { x: newX, y: newY };
                            return;
                        }
                    }
                    
                    // Si no hay celda vacía adyacente, buscar la más cercana
                    for (let radius = 2; radius <= 5; radius++) {
                        for (let dy = -radius; dy <= radius; dy++) {
                            for (let dx = -radius; dx <= radius; dx++) {
                                const newX = x + dx;
                                const newY = y + dy;
                                
                                if (newX >= 0 && newX < mapState.board[0].length &&
                                    newY >= 0 && newY < mapState.board.length &&
                                    mapState.board[newY][newX] === 0) {
                                    
                                    mapState.board[newY][newX] = 'P';
                                    mapState.playerPosition = { x: newX, y: newY };
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Si no hay celda de entrada o no se encontró, colocar aleatoriamente
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
        const x = Math.floor(Math.random() * (mapState.board[0].length - 2)) + 1;
        const y = Math.floor(Math.random() * (mapState.board.length - 2)) + 1;
        
        if (mapState.board[y][x] === 0) {
            mapState.board[y][x] = 'P';
            mapState.playerPosition = { x, y };
            placed = true;
        }
        attempts++;
    }
    
    // Si no se pudo colocar, usar posición predeterminada
    if (!placed) {
        for (let y = 1; y < mapState.board.length - 1; y++) {
            for (let x = 1; x < mapState.board[y].length - 1; x++) {
                if (mapState.board[y][x] === 0) {
                    mapState.board[y][x] = 'P';
                    mapState.playerPosition = { x, y };
                    // Al principio, el jugador debe mirar hacia abajo
                    if (window.setPlayerDirection) {
                        window.setPlayerDirection('down');
                    }
                    return;
                }
            }
        }
    }
}

// Actualizar solo las celdas del jugador (optimización para evitar recrear todo el tablero)
function updatePlayerCells(oldX, oldY, newX, newY) {
    const gameBoard = document.getElementById('game-board');
    const mapState = gameState.mapsState[gameState.currentMap];
    const map = MAPS[gameState.currentMap];
    
    if (!gameBoard || !mapState) return;
    
    const BOARD_WIDTH = mapState.board[0].length;
    
    // Función auxiliar para obtener la celda del DOM
    function getCellAt(x, y) {
        const index = y * BOARD_WIDTH + x;
        return gameBoard.children[index];
    }
    
    // Actualizar celda antigua (ahora vacía)
    const oldCell = getCellAt(oldX, oldY);
    if (oldCell) {
        oldCell.className = 'cell empty';
        oldCell.innerHTML = '';
    }
    
    // Actualizar celda nueva (ahora con jugador)
    const newCell = getCellAt(newX, newY);
    if (newCell) {
        newCell.className = 'cell player';
        newCell.innerHTML = '';
        // Aplicar sprite direccional
        if (window.updatePlayerSprite) {
            window.updatePlayerSprite(newCell);
        }
    }
}

// Actualizar el tablero en la interfaz
function updateBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    const mapState = gameState.mapsState[gameState.currentMap];
    if (!mapState) {
        console.error('❌ MapState no encontrado para:', gameState.currentMap);
        return;
    }
    
    console.log('🎮 Actualizando tablero. Posición jugador:', mapState.playerPosition);
    
    const board = mapState.board;
    const map = MAPS[gameState.currentMap];
    
    let playerFound = false;
    
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            const cellValue = board[y][x];
            
            switch (cellValue) {
                case 0:
                    cell.className += ' empty';
                    break;
                case 1:
                    cell.className += ' wall';
                    break;
                case 'P':
                    cell.className += ' player';
                    playerFound = true;
                    // Aplicar sprite direccional
                    if (window.updatePlayerSprite) {
                        window.updatePlayerSprite(cell);
                    }
                    break;
                default:
                    // Celdas de marcador de spawn (p0..p4) se renderizan como vacías
                    if (typeof cellValue === 'string' && cellValue.startsWith('p')) {
                        cell.className += ' empty';
                        break;
                    }
                    // Verificar si es una salida
                    if (typeof cellValue === 'string' && cellValue.startsWith('s')) {
                        const exitInfo = map.exits[cellValue];
                        if (exitInfo && exitInfo.unlocked) {
                            cell.className += ' exit';
                        } else {
                            cell.className += ' exit'; // Mostrar siempre las salidas bloqueadas también
                        }
                    }
                    // Verificar si es un NPC
                    else if (CONFIG.NPC_NAMES.includes(cellValue)) {
                        const npcId = cellValue;
                        const interacted = !!mapState.npcInteracted[npcId];
                        if (interacted) {
                            cell.className += ' npc interacted ' + npcId.toLowerCase();
                        } else {
                            cell.className += ' npc ' + npcId.toLowerCase();
                        }
                        // Aplicar sprite de NPC según estado
                        if (window.applyNPCSprite) {
                            window.applyNPCSprite(cell, npcId, interacted);
                        }
                    }
                    break;
            }
            
            gameBoard.appendChild(cell);
        }
    }
    
    if (!playerFound) {
        console.error('❌ ¡JUGADOR NO ENCONTRADO EN EL TABLERO!');
        console.log('Contenido del tablero en posición del jugador:', board[mapState.playerPosition.y][mapState.playerPosition.x]);
    } else {
        console.log('✅ Jugador renderizado correctamente');
    }
}

// Asegura que la celda del jugador esté visible en el contenedor (autoscroll / centrar)
function ensurePlayerVisible() {
    const boardContainer = document.querySelector('.game-board-container');
    const playerElem = document.querySelector('.game-board .player');
    if (!boardContainer || !playerElem) return;

    // Preferimos usar scrollIntoView centrando la celda; si falla, usamos cálculo manual
    try {
        playerElem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } catch (e) {
        const containerRect = boardContainer.getBoundingClientRect();
        const offsetTop = playerElem.offsetTop - (containerRect.height / 2) + (playerElem.offsetHeight / 2);
        const offsetLeft = playerElem.offsetLeft - (containerRect.width / 2) + (playerElem.offsetWidth / 2);
        boardContainer.scrollTo({ top: Math.max(0, offsetTop), left: Math.max(0, offsetLeft), behavior: 'smooth' });
    }
}

// Actualizar la información del juego
function updateInfo() {
    const mapState = gameState.mapsState[gameState.currentMap];
    if (!mapState) return;
    
    document.getElementById('collectibles-count').textContent = 
        `${mapState.collected}/${mapState.collectibles}`;
    
    document.getElementById('current-map').textContent = 
        MAPS[gameState.currentMap].name;
    
    // Calcular salidas desbloqueadas
    const map = MAPS[gameState.currentMap];
    let unlockedExits = 0;
    for (const exitId in map.exits) {
        if (map.exits[exitId].unlocked) {
            unlockedExits++;
        }
    }
    
    document.getElementById('exits-count').textContent = 
        `${unlockedExits}/${mapState.exitCount}`;
}

// Mostrar diálogo de NPC
function showNPCDialogue(message) {
    gameState.dialogueActive = true;
    dialogueText.textContent = message;
    npcDialogue.style.display = 'flex';
    
    // Añadir evento click para cerrar el diálogo
    npcDialogue.onclick = function(e) {
        closeNPCDialogue();
    };
}

// Cerrar diálogo de NPC
function closeNPCDialogue() {
    gameState.dialogueActive = false;
    npcDialogue.style.display = 'none';
    // Remover el evento click
    if (npcDialogue) {
        npcDialogue.onclick = null;
    }
}

// Mostrar notificación de desbloqueo
function showUnlockNotification(message) {
    unlockNotification.textContent = message;
    unlockNotification.style.display = 'block';
    
    setTimeout(() => {
        unlockNotification.style.display = 'none';
    }, 3000);
}

// Inicializar el juego
function initGame() {
    gameState.currentMap = 'mapa0';
    gameState.mapsState = {};
    gameState.dialogueActive = false;
    gameState.inventory = [];
    gameState.unlockedExits = [];
    
    // Inicializar SOLO el mapa inicial (mapa0)
    gameState.mapsState['mapa0'] = initMapState('mapa0');
    
    // Configurar salida s0 como desbloqueada en todos los mapas excepto mapa0
    for (const mapId in MAPS) {
        if (mapId !== 'mapa0' && MAPS[mapId].exits['s0']) {
            MAPS[mapId].exits['s0'].unlocked = true;
        }
    }
    
    // Cerrar diálogo si está abierto
    closeNPCDialogue();
    
    // Configurar interfaz
    document.getElementById('current-map').textContent = MAPS['mapa0'].name;
    
    // Configurar fondo del game-board
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.backgroundImage = `url('${MAPS['mapa0'].background}')`;
    
    // Asegurar que el jugador inicie mirando hacia abajo ANTES de actualizar el tablero
    if (window.setPlayerDirection) {
        window.setPlayerDirection('down');
    }
    
    // Actualizar interfaz
    updateBoard();
    updateInfo();
    
    // Forzar actualización del sprite del jugador después del render
    setTimeout(() => {
        if (window.setPlayerDirection) {
            window.setPlayerDirection('down');
        }
        const playerCell = document.querySelector('.cell.player');
        if (playerCell && window.updatePlayerSprite) {
            window.updatePlayerSprite(playerCell);
        }
    }, 100);
    
    // Ocultar mensaje de fin de juego
    document.getElementById('game-message').style.display = 'none';
}

