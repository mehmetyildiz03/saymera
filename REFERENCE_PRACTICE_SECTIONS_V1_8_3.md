# Reference Practice Sections — v1.8.3

The two reference lessons now own explicit section-level question generation.

## Resume semantics

Practice has two counters:

- lifetime native evidence (`nativeAttempts/nativeCorrect`);
- current section cycle (`cycleAttempts/cycleCorrect`).

If a learner leaves at 2/4, reopening the section schedules only the remaining two base tasks. A section cycle can extend to two recovery tasks. If six tasks are exhausted without satisfying the gate, a later retry starts a fresh cycle while preserving lifetime evidence.

## Completion gate

A section completes only when the current cycle has:

- at least four attempts,
- at least three correct,
- a correct completion response.

The final practice section may close the first learning cycle only after all earlier practice sections are complete.

## Content ownership

The Lesson Center label now controls the question family.

Examples:

- **Basamak değerini gör** mixes model→number production, digit-value production, expanded form and zero-place reasoning.
- **Oku ve yaz** mixes word→numeral, numeral→word and zero-containing number reading.
- **İşaretleri kullan** uses only `< > =`, including explicit equality cases.
- **Sırala** includes pair ordering, three-number ordering, smallest-number and largest-number tasks.
- **Nedenini açıkla** asks why hundreds/tens/ones determine the comparison instead of simply repeating a symbol question.

This is the reference pattern for future lesson contracts such as `numberPattern1000`.
