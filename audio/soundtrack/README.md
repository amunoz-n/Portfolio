# 📻 Radio Olive Valley - Soundtrack

Esta carpeta contiene la música de fondo del juego.

## 🎵 Cómo agregar canciones

1. Coloca tus archivos MP3 en esta carpeta
2. Los archivos deben tener extensión `.mp3`
3. El juego detectará automáticamente todos los archivos MP3
4. Los nombres de archivo se mostrarán en la Radio (reemplazando _ por espacios)

## 📝 Ejemplos de nombres de archivo

- `tema_principal.mp3` → Se mostrará como "tema principal"
- `ambiente_bosque.mp3` → Se mostrará como "ambiente bosque"
- `batalla_final.mp3` → Se mostrará como "batalla final"

## ⚙️ Configuración

Para modificar la lista de canciones disponibles, edita el array `availableSongs` en la función `loadPlaylist()` del archivo `sl_game.js`.

Actualmente configurado para buscar:
- cancion1.mp3
- cancion2.mp3
- cancion3.mp3
- tema_principal.mp3
- ambiente_bosque.mp3
- batalla.mp3
