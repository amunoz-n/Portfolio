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
            `Buenas ${this.playerName || 'aventurero'}, soy el Marqués Duku, aunque la gente me conoce por Ashaya, el alma de lo salvaje, guardián del bosque, protector del plano Zanarkand.`,
            `Fui creado por Nissa, y ni se acuerda de cómo me hizo, ya que yo soy u...`,
            `Elemental, querido Hudson, para eso me crearon, para luchar contra los Eldrazi.`,
            `Eldrazi... Eldra zi, Eldra no, Eldra me gusta me... Perdón mi memoria ya no es lo que era...`,
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
function showAdventureText(text, speed = 60) {
    const overlay = document.getElementById('adventure-text-overlay');
    if (!overlay) {
        console.warn('No se encontró el overlay de texto de aventura');
        return;
    }
    
    overlay.style.display = 'block';
    overlay.textContent = '';
    let index = 0;
    
    function typeNextChar() {
        if (index < text.length) {
            overlay.textContent += text.charAt(index);
            index++;
            setTimeout(typeNextChar, speed);
        }
    }
    
    typeNextChar();
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
    
    // Si estamos en la primera imagen, guardar el nombre
    if (graphicAdventureState.currentImageIndex === 0) {
        if (nameInput && playerNameField) {
            const inputName = playerNameField.value.trim();
            if (inputName !== '') {
                graphicAdventureState.playerName = inputName;
                console.log('✅ Nombre del jugador guardado:', graphicAdventureState.playerName);
            } else {
                graphicAdventureState.playerName = 'GRACIOSILLO'; // Nombre por defecto
                console.log('✅ Nombre por defecto asignado: GRACIOSILLO');
            }
            nameInput.style.display = 'none';
        } else {
            // Fallback a prompt si no existe el campo HTML
            const playerName = prompt('¿Cómo te llamas, aventurero?');
            graphicAdventureState.playerName = (playerName && playerName.trim()) ? playerName.trim() : 'GRACIOSILLO';
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
                e.preventDefault();
                closeNPCDialogue();
            }
            return;
        }
        
        // Verificar combinaciones diagonales primero
        if (keysPressed.has('w') && keysPressed.has('d')) {
            // Arriba-Derecha
            movePlayer(1, -1, 'up-right');
            e.preventDefault();
            return;
        } else if (keysPressed.has('d') && keysPressed.has('s')) {
            // Derecha-Abajo
            movePlayer(1, 1, 'down-right');
            e.preventDefault();
            return;
        } else if (keysPressed.has('s') && keysPressed.has('a')) {
            // Abajo-Izquierda
            movePlayer(-1, 1, 'down-left');
            e.preventDefault();
            return;
        } else if (keysPressed.has('a') && keysPressed.has('w')) {
            // Izquierda-Arriba
            movePlayer(-1, -1, 'up-left');
            e.preventDefault();
            return;
        }
        
        // Movimiento simple con flechas o WASD
        if (e.key === 'ArrowUp' || e.key === 'w') {
            movePlayer(0, -1, 'up');
            e.preventDefault();
        } else if (e.key === 'ArrowDown' || e.key === 's') {
            movePlayer(0, 1, 'down');
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            movePlayer(-1, 0, 'left');
            e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            movePlayer(1, 0, 'right');
            e.preventDefault();
        }
        // Interacción con NPC (tecla C o Espacio)
        else if (e.key === 'c' || e.key === ' ') {
            const adjacentNPC = isPlayerAdjacentToNPC();
            if (adjacentNPC) {
                interactWithNPC(adjacentNPC);
                e.preventDefault();
            }
        }
    });
    
    // Rastrear teclas liberadas
    document.addEventListener('keyup', (e) => {
        keysPressed.delete(e.key.toLowerCase());
    });
}
