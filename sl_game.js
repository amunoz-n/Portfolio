// ================================
// LÓGICA DEL JUEGO
// ================================
// Archivo: sl_game.js
// Contiene todas las funciones de interacción, movimiento y lógica del juego

// Verificar si el jugador está adyacente a un NPC
function isPlayerAdjacentToNPC() {
    const mapState = gameState.mapsState[gameState.currentMap];
    if (!mapState) return null;
    
    const playerX = mapState.playerPosition.x;
    const playerY = mapState.playerPosition.y;
    
    // Verificar las 4 direcciones alrededor del jugador
    const directions = [
        { dx: 0, dy: -1 },  // arriba
        { dx: 1, dy: 0 },   // derecha
        { dx: 0, dy: 1 },   // abajo
        { dx: -1, dy: 0 }   // izquierda
    ];
    
    for (const dir of directions) {
        const checkX = playerX + dir.dx;
        const checkY = playerY + dir.dy;
        
        // Verificar límites
        if (checkX >= 0 && checkX < mapState.board[0].length && 
            checkY >= 0 && checkY < mapState.board.length) {
            
            const cellValue = mapState.board[checkY][checkX];
            if (CONFIG.NPC_NAMES.includes(cellValue)) {
                return { x: checkX, y: checkY, id: cellValue };
            }
        }
    }
    
    return null;
}

// Interactuar con un NPC
function interactWithNPC(npcPosition) {
    if (!npcPosition) return;
    
    const mapState = gameState.mapsState[gameState.currentMap];
    const map = MAPS[gameState.currentMap];
    
    const isFirstInteraction = !mapState.npcInteracted[npcPosition.id];
    
    // Verificar si el jugador tiene nombre (ha completado la aventura de Duku)
    const hasName = graphicAdventureState.completed;
    
    if (isFirstInteraction) {
        // Si no tiene nombre y no es Duku, mostrar mensajes especiales
        if (!hasName && npcPosition.id !== "Duku") {
            let noNameMessage = "";
            
            switch(npcPosition.id) {
                case "Rafael":
                    noNameMessage = "Pero, ¿Estas tonto chaval, cómo sales asi a la calle? Menudo innombrable estás hecho";
                    break;
                case "Ana":
                    noNameMessage = "¡Tolai! ¡¿A donde vas que te le pareces al Cthulu ese?!";
                    break;
                case "Seba":
                    noNameMessage = "Tenga 5 pesetas, comprese un nombre y juegue.";
                    break;
                case "Domingo":
                    noNameMessage = "Pero la duda es, ¿Por qué _____ tú eres tan feo y eres un no-name de mierda y yo soy tan feo me cepillo cada noche los dientes?";
                    break;
                case "MariaJuana":
                    noNameMessage = "Pero chiquillo... Si hasta el que no puede ser nombrado sabe todo el mundo como se llama, ¿Como vas por ahí sin nombre?";
                    break;
                case "Carmela":
                    noNameMessage = "Dime niño, ¿de quién eres? Y asi vestido... ¡Qué espanto! No le preguntes a Maria, mejor al Conde te mando.";
                    break;
                case "Elena":
                    noNameMessage = "Sin nombre no hay trato, forastero. Busca primero a Duku.";
                    break;
                case "Carlos":
                    noNameMessage = "Las minas no son lugar para anónimos. Consigue un nombre primero.";
                    break;
                case "Laura":
                    noNameMessage = "Las flores solo florecen para quienes tienen identidad. Vuelve cuando tengas nombre.";
                    break;
                default:
                    noNameMessage = "Sin nombre no puedo ayudarte. Habla con Duku primero.";
            }
            
            showNPCDialogue(noNameMessage);
            audioSystem.playNPCInteraction(npcPosition.id, false);
            return;
        }
        
        mapState.npcInteracted[npcPosition.id] = true;
        mapState.collected++;
        
        audioSystem.playNPCInteraction(npcPosition.id, true);
        
        // Diálogos específicos para cada NPC
        let message = "";
        let specialItem = null;
        
        switch(npcPosition.id) {
            case "Rafael":
                message = "¡Hola! Soy Rafael, estoy esperando a mi hijo ÁLVARO. ¡Seguro que ya mismo llega! Te doy una GEMA DEL TIEMPO.";
                specialItem = 'gema_tiempo';
                break;
            case "Ana":
                message = "Hola, soy Ana. Me encanta ayudar a los viajeros. ¡Toma esta GEMA DEL ESPACIO!";
                specialItem = 'gema_espacio';
                break;
            case "Seba":
                message = "¡Qué tal! Soy Seba. Estoy buscando nuevas aventuras. Esta GEMA DE LA ENERGÍA te servirá.";
                specialItem = 'gema_energia';
                break;
            case "Domingo":
                message = "Buenas, me llamo Domingo. Llevo años en este laberinto. Toma esta GEMA DE LA MATERIA como regalo.";
                specialItem = 'gema_materia';
                break;
            case "MariaJuana":
                message = "Hola, soy María Juana. Soy la guardiana final. ¡Toma la GEMA DEL ESPÍRITU y completa el conjunto!";
                specialItem = 'gema_espiritu';
                break;
            case "Duku":
                // Duku abre una aventura gráfica en lugar de dar el ítem directamente
                openGraphicAdventure();
                return; // Salir sin mostrar diálogo normal
            case "Elena":
                message = "Hola, soy Elena. Aquí tienes la otra MITAD DE LA LLAVE DEL BOSQUE. Únelas para abrir el camino.";
                specialItem = 'mitad_llave_bosque';
                break;
            case "Carlos":
                message = "Soy Carlos, el minero. Este MINERAL PURO es muy valioso. Te ayudará en las minas.";
                specialItem = 'mineral_puro';
                break;
            case "Laura":
                message = "¡Bienvenido! Soy Laura, la cuidadora del jardín. Esta FLOR ETERNA tiene propiedades mágicas.";
                specialItem = 'flor_eterna';
                break;
            case "Carmela":
                message = "Hola, soy Carmela. Encantada de conocerte. ¡Sigue explorando!";
                specialItem = null;
                break;
            default:
                message = "Hola, aquí tienes un objeto especial.";
                specialItem = 'objeto_generico';
        }
        
        // Añadir objeto especial al inventario si existe
        if (specialItem) {
            gameState.inventory.push(specialItem);
            
            // Verificar si se han completado combinaciones
            checkSpecialCombinations();
        }
        
        showNPCDialogue(message);
        
        // Verificar si se han completado los objetivos del mapa
        checkMapCompletion();
        
        updateBoard();
        updateInfo();
    } else {
        audioSystem.playNPCInteraction(npcPosition.id, false);
        
        // Mensajes de interacción posterior
        let message = "";
        switch(npcPosition.id) {
            case "Rafael":
                message = "¿Qué miras CARAPAPA? ¡Sigue explorando! Mi hijo ÁLVARO ya llegará.";
                break;
            case "Ana":
                message = "Ya te di mi gema. ¡Sigue tu camino!";
                break;
            case "Seba":
                message = "Ya te ayudé. ¡Ahora a por la siguiente aventura!";
                break;
            case "Domingo":
                message = "Ya te di todo lo que tenía. ¡Buena suerte!";
                break;
            case "MariaJuana":
                message = "Esa fue mi última gema. ¡Ve hacia la salida!";
                break;
            case "Duku":
                message = "Ya completaste mi aventura. Busca a Elena para la otra mitad de la llave.";
                break;
            case "Elena":
                message = "¿Ya tienes ambas mitades? ¡Únelas para abrir el camino!";
                break;
            case "Carlos":
                message = "Ese mineral es muy valioso. ¡Cuídalo bien!";
                break;
            case "Laura":
                message = "La flor eterna nunca se marchita. ¡Es un regalo especial!";
                break;
            case "Carmela":
                message = "Nos volvemos a ver. ¡Ánimo en tu aventura!";
                break;
            default:
                message = "Ya te di mi objeto...";
        }
        
        showNPCDialogue(message);
    }
}

