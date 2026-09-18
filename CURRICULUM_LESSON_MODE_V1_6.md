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


## v1.6.1 — First complete P2 teaching sequence

After prerequisite readiness, `number1000` teaches MOE 1.1 (10 birlik→1 onluk, 10 onluk→1 yüzlük, 10 yüzlük→1000), then MOE 1.2 (347 place value, 444 same-digit place value), then MOE 1.3 (347↔üç yüz kırk yedi). Every teaching screen requires a child action. `lessonStepIndex` persists resume position and `lessonTaughtAt` prevents replay after completion.


## v1.6.2 — Lesson-first reference flow

The first P2 reference lesson no longer opens with a multiple-choice readiness quiz. For `number1000`, MOE 1.1 itself rebuilds the P1 tens/hundreds foundation, so the separate readiness screen is redundant and made the product feel quiz-first.

The child now enters the six-step teaching sequence directly. Guided and independent application still collect evidence afterwards, but correct/wrong feedback stays in the same task context instead of replacing the whole screen with a `DOĞRU → Sonraki göreve geç` card.

Place-value teaching has no ambiguous “Değerleri keşfet” button: the three digit cards are the interaction, and the next step unlocks after all three values are revealed.


## v1.6.3 — Stage navigation and lesson revisioning

The first reference lesson is versioned. An unfinished local-state record from the earlier quiz-first implementation cannot silently skip the revised teaching sequence; it is reset once to the beginning of the current lesson version.

For `number1000`, the child-facing header no longer presents one global task counter. It communicates the instructional stage:

- **KONU ANLATIMI**
- **BİRLİKTE UYGULA**
- **KENDİN DENE**

Within guided and independent work, any counter is stage-local rather than a “question 3 of 9” session counter.


## v1.6.4 — Direct discovery and digital writing

The reference lesson removes detached reveal buttons. The object that contains the unknown value is now the interaction itself: bundle-result `?` cards reveal the regrouped value; place-value cards reveal `300 / 40 / 7` in place; subtle digit-to-card arrows strengthen the positional-value mapping; and the mathematical connection lives inside the central teaching visual after the relevant discovery is complete.

Number words are revealed by parts rather than by a separate show-reading button. MOE 1.3 includes reading and writing numbers, so SAYMERA also adds a non-scored digital construction step (`526 = beş yüz yirmi altı`) using word parts. Freehand handwriting is not a required mathematics gate; it may later be offered as an optional stylus activity so motor execution does not contaminate conceptual assessment.


## v1.7.0 — MOE-complete reference lesson for P2 1.1–1.3

The reference lesson is expanded from isolated equivalences to actual learning experiences: counting in tens to 100, counting in hundreds to 1000, establishing 10 tens = 1 hundred and 10 hundreds = 1 thousand, making sense of the size of 100 through a 10×10 quantity, constructing 347 from a base-ten model, explaining place value, handling zero placeholders, and reading/writing numbers in numerals and words.

Child-facing lesson navigation groups the short interactions into semantic sections: **SAY → GRUPLA → KUR → BASAMAK → OKU / YAZ**. This is intentionally not presented as a long question counter. Comparison/order, number sequences and 1/10/100 more-or-less are not pulled forward; they remain for their later curriculum objectives.


## v1.7.1 — Reference lesson interaction polish

The child-facing counting cards no longer show cumulative totals such as 100/200/300 on identical hundred blocks. Every object is labelled by what it is (for example, **1 yüzlük**), while a separate central readout maps **number of hundreds → total value**. This prevents the visual misconception that the third hundred block is itself “300”.

The detached yellow `BAĞLANTI` strip is removed. Mathematical conclusions appear inside the central teaching visual as a revealed **ŞUNU GÖRDÜK** relationship.

The 100-dot experience is staged: first one 10-dot row is revealed, then all 10 rows, then `10 × 10 = 100`. Model-to-number builds `347` digit by digit. Place value shows concrete quantities under each digit before revealing `300/40/7`. Zero is shown as an actually empty place. Number-word construction uses Pointer Events drag-and-drop with a tap-to-select fallback for accessibility and touch robustness.
