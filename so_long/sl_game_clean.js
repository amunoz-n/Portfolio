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
    
    if (isFirstInteraction) {
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
    
    if (inventory.includes('piedra_sagrada')) {
        const mapa3 = MAPS['mapa3'];
        if (mapa3 && mapa3.exits['s6']) {
            mapa3.exits['s6'].unlocked = true;
            if (!gameState.unlockedExits.includes('s6')) {
                gameState.unlockedExits.push('s6');
                showUnlockNotification("¡Piedra sagrada obtenida! Salida de regreso desbloqueada.");
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
    
    // Si regresamos al mapa0, mostrar un mensaje de bienvenida
    if (targetMap === 'mapa0') {
        setTimeout(() => {
            showNPCDialogue("¡Has regresado a la Plaza Central! Explora otros caminos.");
        }, 500);
    }
    
    // Actualizar interfaz
    updateBoard();
    updateInfo();
    ensurePlayerVisible();
    
    // Actualizar información del mapa
    document.getElementById('current-map').textContent = MAPS[targetMap].name;
    
    // Cambiar fondo
    const boardContainer = document.querySelector('.game-board-container');
    boardContainer.style.backgroundImage = `url('${MAPS[targetMap].background}')`;
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
        'piedra_sagrada': 'Piedra Sagrada'
    };
    
    return names[itemId] || itemId;
}

// Mover al jugador
function movePlayer(dx, dy, direction = null) {
    if (gameState.dialogueActive) return;
    
    const mapState = gameState.mapsState[gameState.currentMap];
    if (!mapState) return;
    
    // Actualizar dirección del sprite (usar dirección específica si se proporciona)
    if (direction && window.setDirection) {
        window.setDirection(direction);
    } else if (window.updateDirectionFromMovement) {
        window.updateDirectionFromMovement(dx, dy);
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
    
    // Actualizar interfaz
    updateBoard();
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
// FUNCIONES DE AVENTURA GRÁFICA
// ================================

// Abrir la aventura gráfica de Duku
function openGraphicAdventure() {
    const adventureContainer = document.getElementById('graphic-adventure');
    const adventureImage = document.getElementById('adventure-image');
    const nextBtn = document.getElementById('adventure-next-btn');
    const quizButtons = document.getElementById('quiz-buttons');
    
    gameState.dialogueActive = true;
    graphicAdventureState.currentImageIndex = 0;
    graphicAdventureState.playerName = '';
    graphicAdventureState.completed = false;
    
    // Configurar imagen inicial
    const texts = graphicAdventureState.getTexts();
    adventureImage.src = graphicAdventureState.images[0];
    adventureImage.alt = texts[0];
    
    // Mostrar contenedor
    adventureContainer.style.display = 'block';
    nextBtn.style.display = 'block';
    quizButtons.style.display = 'none';
    
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
    const quizButtons = document.getElementById('quiz-buttons');
    
    // Si es la primera imagen, solicitar nombre
    if (graphicAdventureState.currentImageIndex === 0) {
        const playerName = prompt('¿Cómo te llamas, aventurero?');
        if (!playerName || playerName.trim() === '') {
            showNPCDialogue('Debes decirme tu nombre para continuar.');
            return;
        }
        graphicAdventureState.playerName = playerName.trim();
    }
    
    // Avanzar índice
    graphicAdventureState.currentImageIndex++;
    
    // Verificar si llegamos al quiz
    if (graphicAdventureState.currentImageIndex === 1) {
        // Mostrar botones de quiz y ocultar botón siguiente
        nextBtn.style.display = 'none';
        quizButtons.style.display = 'flex';
        
        // Mostrar imagen del quiz
        adventureImage.src = graphicAdventureState.images[1];
        const texts = graphicAdventureState.getTexts();
        adventureImage.alt = texts[1];
        return;
    }
    
    // Si hay más imágenes, mostrar la siguiente
    if (graphicAdventureState.currentImageIndex < graphicAdventureState.images.length) {
        adventureImage.src = graphicAdventureState.images[graphicAdventureState.currentImageIndex];
        const texts = graphicAdventureState.getTexts();
        adventureImage.alt = texts[graphicAdventureState.currentImageIndex];
    } else {
        // No hay más imágenes, finalizar
        completeGraphicAdventure();
        closeGraphicAdventure();
    }
}

// Manejar respuesta del quiz
function handleQuizAnswer(answer, event) {
    event.preventDefault();
    
    const adventureImage = document.getElementById('adventure-image');
    const nextBtn = document.getElementById('adventure-next-btn');
    const quizButtons = document.getElementById('quiz-buttons');
    
    if (answer === 'elemental') {
        // Respuesta correcta
        showNPCDialogue('¡Correcto! Los elementales son seres mágicos de gran poder.');
        
        // Ocultar botones de quiz y mostrar botón siguiente
        quizButtons.style.display = 'none';
        nextBtn.style.display = 'block';
        
        // Avanzar al siguiente índice de imagen (imagen 2)
        graphicAdventureState.currentImageIndex++;
        
        // Mostrar la siguiente imagen
        if (graphicAdventureState.currentImageIndex < graphicAdventureState.images.length) {
            adventureImage.src = graphicAdventureState.images[graphicAdventureState.currentImageIndex];
            const texts = graphicAdventureState.getTexts();
            adventureImage.alt = texts[graphicAdventureState.currentImageIndex];
        }
    } else {
        // Respuesta incorrecta - mensajes personalizados
        let wrongMessage = '¡Incorrecto! Esa no es la respuesta correcta.';
        
        if (answer === 'olivo') {
            wrongMessage = '¡No! Los olivos son árboles comunes, no tienen magia especial.';
        } else if (answer === 'demanda') {
            wrongMessage = '¡No! Una demanda es un documento legal, no tiene nada que ver con magia.';
        } else if (answer === 'siguiente') {
            wrongMessage = '¡No puedes avanzar sin responder correctamente!';
        }
        
        showNPCDialogue(wrongMessage);
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

function setupInput() {
    // Rastrear teclas presionadas
    document.addEventListener('keydown', (e) => {
        keysPressed.add(e.key.toLowerCase());
        
        // Primero verificar si hay diálogo activo
        if (gameState.dialogueActive) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key === 'c') {
                closeNPCDialogue();
            }
            return;
        }
        
        // Movimiento con flechas
        if (e.key === 'ArrowUp' || e.key === 'w') {
            movePlayer(0, -1, 'up');
        } else if (e.key === 'ArrowDown' || e.key === 's') {
            movePlayer(0, 1, 'down');
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            movePlayer(-1, 0, 'left');
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            movePlayer(1, 0, 'right');
        }
        
        // Interacción con NPC (tecla C o Espacio)
        if (e.key === 'c' || e.key === ' ') {
            const adjacentNPC = isPlayerAdjacentToNPC();
            if (adjacentNPC) {
                interactWithNPC(adjacentNPC);
            }
        }
    });
    
    // Rastrear teclas liberadas
    document.addEventListener('keyup', (e) => {
        keysPressed.delete(e.key.toLowerCase());
    });
}