// Verificar combinaciones especiales de objetos
function checkSpecialCombinations() {
    const inventory = gameState.inventory;
    
    // Mapa 0: Completar todas las gemas
    if (inventory.includes('gema_tiempo') && 
        inventory.includes('gema_espacio') && 
        inventory.includes('gema_energia') && 
        inventory.includes('gema_materia') && 
        inventory.includes('gema_espiritu')) {
        
        // Desbloquear salidas del mapa 0
        const mapa0 = MAPS['mapa0'];
        for (const exitId in mapa0.exits) {
            if (exitId !== 's0') {
                mapa0.exits[exitId].unlocked = true;
                if (!gameState.unlockedExits.includes(exitId)) {
                    gameState.unlockedExits.push(exitId);
                }
            }
        }
        
        showUnlockNotification("¡Todas las gemas completadas! Salidas desbloqueadas.");
        audioSystem.playUnlock();
        updateInfo();
    }
    
    // Mapa 1: Completar llave del bosque
    const mitadesLlave = inventory.filter(item => item === 'mitad_llave_bosque');
    if (mitadesLlave.length >= 2) {
        const mapa1 = MAPS['mapa1'];
        if (mapa1 && mapa1.exits['s4']) {
            mapa1.exits['s4'].unlocked = true;
            if (!gameState.unlockedExits.includes('s4')) {
                gameState.unlockedExits.push('s4');
                showUnlockNotification("¡Llave del bosque completada! Nueva salida desbloqueada.");
                audioSystem.playUnlock();
                updateInfo();
            }
        }
    }
    
    // Desbloquear salidas de regreso al mapa0 con objetos especiales
    if (inventory.includes('mineral_puro')) {
        const mapa2 = MAPS['mapa2'];
        if (mapa2 && mapa2.exits['s5']) {
            mapa2.exits['s5'].unlocked = true;
            if (!gameState.unlockedExits.includes('s5')) {
                gameState.unlockedExits.push('s5');
                showUnlockNotification("¡Mineral puro obtenido! Salida de regreso desbloqueada.");
                audioSystem.playUnlock();
                updateInfo();
            }
        }
    }
    
    if (inventory.includes('llave_espada')) {
        const mapa3 = MAPS['mapa3'];
        if (mapa3 && mapa3.exits['s6']) {
            mapa3.exits['s6'].unlocked = true;
            if (!gameState.unlockedExits.includes('s6')) {
                gameState.unlockedExits.push('s6');
                showUnlockNotification("¡La Llave Espada obtenida! Salida de regreso desbloqueada.");
                audioSystem.playUnlock();
                updateInfo();
            }
        }
    }
    
    if (inventory.includes('flor_eterna')) {
        const mapa4 = MAPS['mapa4'];
        if (mapa4 && mapa4.exits['s7']) {
            mapa4.exits['s7'].unlocked = true;
            if (!gameState.unlockedExits.includes('s7')) {
                gameState.unlockedExits.push('s7');
                showUnlockNotification("¡Flor eterna obtenida! Salida de regreso desbloqueada.");
                audioSystem.playUnlock();
                updateInfo();
            }
        }
    }
}

// Verificar si se ha completado el mapa
function checkMapCompletion() {
    const mapState = gameState.mapsState[gameState.currentMap];
    if (!mapState) return;
    
    if (mapState.collected >= mapState.requiredForExit) {
        // El mapa está completado
        const map = MAPS[gameState.currentMap];
        
        // Desbloquear salidas especiales si es necesario
        for (const exitId in map.exits) {
            const exit = map.exits[exitId];
            if (exit.requiredItem && gameState.inventory.includes(exit.requiredItem)) {
                exit.unlocked = true;
                if (!gameState.unlockedExits.includes(exitId)) {
                    gameState.unlockedExits.push(exitId);
                    showUnlockNotification(`¡Salida ${exitId} desbloqueada!`);
                    audioSystem.playUnlock();
                }
            }
        }
        
        updateInfo();
    }
}

// Cambiar de mapa
function changeMap(exitId) {
    const currentMap = MAPS[gameState.currentMap];
    if (!currentMap || !currentMap.exits[exitId]) {
        console.error(`Salida no encontrada: ${exitId}`);
        return;
    }
    
    const exit = currentMap.exits[exitId];
    
    // Verificar si la salida está desbloqueada
    if (!exit.unlocked) {
        let message = "Esta salida está bloqueada. ";
        
        if (exit.requiredItem) {
            message += `Necesitas: ${getItemName(exit.requiredItem)}`;
        } else {
            const mapState = gameState.mapsState[gameState.currentMap];
            const remaining = mapState.requiredForExit - mapState.collected;
            message += `Completa ${remaining} objetivo(s) más.`;
        }
        
        showNPCDialogue(message);
        return;
    }
    
    const targetMap = exit.target;
    const originMap = gameState.currentMap;
    
    // Guardar estado del mapa actual
    gameState.mapsState[gameState.currentMap] = gameState.mapsState[gameState.currentMap];
    
    // Cambiar al nuevo mapa
    gameState.currentMap = targetMap;
    
    // Determinar celda de entrada según el mapa de origen
    let entranceCell = null;
    if (originMap === 'mapa0') {
        entranceCell = 's0';
    } else if (originMap === 'mapa1') {
        entranceCell = 's1';
    } else if (originMap === 'mapa2') {
        entranceCell = 's2';
    } else if (originMap === 'mapa3') {
        entranceCell = 's3';
    } else if (originMap === 'mapa4') {
        entranceCell = 's4';
    }
    
    // Cargar estado del nuevo mapa si no existe
    if (!gameState.mapsState[targetMap]) {
        gameState.mapsState[targetMap] = initMapState(targetMap);
        // Colocar al jugador en la celda de entrada correspondiente
        if (entranceCell) {
            const mapState = gameState.mapsState[targetMap];
            // Limpiar la posición anterior del jugador si existe
            for (let y = 0; y < mapState.board.length; y++) {
                for (let x = 0; x < mapState.board[y].length; x++) {
                    if (mapState.board[y][x] === 'P') {
                        mapState.board[y][x] = 0;
                    }
                }
            }
            placePlayer(mapState, entranceCell);
        }
    } else {
        // Si el mapa ya existe, reposicionar al jugador en la entrada
        if (entranceCell) {
            const mapState = gameState.mapsState[targetMap];
            // Limpiar la posición anterior del jugador
            const oldPos = mapState.playerPosition;
            mapState.board[oldPos.y][oldPos.x] = 0;
            // Colocar en la nueva entrada
            placePlayer(mapState, entranceCell);
        }
    }
    
    // Reproducir sonido
    audioSystem.playMapChange();
    
    // Actualizar interfaz
    updateBoard();
    updateInfo();
    ensurePlayerVisible();
    
    // Actualizar información del mapa
    document.getElementById('current-map').textContent = MAPS[targetMap].name;
    
    // Cambiar fondo del game-board
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.backgroundImage = `url('${MAPS[targetMap].background}')`;
}

// Obtener nombre legible de un objeto
function getItemName(itemId) {
    const names = {
        'gema_tiempo': 'Gema del Tiempo',
        'gema_espacio': 'Gema del Espacio',
        'gema_energia': 'Gema de la Energía',
        'gema_materia': 'Gema de la Materia',
        'gema_espiritu': 'Gema del Espíritu',
        'gema_completa': 'Conjunto de Gemas Completo',
        'mitad_llave_bosque': 'Mitad de Llave del Bosque',
        'llave_bosque': 'Llave Completa del Bosque',
        'mineral_puro': 'Mineral Puro',
        'flor_eterna': 'Flor Eterna',
        'llave_espada': 'La Llave Espada'
    };
    
    return names[itemId] || itemId;
}

// Mover al jugador
function movePlayer(dx, dy, direction = null) {
    if (gameState.dialogueActive) return;
    
    const mapState = gameState.mapsState[gameState.currentMap];
    if (!mapState) return;
    
    // Actualizar dirección del sprite INMEDIATAMENTE, independientemente de si el movimiento es válido
    if (direction && window.setDirection) {
        window.setDirection(direction);
    } else if (window.updateDirectionFromMovement) {
        window.updateDirectionFromMovement(dx, dy);
    }
    
    // Actualizar el sprite visual del jugador en su posición actual
    const currentCell = document.querySelector('.game-board .player');
    if (currentCell && window.updatePlayerSprite) {
        window.updatePlayerSprite(currentCell);
    }
    
    const newX = mapState.playerPosition.x + dx;
    const newY = mapState.playerPosition.y + dy;
    
    // Verificar límites
    if (newX < 0 || newX >= mapState.board[0].length || 
        newY < 0 || newY >= mapState.board.length) {
        return;
    }
    
    const targetCell = mapState.board[newY][newX];
    
    // Verificar si es un muro
    if (targetCell === 1) {
        return;
    }
    
    // Verificar si es un NPC
    if (CONFIG.NPC_NAMES.includes(targetCell)) {
        interactWithNPC({ x: newX, y: newY, id: targetCell });
        return;
    }
    
    // Verificar si es una salida
    if (typeof targetCell === 'string' && targetCell.startsWith('s')) {
        changeMap(targetCell);
        return;
    }
    
    // Reproducir sonido de movimiento
    if (gameState.audioEnabled && audioSystem.effects.movement) {
        audioSystem.playSound(audioSystem.effects.movement);
    }
    
    // Guardar posición anterior
    const oldX = mapState.playerPosition.x;
    const oldY = mapState.playerPosition.y;
    
    // Mover al jugador
    mapState.board[oldY][oldX] = 0;
    mapState.playerPosition.x = newX;
    mapState.playerPosition.y = newY;
    mapState.board[newY][newX] = 'P';
    
    // Actualizar SOLO las celdas del jugador en lugar de recrear todo el tablero
    updatePlayerCells(oldX, oldY, newX, newY);
    ensurePlayerVisible();
}

