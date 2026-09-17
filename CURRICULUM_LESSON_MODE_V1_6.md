# SAYMERA v1.6 — Curriculum-led Lesson Mode

## Product rule

For Primary 2, **new learning follows the curriculum sequence**. Adaptation may change support, representation, difficulty and review timing, but it may not jump to a later new topic.

A previously learned topic may reappear as a delayed review. This does not unlock a later topic early.

## Topic gate

A topic becomes the current new-learning topic when every earlier topic in the ordered reference sequence has completed its first learning cycle (`firstCycleCompletedAt`).

This is intentionally different from "mastery": delayed retrieval and later consolidation can continue after the next curriculum topic opens.

## Lesson, not quiz

The first cycle begins with a non-graded `lesson-intro` activity. The practice header labels the current activity as:

- `KONUYA GİRİŞ`
- `ÖN BİLGİ`
- `BİRLİKTE DENE`
- `KENDİN DENE`
- `KISA TEKRAR`

P2 topics have short teaching blueprints. `number1000` is the first reference lesson and explicitly introduces hundreds, tens and ones before independent checking.

## Child orientation

The practice header always exposes:

**class + domain → current topic → current activity → progress**

The child should never need to infer what topic is being learned from the question alone.

## Tablet viewport contract

At tablet widths (`>=700px`) the active lesson shell is bound to `100dvh` and does not use vertical page scrolling. The central visual/task area flexes to the remaining height; dense number-input controls use a compact two-column layout.

Phones may scroll when necessary. Browser/device runtime verification remains separate from the static contract.
