# SAYMERA Learning Architecture v1.8

## Purpose

v1.8 separates four concepts that were previously too close together:

1. **Curriculum order** — the canonical Singapore MOE order for new learning.
2. **Prerequisites** — conceptual dependencies between lessons.
3. **Lesson journey** — Learn / Practice / Review state.
4. **Mastery evidence** — Kur · Gör · Yaz · Anlat · Taşı evidence used by the adaptive engine.

These layers can inform one another, but they are not interchangeable.

## Curriculum units

Primary 2 is exposed as ordered units. Flattening the units must equal `P2_MOE_SKILL_SEQUENCE` exactly. The first unit contains:

- 1000’e kadar sayı ve basamak
- 1000’e kadar karşılaştırma ve sıralama
- 1, 10 ve 100 ile sayı örüntüleri
- 1000’e kadar tek ve çift sayılar

Future new learning remains curriculum-locked. Earlier completed lessons remain revisit-able.

## Lesson channels

Every lesson has three independent channels:

- **Learn** — explicit teaching and manipulation.
- **Practice** — sectioned application. Progress is stored per practice section.
- **Review** — delayed retrieval / spaced return.

Practice is not represented as a fabricated percentage. The state exposes completed sections and total designed sections.

## Migration rule

Existing `learningCycle` state is retained and treated as compatibility evidence.

- Existing lesson completion migrates to Learn.
- Existing first-cycle completion is preserved as `practice.legacyCompletedAt`.
- Legacy phase attempts are copied only as `legacyAttempts / legacyCorrect`.
- Legacy evidence does **not** create fake completed practice-section ticks.
- Retrieval timing migrates to Review.

This permits the v1.8 Atlas and Lesson Center to be introduced without destroying existing learner progress.

## Reference contracts

`number1000` and `compareOrder1000` are the first explicit lesson contracts. Their Practice sections are content-specific. Later lessons remain `provisional:true` until their reference teaching/practice design is completed; the architecture deliberately does not invent generic section completion for them.