// Alternar sonido
function toggleSound() {
    gameState.audioEnabled = !gameState.audioEnabled;
    if (typeof muteBtn !== 'undefined' && muteBtn) {
        muteBtn.textContent = gameState.audioEnabled ? '🔊 Sonido ON' : '🔇 Sonido OFF';
        muteBtn.style.borderColor = gameState.audioEnabled ? '#4cc9f0' : '#f72585';
    }
}

// ================================
// MENÚ DE INVENTARIO
// ================================

// Abrir/cerrar menú de inventario
function toggleInventoryMenu() {
    const menu = document.getElementById('inventory-menu');
    const isActive = menu.classList.contains('active');
    
    if (isActive) {
        closeInventoryMenu();
    } else {
        openInventoryMenu();
    }
}

// Abrir menú de inventario
function openInventoryMenu() {
    const menu = document.getElementById('inventory-menu');
    
    menu.style.display = 'block';
    setTimeout(() => {
        menu.classList.add('active');
    }, 10);
    
    gameState.dialogueActive = true;
    updateInventoryDisplay();
}

// Cerrar menú de inventario
function closeInventoryMenu() {
    const menu = document.getElementById('inventory-menu');
    
    menu.classList.remove('active');
    
    setTimeout(() => {
        menu.style.display = 'none';
        gameState.dialogueActive = false;
    }, 300);
}

// Actualizar visualización del inventario
function updateInventoryDisplay() {
    const gemasContainer = document.getElementById('inventory-gemas');
    const especialesContainer = document.getElementById('inventory-especiales');
    const playerNameElement = document.getElementById('inventory-player-name');
    
    // Actualizar nombre del jugador
    if (playerNameElement) {
        if (graphicAdventureState.completed && graphicAdventureState.playerName) {
            playerNameElement.textContent = graphicAdventureState.playerName;
            playerNameElement.classList.add('has-name');
        } else {
            playerNameElement.textContent = 'Aún no lo recuerdas...';
            playerNameElement.classList.remove('has-name');
        }
    }
    
    // Actualizar estadísticas del menú
    const menuMapElement = document.getElementById('menu-current-map');
    const menuItemCountElement = document.getElementById('menu-item-count');
    const menuExitsCountElement = document.getElementById('menu-exits-count');
    
    if (menuMapElement) {
        // Solo mostrar el nombre del mapa si el jugador lo ha visitado
        const visitedMaps = Object.keys(gameState.mapsState);
        const isCurrentMapVisited = visitedMaps.includes(gameState.currentMap);
        menuMapElement.textContent = isCurrentMapVisited ? (MAPS[gameState.currentMap]?.name || 'Desconocido') : '¿¿¿¿¿?????';
    }
    
    if (menuItemCountElement) {
        menuItemCountElement.textContent = gameState.inventory.length;
    }
    
    if (menuExitsCountElement) {
        menuExitsCountElement.textContent = gameState.unlockedExits.length;
    }
    
    // Actualizar listas desplegables
    updateMapsList();
    updateObjectsList();
    updateExitsList();
    updateGemasList();
    
    // Definir gemas y objetos especiales
    const gemas = [
        { id: 'gema_tiempo', name: 'Gema del Tiempo', icon: '⏱️' },
        { id: 'gema_espacio', name: 'Gema del Espacio', icon: '🌌' },
        { id: 'gema_energia', name: 'Gema de la Energía', icon: '⚡' },
        { id: 'gema_materia', name: 'Gema de la Materia', icon: '💎' },
        { id: 'gema_espiritu', name: 'Gema del Espíritu', icon: '✨' }
    ];
    
    const especiales = [
        { id: 'mitad_llave_bosque', name: 'Mitad Llave Bosque', icon: '🗝️' },
        { id: 'llave_bosque', name: 'Llave del Bosque', icon: '🔑' },
        { id: 'mineral_puro', name: 'Mineral Puro', icon: '⛏️' },
        { id: 'llave_espada', name: 'Llave Espada', icon: '⚔️' },
        { id: 'flor_eterna', name: 'Flor Eterna', icon: '🌸' }
    ];
    
    // Limpiar contenedores
    gemasContainer.innerHTML = '';
    especialesContainer.innerHTML = '';
    
    // Mostrar gemas
    const gemasEnInventario = gemas.filter(gema => gameState.inventory.includes(gema.id));
    if (gemasEnInventario.length === 0) {
        gemasContainer.innerHTML = '<div class="inventory-empty">No tienes gemas aún</div>';
    } else {
        gemasEnInventario.forEach(gema => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `
                <div class="inventory-item-icon">${gema.icon}</div>
                <div class="inventory-item-name">${gema.name}</div>
            `;
            gemasContainer.appendChild(itemDiv);
        });
    }
    
    // Mostrar objetos especiales (con contador para mitad_llave_bosque)
    const especialesEnInventario = [];
    const llaveCount = gameState.inventory.filter(item => item === 'mitad_llave_bosque').length;
    
    especiales.forEach(especial => {
        if (especial.id === 'mitad_llave_bosque') {
            if (llaveCount > 0) {
                especialesEnInventario.push({
                    ...especial,
                    name: `${especial.name} (x${llaveCount})`
                });
            }
        } else if (gameState.inventory.includes(especial.id)) {
            especialesEnInventario.push(especial);
        }
    });
    
    if (especialesEnInventario.length === 0) {
        especialesContainer.innerHTML = '<div class="inventory-empty">No tienes objetos especiales aún</div>';
    } else {
        especialesEnInventario.forEach(especial => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `
                <div class="inventory-item-icon">${especial.icon}</div>
                <div class="inventory-item-name">${especial.name}</div>
            `;
            especialesContainer.appendChild(itemDiv);
        });
    }
}

// Actualizar lista de mapas
function updateMapsList() {
    const mapsList = document.getElementById('maps-list');
    if (!mapsList) return;
    
    mapsList.innerHTML = '';
    
    // Obtener todos los mapas visitados
    const visitedMaps = Object.keys(gameState.mapsState);
    
    Object.keys(MAPS).forEach(mapId => {
        const li = document.createElement('li');
        const isVisited = visitedMaps.includes(mapId);
        const isCurrent = mapId === gameState.currentMap;
        
        li.textContent = isVisited ? MAPS[mapId].name : '¿¿¿¿¿?????';
        li.className = isCurrent ? 'current-map' : '';
        
        // Si el mapa está visitado y no es el actual, hacerlo clickeable para teletransportarse
        if (isVisited && !isCurrent) {
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => {
                teleportToMap(mapId);
            });
        }
        
        mapsList.appendChild(li);
    });
}

