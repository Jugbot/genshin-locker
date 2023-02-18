### TODO

- [x] Artifact end of list detection
- [ ] Artifact card string formatting
- [x] Artifact card lock state
- [ ] Tooltips, hovers
- [ ] Pause on _any_ keyboard press (+resume??/stop)
- [x] Dropdown
  - Routine lock options read, read&lock, lock
  - Scoring method popularity/rarity with and/or condition
- [x] export data
- [ ] 16:9 (1920×1080), 16:10 (1920×1200)
- [ ] Install instructions + images
- [ ] Adding screen resolutions readme
- [x] GL window icon
- [ ] remove this list and publish :)
- [ ] Update read artifacts when locking to reflect new lock status

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

# Genshin Artifact Locker

---

A tool for intelligently choosing what artifacts to recycle.

## 🚧 Features 🚧

- [x] Automatically read artifact data from the game.
- [x] Choose artifacts based on various criteria. Artifacts will be locked or unlocked to make for easy disposal in-game.
  - [x] Popularity in crowdsourced builds from [Lineup Simulator](https://act.hoyolab.com/ys/event/bbs-lineup-ys-sea/index.html).
  - [x] Mainstat / substat rarity.
- [x] Supports any screen resolution(\*).
- [x] Export artifacts to other popular tools such as [Genshin Optimizer](https://frzyc.github.io/genshin-optimizer)
- [x] Light mode for freaks.
