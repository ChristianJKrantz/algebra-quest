# Algebra Quest

A free, chapter-by-chapter college algebra study notebook. Each quest takes you from learning an idea to remembering it to using it on fresh problems. Hints point toward the method without giving answers away.

- **Chapter 1** Equations and inequalities
- **Chapter 2** Graphs and functions
- **Chapter 3** Polynomial and rational functions
- **Chapter 4** Exponential and logarithmic functions

## How it helps you learn and remember

| Step | What you do | Why it works |
| --- | --- | --- |
| **Learn** | Short lessons, worked examples revealed one step at a time, interactive graph labs | Worked-example effect: predict each step before revealing it |
| **Recall mode** | Key rules are covered until you say them from memory | Retrieval practice beats rereading |
| **Flashcards** | 134 cards across 27 quests, rated Forgot / Shaky / Knew it | Leitner-box spaced repetition (1, 3, 7, 16, 35, 60 days) |
| **Practice** | Endless randomly generated problems with specific feedback and a hint ladder | Immediate, targeted feedback |
| **Mixed review** | 8 problems from the topics you've practiced, weakest first | Interleaving: learning to spot which method a problem needs |
| **Chapter challenge** | 10 mixed problems scored like a test | Testing effect |

There are also a daily study plan, day streaks, a practice-test prep map (skills only, no answers) and printable cheat sheets with a "Quiz me" mode. Progress is saved only in your browser. Daylight and night themes are included, and it works offline as an installable app.

## Run it

No build step and no dependencies. Serve the folder:

```
python3 -m http.server 8765
```

## Tests

```
N=250 node tests/test_generators.js   # every generator: own answers pass, junk fails, hints don't leak
python3 tests/test_ui.py              # browser test of every page, lab, deck and practice flow (needs Playwright and the server above)
```

## License

Code: MIT. Fonts: SIL Open Font License, see `fonts/`.
