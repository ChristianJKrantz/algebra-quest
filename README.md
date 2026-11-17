# Algebra Quest

A free, chapter-by-chapter college algebra study game. Learn the idea, watch a worked example, play with interactive graphs, then practice with endless randomly generated problems. Hints nudge toward the method without giving answers away.

- **Chapter 1** Equations and inequalities
- **Chapter 2** Graphs and functions
- **Chapter 3** Polynomial and rational functions
- **Chapter 4** Exponential and logarithmic functions

Each chapter has quests (lesson, worked examples, labs, practice), a 10-problem chapter challenge, a skill-level practice-test prep map and a printable cheat sheet. Progress (stars, XP) is saved only in your browser.

## Run it

No build step and no dependencies. Open `index.html`, or serve the folder:

```
python3 -m http.server 8765
```

## Tests

```
N=250 node tests/test_generators.js   # every generator: own answers pass, junk fails, hints don't leak
python3 tests/test_ui.py              # browser smoke test (needs Playwright and the server above)
```

## License

MIT
