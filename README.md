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

### Installing

1.

### Dev Setup

[Lineup Simulator]: https://act.hoyolab.com/ys/event/bbs-lineup-ys-sea/index.html
[Genshin Optimizer]: https://frzyc.github.io/genshin-optimizer