// Teletransportarse a un mapa desde el menú
function teleportToMap(mapId) {
    if (!MAPS[mapId]) {
        console.error(`El mapa ${mapId} no existe`);
        return;
    }
    
    // Inicializar el mapa si no existe
    if (!gameState.mapsState[mapId]) {
        gameState.mapsState[mapId] = initializeMap(mapId);
    }
    
    // Cambiar al mapa
    gameState.currentMap = mapId;
    
    // Buscar un spawn point (p0-p4 o s0-s7) para posicionar al jugador
    const mapData = gameState.mapsState[mapId];
    let spawnFound = false;
    
    // Intentar encontrar un spawn point
    for (let y = 0; y < mapData.length; y++) {
        for (let x = 0; x < mapData[y].length; x++) {
            const cell = mapData[y][x];
            if (cell && (cell.startsWith('p') || cell.startsWith('s')) && cell.match(/^[ps]\d+$/)) {
                gameState.player.x = x;
                gameState.player.y = y;
                spawnFound = true;
                break;
            }
        }
        if (spawnFound) break;
    }
    
    // Si no hay spawn point, buscar la primera celda vacía
    if (!spawnFound) {
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[y].length; x++) {
                const cell = mapData[y][x];
                if (cell === '0') {
                    gameState.player.x = x;
                    gameState.player.y = y;
                    spawnFound = true;
                    break;
                }
            }
            if (spawnFound) break;
        }
    }
    
    // Actualizar información del mapa
    document.getElementById('current-map').textContent = MAPS[mapId].name;
    
    // Cambiar fondo del game-board
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.backgroundImage = `url('${MAPS[mapId].background}')`;
    
    // Actualizar el tablero
    updateBoard();
    updateInfo();
    ensurePlayerVisible();
    
    // Cerrar el menú
    closeInventoryMenu();
}

// Actualizar lista de objetos
// Actualizar lista de objetos con subsección de especiales
function updateObjectsList() {
    const objectsList = document.getElementById('objects-list');
    const especialesSublist = document.getElementById('objects-especiales-sublist');
    if (!objectsList || !especialesSublist) return;
    
    // Limpiar solo la parte de objetos especiales
    especialesSublist.innerHTML = '';
    
    // Solo objetos especiales (no gemas)
    const specialItems = [
        { id: 'mitad_llave_bosque', name: 'Mitad Llave Bosque', icon: '🗝️' },
        { id: 'llave_bosque', name: 'Llave del Bosque', icon: '🔑' },
        { id: 'mineral_puro', name: 'Mineral Puro', icon: '⛏️' },
        { id: 'llave_espada', name: 'Llave Espada', icon: '⚔️' },
        { id: 'flor_eterna', name: 'Flor Eterna', icon: '🌸' }
    ];
    
    // Obtener los objetos especiales que el jugador tiene
    const obtainedItems = [];
    const itemMap = {};
    specialItems.forEach(item => {
        itemMap[item.id] = item;
    });
    
    const reversedInventory = [...gameState.inventory].reverse();
    const processedIds = new Set();
    
    reversedInventory.forEach(itemId => {
        if (!processedIds.has(itemId) && itemMap[itemId]) {
            processedIds.add(itemId);
            const itemDef = itemMap[itemId];
            const count = gameState.inventory.filter(i => i === itemId).length;
            obtainedItems.push({
                ...itemDef,
                count: count
            });
        }
    });
    
    // Los objetos no obtenidos
    const notObtainedItems = specialItems.filter(item => !gameState.inventory.includes(item.id));
    
    // Mostrar objetos especiales
    obtainedItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `${item.icon} ${item.name}${item.count > 1 ? ' (x' + item.count + ')' : ''}`;
        especialesSublist.appendChild(li);
    });
    
    notObtainedItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = '❓ ?????';
        especialesSublist.appendChild(li);
    });
    
    // Actualizar contador total de objetos (especiales + gemas)
    const totalCount = gameState.inventory.length;
    document.getElementById('menu-item-count').textContent = totalCount;
}

// Actualizar lista de gemas
function updateGemasList() {
    const gemasList = document.getElementById('gemas-list');
    if (!gemasList) return;
    
    gemasList.innerHTML = '';
    
    const gemas = [
        { id: 'gema_tiempo', name: 'Gema del Tiempo', icon: '⏱️' },
        { id: 'gema_espacio', name: 'Gema del Espacio', icon: '🌌' },
        { id: 'gema_energia', name: 'Gema de la Energía', icon: '⚡' },
        { id: 'gema_materia', name: 'Gema de la Materia', icon: '💎' },
        { id: 'gema_espiritu', name: 'Gema del Espíritu', icon: '✨' }
    ];
    
    const gemasObtenidas = gemas.filter(gema => gameState.inventory.includes(gema.id));
    const gemasNoObtenidas = gemas.filter(gema => !gameState.inventory.includes(gema.id));
    
    // Mostrar gemas obtenidas
    gemasObtenidas.forEach(gema => {
        const li = document.createElement('li');
        li.innerHTML = `${gema.icon} ${gema.name}`;
        gemasList.appendChild(li);
    });
    
    // Mostrar gemas no obtenidas
    gemasNoObtenidas.forEach(gema => {
        const li = document.createElement('li');
        li.innerHTML = '❓ ?????';
        gemasList.appendChild(li);
    });
    
    // Actualizar contador de gemas
    document.getElementById('menu-gemas-count').textContent = `${gemasObtenidas.length}/${gemas.length}`;
}

// Actualizar lista de salidas
function updateExitsList() {
    const exitsList = document.getElementById('exits-list');
    if (!exitsList) return;
    
    exitsList.innerHTML = '';
    
    // Obtener todas las salidas posibles del juego
    const allPossibleExits = [];
    Object.keys(MAPS).forEach(mapId => {
        const map = MAPS[mapId];
        if (map.exits) {
            Object.entries(map.exits).forEach(([exitId, exitData]) => {
                const fullExitId = `${mapId}_${exitId}`;
                if (!allPossibleExits.find(e => e.id === fullExitId)) {
                    allPossibleExits.push({
                        id: fullExitId,
                        name: `${map.name} → ${exitData.description || 'Salida'}`,
                        mapId: mapId,
                        exitId: exitId
                    });
                }
            });
        }
    });
    
    allPossibleExits.forEach(exit => {
        const li = document.createElement('li');
        const isUnlocked = gameState.unlockedExits.includes(exit.exitId);
        
        li.textContent = isUnlocked ? exit.name : '🔒 ?????';
        exitsList.appendChild(li);
    });
}

// Toggle para mostrar/ocultar listas
function toggleStatList(listId) {
    const list = document.getElementById(listId);
    if (!list) return;
    
    const isCurrentlyVisible = list.classList.contains('list-visible');
    
    // Cerrar todas las listas
    document.querySelectorAll('.stat-list').forEach(l => {
        l.classList.remove('list-visible');
        // Esperar a que termine la animación antes de ocultar
        setTimeout(() => {
            if (!l.classList.contains('list-visible')) {
                l.style.display = 'none';
            }
        }, 300);
    });
    
    // Si la lista no estaba visible, abrirla
    if (!isCurrentlyVisible) {
        // Primero establecer display block
        list.style.display = 'block';
        
        // Luego añadir la clase para animar
        setTimeout(() => {
            list.classList.add('list-visible');
        }, 10);
    }
}

// Event listeners para cerrar el menú
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('inventory-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInventoryMenu);
    }
    
    // Botones de guardar, cargar y reiniciar
    const saveBtn = document.getElementById('save-game-btn');
    const loadBtn = document.getElementById('load-game-btn');
    const resetBtn = document.getElementById('reset-game-btn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveGame);
    }
    
    if (loadBtn) {
        loadBtn.addEventListener('click', loadGame);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }
    
    // Event listeners para los stat-items clickeables
    const mapStatItem = document.querySelector('.stat-item[data-list="maps-list"]');
    const objectsStatItem = document.querySelector('.stat-item[data-list="objects-list"]');
    const exitsStatItem = document.querySelector('.stat-item[data-list="exits-list"]');
    const memoryCardStatItem = document.querySelector('.stat-item[data-list="memory-card-list"]');
    const gemasStatItem = document.querySelector('.stat-item[data-list="gemas-list"]');
    const controlesStatItem = document.querySelector('.stat-item[data-list="controles-list"]');
    const openRadioBtn = document.getElementById('open-radio-btn');
    
    if (mapStatItem) {
        mapStatItem.addEventListener('click', () => toggleStatList('maps-list'));
    }
    
    if (objectsStatItem) {
        objectsStatItem.addEventListener('click', () => toggleStatList('objects-list'));
    }
    
    if (exitsStatItem) {
        exitsStatItem.addEventListener('click', () => toggleStatList('exits-list'));
    }
    
    if (memoryCardStatItem) {
        memoryCardStatItem.addEventListener('click', () => toggleStatList('memory-card-list'));
    }
    
    if (gemasStatItem) {
        gemasStatItem.addEventListener('click', () => toggleStatList('gemas-list'));
    }
    
    if (controlesStatItem) {
        controlesStatItem.addEventListener('click', () => toggleStatList('controles-list'));
    }
    
    if (openRadioBtn) {
        openRadioBtn.addEventListener('click', openRadioMenu);
    }
    
    // Event listeners para ventana de Radio
    const radioCloseBtn = document.getElementById('radio-close-btn');
    const toggleSoundBtnRadio = document.getElementById('toggle-sound-btn-radio');
    const toggleMusicBtnRadio = document.getElementById('toggle-music-btn-radio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const randomBtn = document.getElementById('random-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    
    if (radioCloseBtn) {
        radioCloseBtn.addEventListener('click', closeRadioMenu);
    }
    
    if (toggleSoundBtnRadio) {
        toggleSoundBtnRadio.addEventListener('click', toggleGameSound);
    }
    
    if (toggleMusicBtnRadio) {
        toggleMusicBtnRadio.addEventListener('click', toggleBackgroundMusic);
    }
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    if (randomBtn) {
        randomBtn.addEventListener('click', toggleRandom);
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            updateVolume(volume);
            if (volumeValue) {
                volumeValue.textContent = `${volume}%`;
            }
        });
    }
    
    // Cargar playlist al iniciar
    loadPlaylist();
})

