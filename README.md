<!--
TODO

- [x] Artifact end of list detection
- [x] Artifact card string formatting
- [x] Artifact card lock state
- [x] Update read artifacts when locking to reflect new lock status
- [ ] Tooltips, hovers
- [ ] Pause on _any_ keyboard press (+resume??/stop)
- [x] Dropdown
  - Routine lock options read, read&lock, lock
  - Scoring method popularity/rarity with and/or condition
- [x] export data
- [x] 16:9 (1920×1080), 16:10 (1920×1200)
  - [ ] Adding screen resolutions readme
- [ ] Install instructions + images
- [x] Bundle sharp, tesseract
- [ ] Save settings in local storage
- [x] GL window icon

Stretch:

- scrape data from from other languages of lineup simulator
- bg art
- scan other pages
- overlay with keystroke info (e.g. emergency stop)
- find better source for GOOD data
- Pause on bad data, option to skip artifact or skip all, maybe fix on the spot
- Test score percentile creation
- General repo qol: git merge hooks for testing etc.
- VJoy?? and gamepad method
- Better Layout component
- Multiple artifact list layouts
- Theme large sizes (e.g. artifact card list)
- Way to filter:
  - rarity
  - level
  - substat roll chance
- lerna/package separation for main process, windows
- Language dropdown select
- Check for offset ui (when changing screen resolutions)

Minor:
- Change window chrome color when changing theme/dark mode

Fun:
- Change primary color based on favorite character

-->

![App Screenshot](https://github.com/Jugbot/genshin-locker/assets/5402388/4d9746c2-70e7-4de1-bbab-552cffff3542)

# Genshin Artifact Locker

A tool for automatically managing your artifacts.

Download the latest [release](https://github.com/Jugbot/genshin-locker/releases).

> [!CAUTION]
> **Before you use this!**
> Note interacting with the game and more importantly, modifying game state with external tools is a gray area as far as the TOS is concerned, so don't use this if you aren't willing to risk your account being banned.

### Features

- [x] Automatically read artifact data from the game.
- [x] Choose artifacts based on various criteria. Artifacts will be locked or unlocked to make for easy disposal in-game.
  - [x] You can write your own custom script using the example bundled with the app.
- [x] Supports any screen resolution.
- [x] Export artifacts to other popular tools such as [Genshin Optimizer].
- [x] Light mode for freaks.

### Upcoming

- [ ] Character & weapon scanning.
- [ ] Gamepad support.

### Usage

1. Open Genshin Impact. Make sure you don't have hdr enabled and that the controls are set to keyboard.
2. Open the artifact tab. From here you can apply any in-game filters to specify what artifacts to parse.
3. You can change the logic determining which components to lock by editing the script [`example.js`](https://github.com/Jugbot/genshin-locker/blob/main/resources/ArtifactScripts/example.js). Usually you would run the scanner first in "Scan" mode and then preview changes in logic in the right pane.
4. Run the scanner. Press [SPACE] to stop the scanning early.
5. If need be, you can export the scanned artifacts in GOOD format via the button in the upper right.

### Dev Setup

1. Do the usual git clone.
2. This project uses native node modules, so you will need to have a compiler installed if you don't already.
3. This is a yarn project, so run `yarn` to set up. I have pinned the node environment to `v16.x.x` so you might need to install node too. Of course if you have a node version manager this is easy.
4. Start the application with `yarn start` IN ADMINISTRATOR MODE or run through elevated vscode using [F5].

### Screen resolution not supported?

Either file an issue or add it yourself via the [README](./packages/automation/src/landmarks/README.md).

[Lineup Simulator]: https://act.hoyolab.com/ys/event/bbs-lineup-ys-sea/index.html
[Genshin Optimizer]: https://frzyc.github.io/genshin-optimizer
