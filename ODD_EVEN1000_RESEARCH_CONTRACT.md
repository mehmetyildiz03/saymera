# SAYMERA — P2 Odd / Even Numbers up to 1000
## Research and teaching contract for `oddEven1000`

Status: RESEARCHED CONTRACT — implementation must follow this document; this commit does not change runtime behavior.

## 1. Canonical curriculum position

SAYMERA keeps the Singapore MOE Primary Mathematics sequence unchanged.

Primary 2 → Number and Algebra → Whole Numbers → Numbers up to 1000:
1. counting in tens / hundreds
2. number notation, representations and place value
3. reading and writing numbers
4. comparing and ordering numbers
5. patterns in number sequences
6. odd and even numbers

Therefore `oddEven1000` follows `numberPattern1000` and precedes Addition and Subtraction.

Primary source:
- Singapore Ministry of Education, Primary Mathematics Syllabus P1–P6, updated Dec 2024:
  https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-dec-2024.pdf

## 2. Scope

The child should understand and use odd/even classification for whole numbers within 1000.

The conceptual meaning comes before the shortcut:
- EVEN: objects can be arranged into pairs with no object left over.
- ODD: pairing leaves exactly one object without a partner.
- A group of 10 can itself be completely paired.
- A group of 100 is made from tens, so it also contributes only complete pairs.
- Consequently, for a whole number written in hundreds–tens–ones, the unpaired remainder is determined by the ones.
- Only after that meaning is established do we name the ending-digit rule:
  - even endings: 0, 2, 4, 6, 8
  - odd endings: 1, 3, 5, 7, 9

The range must include examples with every possible ones digit 0–9 and must explicitly include a number ending in 0 and the endpoint 1000.

## 3. Non-goals / future-topic guard

This lesson must NOT depend on later multiplication/division content.

Do not use as the core explanation:
- multiplication tables,
- the multiplication sign,
- division notation,
- "divisible by 2" as the primary child-facing definition,
- skip-counting by 2 as the prerequisite proof,
- prime/composite language,
- factors or multiples.

Pairing is the canonical model. The final-digit rule is derived from pairing and place value, not stated as an unsupported memorisation rule.

## 4. Prerequisites and connections

Required mathematical ideas already available:
- hundreds, tens and ones;
- 10 ones = 1 ten;
- 10 tens = 1 hundred;
- numbers up to 1000;
- comparison and number-pattern experience.

Useful connection to the previous lesson:
- consecutive numbers alternate parity because adding or removing one object changes whether a pair is complete;
- adding or removing a complete ten or hundred does not alter the paired/unpaired status of the ones.

This connection may be used only after the pairing meaning is established.

## 5. Pedagogical evidence

The lesson follows SAYMERA's model → representation → symbol → reasoning → context progression.

External evidence used for the teaching design:
- MOE: odd/even belongs inside P2 Numbers up to 1000 and precedes multiplication/division.
- Pairing objects is an established elementary model for deciding odd/even.
- Manipulatives and one-to-one correspondence support the link between number and quantity.

Supporting references:
- Common Core Grade 2 OA.3 describes deciding odd/even by pairing objects or counting by twos. SAYMERA uses the pairing part because it does not require future multiplication language.
- Education Endowment Foundation early-mathematics evidence supports manipulatives, representations and one-to-one correspondence for number–quantity understanding.

These sources support pedagogy; MOE remains the canonical source for curriculum scope and order.

## 6. Learn channel — proposed dedicated progression

The dedicated lesson must teach before checking. Proposed steps:

1. `pair-six` — Pair 6 concrete counters. No counter remains. Introduce the meaning of even.
2. `pair-seven` — Pair 7 concrete counters. One remains. Introduce the meaning of odd.
3. `pair-contrast` — Compare two nearby quantities such as 8 and 9 using the same pairing action.
4. `ten-is-pairable` — Show 10 as five complete pairs. A whole ten adds no unpaired object.
5. `hundred-is-pairable` — Show that a hundred is built from complete tens; hundreds therefore do not create an unpaired one.
6. `ones-decide` — Decompose a three-digit number. Pairable hundreds/tens are visually subdued; the ones are inspected.
7. `zero-one-boundary` — Contrast numbers such as 430 and 431. Zero ones means no leftover; one one means one leftover.
8. `even-endings` — Derive, do not merely announce, 0/2/4/6/8 as endings that form complete pairs.
9. `odd-endings` — Derive 1/3/5/7/9 as endings that leave one.
10. `classify-three-digit` — Use the ones digit to classify mixed numbers, including 1000.
11. `consecutive-switch` — Show that moving by one changes even ↔ odd because a pair is completed or broken.
12. `pairing-transfer` — Move the idea to a real context such as children forming pairs or objects placed two per tray.

The child must interact in the concrete steps. A static picture alone is not sufficient evidence for `Kur`.

## 7. Child-facing section labels

