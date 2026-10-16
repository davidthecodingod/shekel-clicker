# Shekel Clicker

A Jewish-themed idle clicker game in the spirit of Cookie Clicker. Click the coin, hire Bubbes, open challah bakeries and shuls, catch golden gelt, celebrate the holidays, and dance the hora to a live-synthesized Hava Nagila.

It is plain HTML, CSS, and JavaScript with no build step, so it runs anywhere that serves static files.

## Put it on GitHub Pages

1. Create a new repository on GitHub (for example `shekel-clicker`).
2. Upload everything in this folder to the repository, keeping the folder structure. `index.html` must be at the top level, next to the `css` and `js` folders.
   - On github.com: open the repository, choose **Add file → Upload files**, drag in all the files and both folders, then **Commit changes**.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, then **Save**.
4. After a minute or two the game is live at `https://<your-username>.github.io/<repository-name>/`.

To update the game later, upload the changed files again; Pages redeploys automatically.

You can also just open `index.html` directly in a browser to play locally.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page layout |
| `css/style.css` | All styling |
| `js/art.js` | Hand-drawn SVG art for buildings, the coin, gelt, and the dreidel |
| `js/data.js` | Buildings, upgrades, foods, holidays, heirlooms, trivia, and news headlines |
| `js/music.js` | Sound effects and the Hava Nagila jukebox |
| `js/game.js` | Core game: production, store, achievements, saving |
| `js/minigames.js` | Kibbutz Fields, Torah Study, and Dreidel |

Want to add your own headlines or trivia questions? They are plain lists near the bottom of `js/data.js`.

## What's in the game

- 20 buildings, from Bubbe to the Tikkun Olam Engine, each with its own illustration and a neighborhood view.
- Over 300 upgrades: 10 tiers per building, Bubbe teamwork upgrades, 36 Jewish foods, click upgrades, Helping Hands, family nachas upgrades, golden gelt upgrades, and holiday treasures.
- 275 achievements, including a few secret ones.
- Golden gelt with Lucky, Frenzy, Click Frenzy, and Building Blessing effects.
- Six holiday seasons (Rosh Hashanah, Sukkot, Hanukkah, Purim, Passover, Shavuot), each with its own bonus, a visitor to catch, and five treasures to find.
- Pomegranates that ripen over time and level up buildings.
- Three minigames: Kibbutz Fields (grow the Seven Species), Torah Study (58 trivia questions), and the Dreidel.
- Tzedakah box, plus L'dor v'dor generations with 17 heirlooms to buy.
- The jukebox: Hava Nagila with clarinet, fiddle, accordion, or 8-bit lead, a full band, and a Hora mode that speeds up every time through.
- Autosave, offline earnings, and save codes for backups.

## Credits

Hava Nagila is a traditional Hasidic melody; it was first published in 1922 with words by Abraham Zvi Idelsohn. The arrangement here is synthesized in the browser with the Web Audio API. Fonts are Frank Ruhl Libre and Rubik from Google Fonts. Inspired by Orteil's Cookie Clicker; this is an independent fan project.