// ================================
// SISTEMA DE GUARDADO/CARGA
// ================================

// Guardar partida
function saveGame() {
    try {
        const saveData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            gameState: {
                currentMap: gameState.currentMap,
                mapsState: gameState.mapsState,
                inventory: gameState.inventory,
                unlockedExits: gameState.unlockedExits,
                audioEnabled: gameState.audioEnabled
            },
            graphicAdventureState: {
                completed: graphicAdventureState.completed,
                playerName: graphicAdventureState.playerName
            }
        };
        
        // Guardar en localStorage
        localStorage.setItem('so_long_save', JSON.stringify(saveData));
        
        // Mostrar notificación
        showUnlockNotification('💾 ¡Partida guardada exitosamente!');
        
        // Reproducir sonido de éxito
        if (gameState.audioEnabled) {
            audioSystem.playUnlock();
        }
        
        console.log('✅ Partida guardada:', saveData);
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        showNPCDialogue('Error al guardar la partida. Por favor, intenta de nuevo.');
    }
}

// Cargar partida
function loadGame() {
    try {
        const savedData = localStorage.getItem('so_long_save');
        
        if (!savedData) {
            showNPCDialogue('No hay ninguna partida guardada.');
            return;
        }
        
        const saveData = JSON.parse(savedData);
        
        // Restaurar estado del juego
        gameState.currentMap = saveData.gameState.currentMap;
        gameState.mapsState = saveData.gameState.mapsState;
        gameState.inventory = saveData.gameState.inventory;
        gameState.unlockedExits = saveData.gameState.unlockedExits;
        gameState.audioEnabled = saveData.gameState.audioEnabled;
        
        // Restaurar estado de aventura gráfica
        graphicAdventureState.completed = saveData.graphicAdventureState.completed;
        graphicAdventureState.playerName = saveData.graphicAdventureState.playerName;
        
        // Actualizar interfaz
        updateBoard();
        updateInfo();
        ensurePlayerVisible();
        
        // Actualizar información del mapa
        document.getElementById('current-map').textContent = MAPS[gameState.currentMap].name;
        
        // Cambiar fondo del game-board
        const gameBoard = document.getElementById('game-board');
        gameBoard.style.backgroundImage = `url('${MAPS[gameState.currentMap].background}')`;
        
        // Cerrar menú
        closeInventoryMenu();
        
        // Mostrar notificación
        showUnlockNotification('📂 ¡Partida cargada exitosamente!');
        
        // Reproducir sonido de éxito
        if (gameState.audioEnabled) {
            audioSystem.playUnlock();
        }
        
        console.log('✅ Partida cargada:', saveData);
    } catch (error) {
        console.error('❌ Error al cargar:', error);
        showNPCDialogue('Error al cargar la partida. El archivo podría estar corrupto.');
    }
}

// Reiniciar juego
function resetGame() {
    // Recargar la página directamente (F5)
    location.reload();
}

// ================================
// SISTEMA DE RADIO Y MÚSICA
// ================================

// Estado de audio del juego
// Estado de audio del juego
const radioState = {
    currentSong: null,
    soundEnabled: true,
    musicEnabled: true,
    backgroundMusic: null,
    playlist: [],
    randomEnabled: false,
    currentSongIndex: -1
};

// Abrir ventana de Radio
function openRadioMenu() {
    const radioMenu = document.getElementById('radio-menu');
    if (radioMenu) {
        radioMenu.classList.add('active');
        
        // Actualizar botón de play/pause según el estado actual
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn && radioState.backgroundMusic) {
            playPauseBtn.textContent = radioState.backgroundMusic.paused ? '▶️ Reproducir' : '⏸️ Pausar';
        }
    }
}

// Cerrar ventana de Radio
function closeRadioMenu() {
    const radioMenu = document.getElementById('radio-menu');
    if (radioMenu) {
        radioMenu.classList.remove('active');
    }
}

// Cargar playlist desde el directorio /audio/soundtrack
async function loadPlaylist() {
    const playlistContainer = document.getElementById('playlist-container');
    if (!playlistContainer) return;
    
    try {
        // Lista manual de canciones (ya que el servidor no permite listar directorios)
        const availableSongs = [
            '2am - Slightly Stoopid.mp3',
            '311 - Amber.mp3',
            'Alborosie ft. Raging Fyah – The Unforgiven.mp3',
            'Alice In Chains - Would.mp3',
            'Alton Ellis - I\'m Still In Love With You.mp3',
            'Alton Ellis - You\'ve Made Me So Very Happy.mp3',
            'Dollar - No saben como vivo.mp3',
            'Fernando Costa ft Dollar - Chacho.m4a',
            'Fernando Costa ft Dollar - Pa Que Lo Gocen.m4a',
            'Linkin Park - Don\'t Stay.mp3',
            'Linkin Park - Somewhere I Belong.mp3',
            'Swan Fyahbwoy - Fenomenal.mp3',
            'Swan Fyahbwoy - Innadiflames.mp3',
            'Swan Fyahbwoy - Malianteria.mp3',
            'Swan Fyahbwoy - Por Fumar.mp3',
            'Swan Fyahbwoy - Reggae Liphe.mp3',
            'System of a Down - Question.mp3',
            'System of a Down- Atwa.mp3',
            'Tupac - Blasphemy.mp3',
            'Tupac - I Get Around.mp3',
            'Tupac - If My Homie Calls.mp3',
            'Tupac - It Aint Easy.mp3',
            'Utada Hikaru - Simple and Clean (Planitb Remix).m4a'
        ];
        
        radioState.playlist = availableSongs;
        
        // Limpiar contenedor
        playlistContainer.innerHTML = '';
        
        if (availableSongs.length === 0) {
            playlistContainer.innerHTML = '<p class="loading-text">No hay canciones disponibles</p>';
            return;
        }
        
        // Crear elemento para cada canción
        availableSongs.forEach((songFile, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            songItem.dataset.songFile = songFile;
            
            // Decodificar URL y limpiar el nombre del archivo
            let songName = decodeURIComponent(songFile);
            // Quitar la ruta completa, quedarse solo con el nombre del archivo
            songName = songName.split(/[\/\\]/).pop();
            // Quitar extensión .mp3 o .m4a
            songName = songName.replace(/\.(mp3|m4a)$/, '');
            // Reemplazar guiones bajos y guiones por espacios
            songName = songName.replace(/[_-]/g, ' ');
            
            songItem.innerHTML = `
                <span class="song-name">
                    <span class="song-icon">🎵</span>
                    <span>${songName}</span>
                </span>
            `;
            
            songItem.addEventListener('click', () => playSong(songFile, songItem));
            
            playlistContainer.appendChild(songItem);
        });
    } catch (error) {
        console.error('Error al cargar playlist:', error);
        playlistContainer.innerHTML = '<p class="loading-text">Error al cargar canciones. Verifica que el servidor permita listar directorios.</p>';
    }
}

