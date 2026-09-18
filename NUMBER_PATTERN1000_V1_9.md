# P2 Number Patterns Reference Lesson — v1.9.1

## Research basis

Singapore Primary 2 places **patterns in number sequences** inside **Numbers up to 1000**, after comparing/ordering and before odd/even numbers.

The official learning-experience language is especially important for SAYMERA: learners should **describe a given number pattern before continuing the pattern or finding the missing number(s)**. The same whole-number block asks learners to use base-ten representations for numbers that are 1, 10 or 100 more/less than a three-digit number.

Historical Singapore Primary 2 textbook examples documented by NIE include sequences such as:

- 103, 104, 105, …
- 32, 42, 52, …
- 232, 222, 212, …
- 440, 340, 240, …

This supports a place-value interpretation of ±1, ±10 and ±100 rather than treating the topic as an IQ-style “guess the next number” puzzle.

## Learn progression

1. 1 more → one more unit
2. 10 more → one more ten
3. 100 more → one more hundred
4. 10 less → one ten less
5. Compare a complete sequence by place-value columns
6. Cross a place-value boundary explicitly: 290 → 300, where 9 tens + 1 ten regroup as 1 hundred
7. Describe an increasing rule in words
8. Describe a decreasing rule in words
9. Continue a sequence only after the rule is explicit
10. Find a missing internal term and verify from both sides
11. Recognise the same rule with a different starting number

Multiplication/skip-count patterns are intentionally excluded from this lesson because multiplication tables occur later in the canonical P2 sequence.

## Practice contract

- Değişimi modelde gör
- Kuralı sözcükle söyle
- Örüntüyü sürdür
- Eksik sayıyı bul
- Basamak değişimini açıkla
- Aynı kuralı yeni durumda kullan

All reference tasks are restricted to step sizes ±1, ±10 and ±100.


## Boundary rule

The lesson distinguishes **step size** from **which written digits happen to change**.

- +1 means one unit more.
- +10 means one ten more.
- +100 means one hundred more.

At a place-value boundary, regrouping can change more than one written digit. For example, 290 → 300 is still “10 more”: 9 tens + 1 ten = 10 tens = 1 hundred. Practice reasoning therefore avoids the false shortcut “+10 changes only the tens digit”.

## v1.9.2 reference audit

- All six signed changes are explicitly taught: ±1, ±10, ±100. Model-change steps show the quantities as hundred grids, ten rods and units before and after the action.
- Continuation and internal-gap teaching require a correct word rule before number cards appear. Each new practice/review continuation sequence also requires its own rule; the rule is derived from the displayed sequence, including gaps, rather than a potentially different concept anchor.
- A wrong rule keeps number entry closed and marks subsequent work as supported. A rule selection does not count as a completed practice task.
- Model practice includes visible base-ten transitions and construction of the resulting quantity with blocks.
- Browser regression coverage uses Chromium touch input and WebKit pointer/tap input at phone and tablet viewport sizes. These checks simulate devices; they do not establish physical iPhone/iPad compatibility.
- Inspector progress remains isolated from real localStorage. Completion and curriculum order contracts are unchanged.

The browser audit also caught and fixed a full-width rotated arrow intercepting mobile taps, and normalization writing to localStorage before inspector sandbox entry. Sandbox isolation now starts before normalization.
