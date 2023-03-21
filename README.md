<!--
TODO

- [x] Artifact end of list detection
- [x] Artifact card string formatting
- [x] Artifact card lock state
- [ ] Update read artifacts when locking to reflect new lock status
- [ ] Tooltips, hovers
- [ ] Pause on _any_ keyboard press (+resume??/stop)
- [x] Dropdown
  - Routine lock options read, read&lock, lock
  - Scoring method popularity/rarity with and/or condition
- [x] export data
- [x] 16:9 (1920×1080), 16:10 (1920×1200)
  - [ ] Adding screen resolutions readme
- [ ] Install instructions + images
- [ ] Bundle sharp, tesseract
- [ ] Save settings in local storage
- [x] GL window icon
- [ ] remove this list and publish :)

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

![App Screenshot](https://user-images.githubusercontent.com/5402388/222936865-58104da3-f1c2-4cc1-b658-0f302610e6cd.png)

# Genshin Artifact Locker

A tool for automatically managing your artifacts.

### Features

- [x] Automatically read artifact data from the game.
- [x] Choose artifacts based on various criteria. Artifacts will be locked or unlocked to make for easy disposal in-game.
  - [x] Popularity in crowdsourced builds from [Lineup Simulator].
  - [x] Mainstat / substat rarity.
- [x] Supports any screen resolution.
- [x] Export artifacts to other popular tools such as [Genshin Optimizer]
- [x] Light mode for freaks.

### Upcoming

- [ ] Character & weapon scanning.
- [ ] Gamepad support.
- [ ] More filter methods.

<!-- Fix sharp dependency not being bundled
### Installing

1. Download the latest [release](https://github.com/Jugbot/genshin-locker/releases).
2. Install tesseract.
3. Install sharp.
-->

### Usage

1. Open Genshin Impact. Make sure you don't have hdr enabled and that the controls are set to keyboard. 
2. Open the artifact tab. From here you can apply any in-game filters to specify what artifacts to parse.
3. You can edit the logic determining which components to lock in the left pane. Usually you would run the scanner first in "Scan" mode and then preview changes in logic in the right pane.
4. Run the scanner. Press [SPACE] to stop the scanning early.
5. If need be, you can export the scanned artifacts in GOOD format.

### Dev Setup

1. Do the usual git clone
2. This is a yarn project, so run `yarn` to set up. I have pinned the node environment to `v16.x.x` so you might need to install node too. Of course if you have a node version manager this is easy.
3. You will need to install [tesseract 5](https://github.com/tesseract-ocr/tessdoc/blob/main/Installation.md#windows). You only need the engine, not the language trained data.
4. Start the application with `yarn start`.

[Lineup Simulator]: https://act.hoyolab.com/ys/event/bbs-lineup-ys-sea/index.html
[Genshin Optimizer]: https://frzyc.github.io/genshin-optimizer