// Reproducir una canción específica
function playSong(songFile, songElement) {
    if (!radioState.musicEnabled) {
        showUnlockNotification('🎵 La música está desactivada');
        return;
    }
    
    // Actualizar índice de la canción actual en la playlist
    radioState.currentSongIndex = radioState.playlist.indexOf(songFile);
    
    // Detener canción actual si existe
    if (radioState.backgroundMusic) {
        radioState.backgroundMusic.pause();
        radioState.backgroundMusic.currentTime = 0;
    }
    
    // Remover clase 'playing' de todos los items
    document.querySelectorAll('.song-item').forEach(item => {
        item.classList.remove('playing');
    });
    
    // Añadir clase 'playing' al item actual
    if (songElement) {
        songElement.classList.add('playing');
    }
    
    // Decodificar el nombre del archivo y extraer solo el nombre
    let fileName = decodeURIComponent(songFile);
    fileName = fileName.split(/[\/\\]/).pop();
    
    // Obtener nombre legible para notificación
    let displayName = fileName.replace(/\.(mp3|m4a)$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/^\d+\s*/, '');
    
    // Crear y reproducir nuevo audio
    try {
        // Usar la ruta correcta con el nombre de archivo decodificado
        radioState.backgroundMusic = new Audio(`./audio/soundtrack/${fileName}`);
        
        // Desactivar loop si está en modo aleatorio
        radioState.backgroundMusic.loop = !radioState.randomEnabled;
        
        // Obtener el volumen actual del slider o usar 0.5 por defecto
        const volumeSlider = document.getElementById('volume-slider');
        const currentVolume = volumeSlider ? volumeSlider.value / 100 : 0.5;
        radioState.backgroundMusic.volume = currentVolume;
        
        // Si está en modo aleatorio o secuencial, reproducir siguiente canción al terminar
        radioState.backgroundMusic.addEventListener('ended', () => {
            if (radioState.playlist.length > 0) {
                playNextSong();
            }
        });
        
        radioState.backgroundMusic.play().then(() => {
            radioState.currentSong = fileName;
            showUnlockNotification(`🎵 Reproduciendo: ${displayName}`);
            
            // Actualizar botón de play/pause
            const playPauseBtn = document.getElementById('play-pause-btn');
            if (playPauseBtn) {
                playPauseBtn.textContent = '⏸️ Pausar';
            }
        }).catch(error => {
            console.error('Error al reproducir canción:', error);
            showUnlockNotification('❌ Error al reproducir canción');
        });
    } catch (error) {
        console.error('Error al cargar canción:', error);
        showUnlockNotification('❌ Archivo de audio no encontrado');
    }
}

// Control de Play/Pause
function togglePlayPause() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    
    // Si no hay música cargada, reproducir canción aleatoria
    if (!radioState.backgroundMusic) {
        if (radioState.playlist.length > 0) {
            const randomIndex = Math.floor(Math.random() * radioState.playlist.length);
            radioState.currentSongIndex = randomIndex;
            const randomSong = radioState.playlist[randomIndex];
            playSong(randomSong);
            showUnlockNotification('🎵 Reproduciendo canción aleatoria');
        } else {
            showUnlockNotification('⚠️ No hay canciones disponibles');
        }
        return;
    }
    
    if (radioState.backgroundMusic.paused) {
        radioState.backgroundMusic.play();
        if (playPauseBtn) playPauseBtn.textContent = '⏸️ Pausar';
        radioState.musicEnabled = true;
    } else {
        radioState.backgroundMusic.pause();
        if (playPauseBtn) playPauseBtn.textContent = '▶️ Reproducir';
        radioState.musicEnabled = false;
    }
}

// Reproducir siguiente canción
function playNextSong() {
    if (radioState.playlist.length === 0) {
        showUnlockNotification('⚠️ No hay canciones en la playlist');
        return;
    }
    
    if (radioState.randomEnabled) {
        // Modo aleatorio
        const randomIndex = Math.floor(Math.random() * radioState.playlist.length);
        radioState.currentSongIndex = randomIndex;
    } else {
        // Modo secuencial
        radioState.currentSongIndex = (radioState.currentSongIndex + 1) % radioState.playlist.length;
    }
    
    const nextSong = radioState.playlist[radioState.currentSongIndex];
    playSong(nextSong);
}

// Reproducir canción anterior
function playPreviousSong() {
    if (radioState.playlist.length === 0) {
        showUnlockNotification('⚠️ No hay canciones en la playlist');
        return;
    }
    
    if (radioState.randomEnabled) {
        // Modo aleatorio
        const randomIndex = Math.floor(Math.random() * radioState.playlist.length);
        radioState.currentSongIndex = randomIndex;
    } else {
        // Modo secuencial
        radioState.currentSongIndex = (radioState.currentSongIndex - 1 + radioState.playlist.length) % radioState.playlist.length;
    }
    
    const prevSong = radioState.playlist[radioState.currentSongIndex];
    playSong(prevSong);
}

// Control de modo aleatorio
function toggleRandom() {
    radioState.randomEnabled = !radioState.randomEnabled;
    const randomBtn = document.getElementById('random-btn');
    
    if (radioState.randomEnabled) {
        randomBtn.classList.add('active');
        showUnlockNotification('🔀 Modo aleatorio activado');
        
        // Si hay playlist, reproducir canción aleatoria
        if (radioState.playlist.length > 0) {
            const randomIndex = Math.floor(Math.random() * radioState.playlist.length);
            const randomSong = radioState.playlist[randomIndex];
            playSong(randomSong);
        }
    } else {
        randomBtn.classList.remove('active');
        showUnlockNotification('➡️ Modo secuencial activado');
    }
}

// Control de volumen
function updateVolume(value) {
    if (radioState.backgroundMusic) {
        radioState.backgroundMusic.volume = value / 100;
    }
    
    const volumeValue = document.getElementById('volume-value');
    if (volumeValue) {
        volumeValue.textContent = `${value}%`;
    }
}

// Alternar sonidos del juego
function toggleGameSound() {
    radioState.soundEnabled = !radioState.soundEnabled;
    gameState.audioEnabled = radioState.soundEnabled;
    
    // Actualizar ambos botones (si existen)
    const statusElement = document.getElementById('sound-status');
    if (statusElement) {
        statusElement.textContent = radioState.soundEnabled ? 'ON' : 'OFF';
    }
    
    showUnlockNotification(radioState.soundEnabled ? '🔊 Sonido activado' : '🔇 Sonido desactivado');
}

// Alternar música de fondo
function toggleBackgroundMusic() {
    radioState.musicEnabled = !radioState.musicEnabled;
    
    // Actualizar ambos botones (si existen)
    const statusElement = document.getElementById('music-status');
    if (statusElement) {
        statusElement.textContent = radioState.musicEnabled ? 'ON' : 'OFF';
    }
    
    // Pausar/reanudar música de fondo
    if (radioState.backgroundMusic) {
        if (radioState.musicEnabled) {
            radioState.backgroundMusic.play();
        } else {
            radioState.backgroundMusic.pause();
        }
    }
    
    showUnlockNotification(radioState.musicEnabled ? '🎵 Música activada' : '🎵 Música desactivada');
}

// ================================
// ESTADO DE LA AVENTURA GRÁFICA
// ================================

const graphicAdventureState = {
    currentImageIndex: 0,
    playerName: '',
    completed: false,
    quizAnswered: false,
    images: [
        './assets/duku/scene1.jpg',
        './assets/duku/scene2.jpg',
        './assets/duku/scene3.jpg',
        './assets/duku/scene4.jpg',
        './assets/duku/scene5.jpg',
        './assets/duku/scene6.jpg'
    ],
    getTexts: function() {
        return [
            `Bienaventurado seas viajero, \nsoy el Marqués Duku, aunque la gente me conoce por Ashaya, el alma de lo salvaje, guardián del bosque, ayudante del sheriff los fines de semana y protector del plano de Zanarkand.`,
            `Así que eres un ${this.playerName}. Yo, fui creado por Nissa, aunque ni sacuerda de cómo lo hizo. Perdón mi memoria ya no es lo que era... Yo soy u...`,
            `Elemental, querido Hudson, para eso me crearon, para luchar contra los Eldrazi.Eldrazi... Eldra zi, Eldra no, Eldra me gusta me...`,
            `${this.playerName}, tengo que pedirte que reunas las 5 cartas de Clow, para que esta tonteria de aventura gráfica tenga sentido.`,
            `Debes salvar el plano, porque por muy poderoso que sea, mis raíces me impiden moverme. Y ya que soy un NPC, tampoco habría historia.`,
            `Es la hora de aventuras. Y recuerda joven que en verdad no pasa nada si pasas de hacer la misión, tampoco te conozco de una mierda como para ir pidiéndote favores.`
        ];
    }
};

