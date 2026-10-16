# Shekel Clicker

A Jewish idle clicker in the spirit of Cookie Clicker, drawn in pixel art. Click the ancient shekel, hire Bubbes, braid challah, open shuls and kibbutzim, catch golden gelt, and follow the community on its journey to the promised land, which turns out to be Jewpiter.

Play it at https://davidthecodingod.github.io/shekel-clicker/

It is plain HTML, CSS, and JavaScript with no build step and no outside requests: fonts are self-hosted and every sprite is drawn in code.

## What's in the game

- 20 buildings, from Bubbe to the Tikkun Olam Engine, each with its own pixel sprite and an animated row in the neighborhood.
- The story, "Next Year on Jewpiter": 21 short scenes with character portraits that unlock as you grow. The Story tab replays them.
- Over 300 upgrades and 280 achievements, all with pixel icons.
- Golden gelt, six holiday seasons with visitors and treasures, pomegranates that level up buildings.
- Four minigames: the Shuk (a market), Kibbutz Fields, Torah Study, and the Dreidel.
- Tzedakah, L'dor v'dor generations, and 17 heirlooms.
- The jukebox: Hava Nagila played live by a synthesized klezmer band, with a Hora mode that keeps speeding up.
- Autosave, offline earnings, save codes, keyboard shortcuts, a phone layout, and a low-power mode.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page layout |
| `css/style.css` | All styling (design notes at the top) |
| `js/sprites.js` | The palette and every hand-drawn 16x16 sprite, plus the icon registry |
| `js/pixel.js` | Sprite renderer and procedural art: the big coin, frames, textures, skyline, neighborhood backdrops |
| `js/data.js` | Buildings, upgrades, foods, holidays, heirlooms, crops, trivia |
| `js/story.js` | The story chapters and all news headlines |
| `js/music.js` | Sound effects and the Hava Nagila jukebox |
| `js/game.js` | Core game: production, store, achievements, story player, saving |
| `js/minigames.js` | The Shuk, Kibbutz Fields, Torah Study, and Dreidel |

To add a sprite, add a `def('name', ...)` block to `js/sprites.js` using the palette letters at the top of that file. To add headlines, edit the lists in `js/story.js`.

## Credits

Inspired by Orteil's Cookie Clicker; this is an independent fan project. Hava Nagila is a traditional melody, first published in 1922 with words by Abraham Zvi Idelsohn; the arrangement is synthesized in the browser. Fonts: Pixelify Sans and Frank Ruhl Libre, both under the SIL Open Font License.