Recommended Learn track:
- EŞLEŞTİR
- ARTANI GÖR
- BİRLİK
- KURAL
- SINIFLANDIR
- TAŞI

Keep labels short on phones.

## 8. Practice contract

The reference Practice channel should contain six sequential sections:

1. `pair-model` — İkişerli eşleştir
   - actually pair a small quantity / ones model;
   - identify whether 0 or 1 remains.

2. `see-leftover` — Artanı gör
   - discriminate correct pairing representations;
   - include both no-leftover and one-leftover examples.

3. `classify-parity` — Tek / çift sınıflandır
   - classify numbers within 1000;
   - cover all final digits 0–9 across generated practice.

4. `ones-rule` — Birlik basamağını kullan
   - connect the full number to the last digit;
   - include same hundreds/tens with different ones;
   - include endings 0 and 1 explicitly.

5. `explain-parity` — Nedenini açıkla
   - explain why tens/hundreds do not change parity;
   - explain a regrouped-looking case without invoking multiplication/division.

6. `transfer-parity` — Yeni durumda kullan
   - pair students, objects, seats, socks, cards, etc.;
   - ask whether one is left without a partner or whether everyone/everything can be paired.

Practice completion remains engine-owned:
- minimum 4 tasks,
- minimum 3 correct,
- final answer must be correct,
- at most 2 recovery tasks.

## 9. Representation requirements

`Kur`
- real pairing interaction, not a renamed multiple-choice question.

`Gör`
- distinguish paired / one-leftover models.

`Yaz`
- classify with the mathematical words `Tek` and `Çift`.
- do not introduce a new symbol for parity.

`Anlat`
- explain the ones-place reason.

`Taşı`
- decide the outcome of a new pairing context.

These must remain genuinely different evidence types.

## 10. Case coverage

Generated examples must cover:
- final digits 0,1,2,3,4,5,6,7,8,9;
- two- and three-digit contexts where helpful, but the reference target is numbers up to 1000;
- 1000 explicitly as even;
- same-prefix contrasts, e.g. 248 / 249;
- zero in the ones place, e.g. 430;
- zero in tens/ones where appropriate, e.g. 500;
- both even and odd transfer situations.

Avoid a tiny hard-coded set whose endings repeat only 2/3/4/5/6/7/8/9.

## 11. Feedback language

Correct feedback states the mathematics:
- `8 nesne ikişerli eşleşti; artan kalmadı. 8 çifttir.`
- `7 nesne ikişerli eşleşti; 1 nesne arttı. 7 tektir.`
- `430'da birlik sayısı 0. Eşsiz birlik kalmaz; 430 çifttir.`
- `527'nin birlik rakamı 7. 7 birlik ikişerli eşleşince 1 birlik artar; 527 tektir.`

Corrective feedback should identify the mathematical relation:
- `Birlikleri ikişerli eşleştir. 0 mı, 1 mi artıyor?`
- `Yüzlük ve onluk grupları tam çiftler oluşturur; birliklere yeniden bak.`

Do not use generic praise.

## 12. UI requirements

Phone is authoritative for density.

- Pairing targets must be large enough for touch.
- The child must be able to see completed pairs and the leftover distinctly.
- Do not display hundreds of individual counters for a three-digit number.
- Compress hundreds/tens as pair-safe place-value groups and make the ones visually primary.
- Whole-number labels must remain visible so the representation never becomes detached from the number.
- No horizontal overflow at phone widths.
- Wrong-answer feedback must not push the next action outside a reasonable scroll flow.

## 13. Review / retrieval

After the first cycle:
- delayed retrieval should use a fresh number/context;
- do not repeat the exact taught example;
- retrieval may alternate classification and transfer;
- a failed delayed retrieval receives immediate support and remains scheduled for a later delayed check, following the canonical review lifecycle.

## 14. Required QA before acceptance

Implementation is not accepted until tests prove:
- canonical P2 order remains unchanged;
- `oddEven1000` cannot open before `numberPattern1000` completion;
- dedicated Learn occurs before Practice;
- all ten ones digits 0–9 are represented in generation coverage;
- 1000 is classified even;
- pairing model produces only 0 or 1 leftover;
- final-digit rule is taught only after pairing meaning;
- no multiplication/division/prime/composite language enters the child flow;
- Practice sections are sequential;
- final-wrong completion gate remains enforced;
- delayed Review lifecycle works;
- Chromium + WebKit phone/tablet interactions have no horizontal overflow;
- real-device acceptance is performed after CI.

## 15. Implementation boundary

The existing generic `genOddEven1000` may be reused as low-level material where appropriate, but it is not the reference lesson.

Do not mark `oddEven1000` as an explicit Lesson Center contract until:
1. the dedicated Learn flow exists,
2. section-specific Practice generation exists,
3. tests for the above contract exist.

This avoids exposing an unfinished reference lesson in production.