// ================================
// FUNCIÓN DE EFECTO TYPEWRITER
// ================================

let typewriterTimeout = null;

// Mostrar texto con efecto de máquina de escribir
function showTypewriterText(text, speed = 30) {
    // Limpiar timeout anterior si existe
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = null;
    }
    
    const container = document.getElementById('dialogue-text');
    if (!container) {
        console.warn('No se encontró el contenedor de diálogo para typewriter');
        return;
    }
    
    container.textContent = '';
    let index = 0;
    
    function typeNextChar() {
        if (index < text.length) {
            container.textContent += text.charAt(index);
            index++;
            typewriterTimeout = setTimeout(typeNextChar, speed);
        }
    }
    
    typeNextChar();
}

// Mostrar texto en el overlay de la aventura gráfica
let adventureTypewriterTimeout = null;

function showAdventureText(text, speed = 80) {
    const overlay = document.getElementById('adventure-text-overlay');
    if (!overlay) {
        console.warn('No se encontró el overlay de texto de aventura');
        return;
    }
    
    // Limpiar timeout anterior si existe
    if (adventureTypewriterTimeout) {
        clearTimeout(adventureTypewriterTimeout);
        adventureTypewriterTimeout = null;
    }
    
    overlay.style.display = 'block';
    overlay.innerHTML = '';
    let index = 0;
    
    function typeNextChar() {
        if (index < text.length) {
            const char = text.charAt(index);
            const span = document.createElement('span');
            span.className = 'letter';
            // Preservar espacios convirtiéndolos en espacios no separables
            span.textContent = char === ' ' ? '\u00A0' : char;
            overlay.appendChild(span);
            index++;
            adventureTypewriterTimeout = setTimeout(typeNextChar, speed);
        }
    }
    
    typeNextChar();
}

// Completar texto inmediatamente en el overlay
function completeAdventureText(text) {
    const overlay = document.getElementById('adventure-text-overlay');
    if (!overlay) return;
    
    // Limpiar timeout
    if (adventureTypewriterTimeout) {
        clearTimeout(adventureTypewriterTimeout);
        adventureTypewriterTimeout = null;
    }
    
    // Mostrar texto completo
    overlay.textContent = text;
}

// ================================
// FUNCIONES DE AVENTURA GRÁFICA
// ================================

// Abrir la aventura gráfica de Duku
function openGraphicAdventure() {
    const adventureContainer = document.getElementById('graphic-adventure');
    const adventureImage = document.getElementById('adventure-image');
    const nextBtn = document.getElementById('adventure-next-btn');
    const quizButtons = document.getElementById('adventure-quiz-buttons');
    const nameInput = document.getElementById('adventure-name-input');
    const playerNameField = document.getElementById('player-name-input');
    
    gameState.dialogueActive = true;
    graphicAdventureState.currentImageIndex = 0;
    graphicAdventureState.playerName = '';
    graphicAdventureState.completed = false;
    graphicAdventureState.quizAnswered = false;
    
    // Configurar imagen inicial
    adventureImage.src = graphicAdventureState.images[0];
    
    // Configurar manejo de errores
    adventureImage.onerror = function() {
        console.error('Error cargando imagen:', this.src);
        showNPCDialogue('Error al cargar la imagen de la aventura. Verifica que todas las imágenes existan en ./assets/duku/');
        closeGraphicAdventure();
    };
    
    // Mostrar campo de nombre y limpiar input
    if (nameInput && playerNameField) {
        nameInput.style.display = 'flex';
        playerNameField.value = '';
        playerNameField.focus();
        
        // Permitir avanzar con Enter en el campo de nombre
        playerNameField.onkeypress = function(e) {
            if (e.key === 'Enter') {
                advanceGraphicAdventure();
            }
        };
    }
    
    // Mostrar contenedor
    adventureContainer.style.display = 'block';
    nextBtn.style.display = 'block';
    quizButtons.style.display = 'none';
    
    // Mostrar primer texto en overlay
    showAdventureText(graphicAdventureState.getTexts()[0]);
    
    // Limpiar listeners anteriores y configurar nuevo
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    newNextBtn.onclick = advanceGraphicAdventure;
    
    // Configurar botones de quiz
    const quizBtns = quizButtons.querySelectorAll('.quiz-btn');
    quizBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.onclick = (e) => handleQuizAnswer(newBtn.dataset.answer, e);
    });
}

// Avanzar en la aventura gráfica
function advanceGraphicAdventure() {
    const adventureImage = document.getElementById('adventure-image');
    const nextBtn = document.getElementById('adventure-next-btn');
    const quizButtons = document.getElementById('adventure-quiz-buttons');
    const nameInput = document.getElementById('adventure-name-input');
    const playerNameField = document.getElementById('player-name-input');
    
    // Verificar si hay un texto en proceso de escritura
    const overlay = document.getElementById('adventure-text-overlay');
    const currentText = graphicAdventureState.getTexts()[graphicAdventureState.currentImageIndex];
    
    if (overlay && adventureTypewriterTimeout && overlay.textContent !== currentText) {
        // Si el texto no está completo, completarlo inmediatamente
        completeAdventureText(currentText);
        return;
    }
    
    // Si estamos en la primera imagen, guardar el nombre
    if (graphicAdventureState.currentImageIndex === 0) {
        if (nameInput && playerNameField) {
            const inputName = playerNameField.value.trim();
            if (inputName !== '') {
                // Evento especial: cambiar "ElNegroEsGay" por "Gelepollas"
                if (inputName === 'ElNegroEsGay') {
                    graphicAdventureState.playerName = 'Gelepollas';
                    console.log('🎭 Nombre especial detectado, cambiado a:', graphicAdventureState.playerName);
                } else {
                    graphicAdventureState.playerName = inputName;
                    console.log('✅ Nombre del jugador guardado:', graphicAdventureState.playerName);
                }
            } else {
                graphicAdventureState.playerName = 'GRACIOSILLO'; // Nombre por defecto
                console.log('✅ Nombre por defecto asignado: GRACIOSILLO');
            }
            nameInput.style.display = 'none';
        } else {
            // Fallback a prompt si no existe el campo HTML
            const playerName = prompt('¿Cómo te llamas, aventurero?');
            const trimmedName = (playerName && playerName.trim()) ? playerName.trim() : 'GRACIOSILLO';
            // Evento especial también en el prompt
            graphicAdventureState.playerName = (trimmedName === 'ElNegroEsGay') ? 'Gelepollas' : trimmedName;
        }
    }
    
    // Avanzar índice
    graphicAdventureState.currentImageIndex++;
    
    // Configurar manejo de errores para cada carga
    adventureImage.onerror = function() {
        console.error('Error cargando imagen:', this.src);
        showNPCDialogue('Error al cargar la imagen. Verifica que todas las imágenes existan.');
        closeGraphicAdventure();
    };
    
    // Si llegamos a la imagen 2 (índice 1), mostrar quiz
    if (graphicAdventureState.currentImageIndex === 1) {
        adventureImage.src = graphicAdventureState.images[1];
        showAdventureText(graphicAdventureState.getTexts()[1]);
        // Ocultar botón siguiente y mostrar botones de quiz
        nextBtn.style.display = 'none';
        quizButtons.style.display = 'flex';
        graphicAdventureState.quizAnswered = false;
    }
    // Si hay más imágenes y no estamos en el quiz
    else if (graphicAdventureState.currentImageIndex < graphicAdventureState.images.length) {
        adventureImage.src = graphicAdventureState.images[graphicAdventureState.currentImageIndex];
        showAdventureText(graphicAdventureState.getTexts()[graphicAdventureState.currentImageIndex]);
        nextBtn.style.display = 'block';
        quizButtons.style.display = 'none';
    } else {
        // Ya vimos todas las imágenes (6 escenas), cerrar y dar recompensa
        closeGraphicAdventure();
        completeGraphicAdventure();
    }
}

