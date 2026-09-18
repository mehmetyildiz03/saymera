# SAYMERA Feedback Language Standard

Child feedback describes the mathematics, not the child.

## Contract

- Do not praise or evaluate the learner with generic phrases such as “Aferin”, “Harika”, “Bağlantıyı kurdun” or “Doğru yaptın”.
- A successful action returns the mathematical relationship that has just been established.
- A correction directs attention to the relevant representation, place, quantity, operation or language role.
- Wrong answers are not framed as personal failure. The next useful observation is surfaced instead.
- Session completion is factual: what topic was worked on and how many tasks were completed.
- Voice feedback reads the same mathematical statement or corrective cue shown on screen.

Examples:

- `3 yüzlük = 300`
- `420 < 421, çünkü yüzlük ve onluklar aynı; 0 birlik, 1 birlikten küçüktür.`
- `Bu yuva onluk kısmı. “yirmi” buraya gelir.`
- `526 = beş yüz yirmi altı.`

The UI-level contract is guarded by `tests/feedback-language-contract.test.mjs`.
