// ================================
// SPRITES DE NPC CON ESTADOS
// ================================
// Archivo: sl_npc_sprites.js
// Maneja sprites por NPC: antes de dar la gema (abajo) y después (arriba)

console.log('Cargando sl_npc_sprites.js...');

// Normaliza nombres para rutas: minúsculas, sin espacios, sin acentos
function normalizeName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '')
        ;
}

// Configuración base de rutas
const NPC_SPRITES_BASE = './characters/';

// Lista de NPC conocidos (coincide con CONFIG.NPC_NAMES)
const KNOWN_NPCS = [
    'Rafael','Ana','Seba','Domingo','MariaJuana',
    'Luis','Elena','Carlos','Laura','Miguel','Carmela'
];

// Mapa de imágenes por NPC y estado
// estado: 'pre' -> x_abajo.png, 'post' -> x_arriba.png
const npcSpriteMap = new Map();

// Cache de Image() para preload
const npcImageCache = new Map();

function buildSpritePath(npcName, state) {
    const base = normalizeName(npcName);
    const suffix = state === 'post' ? 'arriba' : 'abajo';
    return `${NPC_SPRITES_BASE}${base}_${suffix}.png`;
}

function preloadNPCSprites() {
    KNOWN_NPCS.forEach(npc => {
        const prePath = buildSpritePath(npc, 'pre');
        const postPath = buildSpritePath(npc, 'post');
        npcSpriteMap.set(npc, { pre: prePath, post: postPath });
        
        [prePath, postPath].forEach(path => {
            const img = new Image();
            img.src = path;
            img.onload = () => console.log(`Sprite OK: ${path}`);
            img.onerror = () => console.warn(`Sprite faltante: ${path}`);
            npcImageCache.set(path, img);
        });
    });
}

// Obtiene URL del sprite para un NPC según si ya interactuó
function getNPCSprite(npcName, interacted) {
    const entry = npcSpriteMap.get(npcName);
    if (!entry) return null;
    const path = interacted ? entry.post : entry.pre;
    return path;
}

// Aplica sprite a una celda
function applyNPCSprite(cellElement, npcName, interacted) {
    const url = getNPCSprite(npcName, interacted);
    if (!url) return;
    
    // Permitir overlays más grandes que la celda
    cellElement.style.position = 'relative';
    cellElement.style.overflow = 'visible';
    
    // Eliminar overlay previo si existe
    const prev = cellElement.querySelector('.sprite-overlay');
    if (prev) prev.remove();
    
    // Crear imagen overlay más grande, alineada con el bottom de la celda
    const sizePx = (window.CONFIG && window.CONFIG.CELL_SIZE ? window.CONFIG.CELL_SIZE : 25.6) * 2.5;
    const img = document.createElement('img');
    img.src = url;
    img.className = 'sprite-overlay';
    img.style.position = 'absolute';
    img.style.left = '50%';
    img.style.bottom = '0';
    img.style.transform = 'translateX(-50%)';
    img.style.width = `${sizePx}px`;
    img.style.height = `${sizePx}px`;
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'none';
    img.style.zIndex = '5';
    
    cellElement.appendChild(img);
}

// Export globals
window.getNPCSprite = getNPCSprite;
window.applyNPCSprite = applyNPCSprite;
window.preloadNPCSprites = preloadNPCSprites;

// Inicio
preloadNPCSprites();