// Manejar respuesta del quiz
function handleQuizAnswer(answer, event) {
    const adventureImage = document.getElementById('adventure-image');
    const nextBtn = document.getElementById('adventure-next-btn');
    const quizButtons = document.getElementById('adventure-quiz-buttons');
    const clickedBtn = event ? event.target : null;
    
    if (answer === 'elemental') {
        // Respuesta correcta, continuar a la escena 3 (índice 2)
        graphicAdventureState.quizAnswered = true;
        graphicAdventureState.currentImageIndex = 2;
        
        // Manejo de errores en carga
        adventureImage.onerror = function() {
            console.error('Error cargando imagen:', this.src);
            showNPCDialogue('Error al cargar la siguiente imagen.');
            closeGraphicAdventure();
        };
        
        adventureImage.src = graphicAdventureState.images[2];
        showAdventureText(graphicAdventureState.getTexts()[2]);
        
        // Ocultar quiz y mostrar botón siguiente para continuar a escenas 4, 5, 6
        quizButtons.style.display = 'none';
        nextBtn.style.display = 'block';
    } else {
        // Respuesta incorrecta - Mostrar mensaje según la respuesta
        let wrongAnswerText = '';
        
        if (answer === 'olivo') {
            wrongAnswerText = '¡¿OLIVO?! ¡¿ACASO HAS VISTO ALGÚN OLIVO QUE HABLE SO INUTIL?! Si hubieras dicho cáñamo o una zarza ardiente, lo entendería, pero un olivo... Venga en serio, ¿Qué soy?';
        } else if (answer === 'demanda') {
            wrongAnswerText = '¿Una demanda? Jajaja si, eso seguro que sí. Pero realmente no, nuestros amigos de Nientiendo ya están detrás de eso. Aunque admito que se tienen que poner de acuerdo con tanta gente para ver que es de quien, que igual ni lo intentan. Pero tú, sí. ¡Inténtalo de nuevo!';
        } else if (answer === 'siguiente') {
            wrongAnswerText = '¿Un siguiente? ¿Qué tipo de respuesta es esa? Estás jugando conmigo, ¿verdad? Vamos, piensa un poco más y responde en serio.';
        }
        
        // Mostrar texto de queja con efecto typewriter en overlay
        showAdventureText(wrongAnswerText);
        
        // Respuesta incorrecta - Feedback visual
        if (clickedBtn) {
            const originalBg = clickedBtn.style.background;
            const originalTransform = clickedBtn.style.transform;
            
            clickedBtn.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
            clickedBtn.style.transform = 'scale(0.95)';
            
            // Reproducir sonido de error si está habilitado
            if (gameState.audioEnabled) {
                try {
                    const errorSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3');
                    errorSound.volume = 0.3;
                    errorSound.play().catch(e => console.log('No se pudo reproducir audio de error'));
                } catch (e) {
                    console.log('Audio no disponible');
                }
            }
            
            // Restaurar estilo después de 500ms
            setTimeout(() => {
                clickedBtn.style.background = originalBg;
                clickedBtn.style.transform = originalTransform;
            }, 500);
        }
    }
}

// Cerrar la aventura gráfica
function closeGraphicAdventure() {
    const adventureContainer = document.getElementById('graphic-adventure');
    adventureContainer.style.display = 'none';
    gameState.dialogueActive = false;
}

// Completar la aventura gráfica y dar recompensa
function completeGraphicAdventure() {
    const mapState = gameState.mapsState[gameState.currentMap];
    
    // Marcar la aventura como completada
    graphicAdventureState.completed = true;
    
    // Marcar a Duku como interactuado
    mapState.npcInteracted['Duku'] = true;
    mapState.collected++;
    
    // Dar la recompensa
    gameState.inventory.push('mitad_llave_bosque');
    
    // Verificar combinaciones especiales
    checkSpecialCombinations();
    
    // Mostrar mensaje de recompensa
    showNPCDialogue('¡Has completado la aventura de Duku! Has recibido la MITAD DE LA LLAVE DEL BOSQUE.');
    
    // Actualizar interfaz
    checkMapCompletion();
    updateBoard();
    updateInfo();
}

// ================================
// CONTROLES DE TECLADO
// ================================

// Configurar controles de teclado
const keysPressed = new Set();
let gameLoopActive = false;
let lastMoveTime = 0;
const MOVE_DELAY = 50; // Milisegundos entre movimientos (más rápido para movimiento suave)

function setupInput() {
    // Rastrear teclas presionadas
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        // Verificar si los menús están abiertos
        const radioMenu = document.getElementById('radio-menu');
        const inventoryMenu = document.getElementById('inventory-menu');
        const isRadioOpen = radioMenu && radioMenu.classList.contains('active');
        const isInventoryOpen = inventoryMenu && inventoryMenu.classList.contains('active');
        
        // Abrir/cerrar Radio (tecla M) - tiene prioridad sobre otros controles
        if (key === 'm') {
            e.preventDefault();
            if (isRadioOpen) {
                closeRadioMenu();
            } else {
                openRadioMenu();
            }
            return;
        }
        
        // Tecla ESC - prioridad: cerrar radio > cerrar inventario > abrir inventario
        if (e.key === 'Escape') {
            e.preventDefault();
            if (isRadioOpen) {
                closeRadioMenu();
            } else if (isInventoryOpen) {
                closeInventoryMenu();
            } else {
                openInventoryMenu();
            }
            return;
        }
        
        // Abrir/cerrar menú de inventario (tecla I)
        if (key === 'i') {
            e.preventDefault();
            toggleInventoryMenu();
            return;
        }
        
        // Si hay diálogo de NPC activo, solo responder a teclas de cierre
        if (gameState.dialogueActive) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'c') {
                e.preventDefault();
                closeNPCDialogue();
            }
            return;
        }
        
        // Interacción con NPC (tecla C o Espacio)
        if (e.key === 'c' || e.key === ' ') {
            const adjacentNPC = isPlayerAdjacentToNPC();
            if (adjacentNPC) {
                interactWithNPC(adjacentNPC);
                e.preventDefault();
            }
            return;
        }
        
        // Agregar tecla al set
        const wasEmpty = keysPressed.size === 0;
        keysPressed.add(key);
        
        // Activar animación de movimiento si es tecla de movimiento
        const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
        if (movementKeys.includes(key)) {
            if (window.startMoving) {
                window.startMoving();
            }
            
            // Iniciar game loop si no está activo
            if (!gameLoopActive) {
                gameLoopActive = true;
                gameLoop();
            }
            
            e.preventDefault();
        }
    });
    
    // Rastrear teclas liberadas y detener animación si no hay teclas de movimiento presionadas
    document.addEventListener('keyup', (e) => {
        keysPressed.delete(e.key.toLowerCase());
        
        // Verificar si quedan teclas de movimiento presionadas
        const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
        const hasMovementKey = movementKeys.some(key => keysPressed.has(key));
        
        if (!hasMovementKey) {
            if (window.stopMoving) {
                window.stopMoving();
            }
            gameLoopActive = false;
        }
    });
}

// Game loop para movimiento continuo
function gameLoop() {
    if (!gameLoopActive) return;
    
    const currentTime = Date.now();
    
    // Verificar si hay diálogo activo
    if (!gameState.dialogueActive && currentTime - lastMoveTime >= MOVE_DELAY) {
        // Verificar combinaciones diagonales primero
        if ((keysPressed.has('w') || keysPressed.has('arrowup')) && 
            (keysPressed.has('d') || keysPressed.has('arrowright'))) {
            movePlayer(1, -1, 'up-right');
            lastMoveTime = currentTime;
        } else if ((keysPressed.has('d') || keysPressed.has('arrowright')) && 
                   (keysPressed.has('s') || keysPressed.has('arrowdown'))) {
            movePlayer(1, 1, 'down-right');
            lastMoveTime = currentTime;
        } else if ((keysPressed.has('s') || keysPressed.has('arrowdown')) && 
                   (keysPressed.has('a') || keysPressed.has('arrowleft'))) {
            movePlayer(-1, 1, 'down-left');
            lastMoveTime = currentTime;
        } else if ((keysPressed.has('a') || keysPressed.has('arrowleft')) && 
                   (keysPressed.has('w') || keysPressed.has('arrowup'))) {
            movePlayer(-1, -1, 'up-left');
            lastMoveTime = currentTime;
        }
        // Movimiento simple
        else if (keysPressed.has('w') || keysPressed.has('arrowup')) {
            movePlayer(0, -1, 'up');
            lastMoveTime = currentTime;
        } else if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
            movePlayer(0, 1, 'down');
            lastMoveTime = currentTime;
        } else if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
            movePlayer(-1, 0, 'left');
            lastMoveTime = currentTime;
        } else if (keysPressed.has('d') || keysPressed.has('arrowright')) {
            movePlayer(1, 0, 'right');
            lastMoveTime = currentTime;
        }
    }
    
    // Continuar el loop
    requestAnimationFrame(gameLoop);
}
