# SAYMERA — Preschool NEL Curriculum Contract v2

Status: RESEARCHED CONTRACT. This document defines the canonical Singapore preschool numeracy scope before runtime migration.

## 1. Source authority

SAYMERA preschool follows Singapore MOE **Nurturing Early Learners (NEL) Framework 2022** and the current NEL Numeracy portal.

Primary sources:
- NEL Framework / guidelines: https://nel.moe.edu.sg/tl/framework-and-guidelines/
- NEL Numeracy overview and KSD: https://nel.moe.edu.sg/la/numeracy/overview/
- Counting skills and number sense: https://nel.moe.edu.sg/la/numeracy/num/counting-skills-and-number-sense/
- Relationships and patterns: https://nel.moe.edu.sg/la/numeracy/num/relationships-and-patterns/
- Shapes and spatial concepts: https://nel.moe.edu.sg/la/numeracy/num/shapes-and-spatial-concepts/
- CPA approach: https://nel.moe.edu.sg/la/numeracy/how-can-you-do-it-/using-concrete-pictorial-abstract--cpa--approach/
- Manipulatives and games: https://nel.moe.edu.sg/la/numeracy/how-can-you-do-it-/using-manipulatives-and-games/
- Current Primary Mathematics syllabus (Oct 2025): https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf

Supporting NEL resources:
- Matching → Sorting → Comparing → Ordering → Patterning progression:
  https://isomer-user-content.by.gov.sg/57/4b936b31-ba2a-4715-b4bb-c9afcf46275d/From%20simple%20to%20complex%20-%20Matching%20Sorting%20Comparing%20Ordering%20Patterning.pdf
- Four counting principles:
  https://isomer-user-content.by.gov.sg/57/0b1d3c48-5e04-4566-9e54-acfe84e2fac3/Four%20Counting%20Principles.pdf
- Number sense relationships:
  https://isomer-user-content.by.gov.sg/57/96b73061-096c-429b-9ca7-6ad17c452409/Understanding%20the%20Relationship%20between%20Numbers%20and%20Quantities.pdf

MOE is authoritative for scope. Supporting resources refine developmental progression and pedagogy; they do not create extra compulsory curriculum outcomes.

## 2. Product interpretation of NEL

NEL is for children aged 4–6 and states end-of-K2 expectations. It is **not** a Primary-style ordered syllabus.

Preschool therefore does not use the P2-style single locked curriculum chain.

SAYMERA models NEL as:
- three parallel development paths;
- one cross-cutting daily-life numeracy layer;
- suggested within-path progression;
- no requirement to complete all preschool content before entering P1.

This matters because the current Primary Mathematics syllabus explicitly assumes **no formal prior mathematics learning**, while recognising early numeracy skills such as matching, counting, sorting, comparing and simple patterns as useful grounding for P1.

## 3. NEL canonical learning goals

### Learning Goal 1 — Daily-life numeracy

Cross-cutting, not a separate mastery chapter:
- understand how and why numeracy is useful in daily life;
- use appropriate mathematical language in daily situations.

Every preschool reference skill should include authentic transfer, conversation or real-world action.

### Learning Goal 2 — Relationships and patterns

Official KSD:
- match, sort and compare by at least one attribute;
- order by attributes or event sequence;
- recognise, extend and create patterns;
- describe relationships and patterns.

Suggested developmental progression:
**Matching → Sorting → Comparing → Ordering → Patterning**

This is a development guide, not a hard lock across the whole preschool profile.

### Learning Goal 3 — Counting skills and number sense

Official KSD:
- rote count to at least 20;
- count reliably up to at least 10 things;
- conserve quantity for sets up to at least 10;
- recognise numbers in numerals and words;
- match number name / numeral / number word to a quantity;
- write numbers in numeral;
- compare two quantities up to 10 using same / more / fewer / less;
- name parts that form a whole up to 10.

Reliable counting must preserve the four NEL principles:
- one-to-one correspondence;
- stable order;
- cardinality;
- order irrelevance.

Number-sense teaching also uses:
- subitising;
- conservation of quantity;
- quantity comparison;
- part–whole relationships.

### Learning Goal 4 — Shapes and spatial concepts

Official KSD:
- recognise circle, square, rectangle and triangle;
- notice their attributes;
- use basic shapes to form other shapes or figures;
- develop position, direction and distance concepts:
  - top / bottom;
  - in front of / behind;
  - up / down;
  - left / right;
  - far / near.

## 4. SAYMERA Preschool v2 paths

The following are **product skill boundaries**, designed to give each NEL outcome meaningful evidence without turning every classroom activity into a separate mastery card.

### Path A — Relationships & Patterns

Recommended product progression:
1. `nelMatchAttributes` — match same objects / same attribute
2. `nelSortAttributes` — sort by a stated or discovered attribute
3. `nelCompareAttributes` — compare size / length / height and describe relation
4. `nelOrderAttributes` — order 3+ objects or a simple event sequence
5. `nelPatterns` — recognise and copy, extend, create and describe simple → more complex repeating patterns

`nelPatterns` must go beyond AB next-item questions. It needs copying, extension, production and description evidence.

Implementation status in v1.15.0: all five Path A reference skills are implemented as hidden NEL v2 skills with dedicated Learn/Practice evidence and browser QA. They remain hidden until the Preschool v2 foundation is ready for a controlled live-navigation migration.

### Path B — Counting & Number Sense

Recommended product progression:
1. `nelRoteCount20` — stable spoken number sequence to at least 20

   Implementation boundary: this skill assesses the **spoken sequence of number names**, not object quantity, numeral recognition or numeral writing. The UI should therefore be audio-first. Written number words may appear only as accessibility/adult-support fallback; a child must be able to respond by listening without reading them.

   v1.16.0 reference scope: forward spoken sequence to 20, continuing from a given number name, stable-order explanation, and transfer into rhyme/movement play. Short backward sequences are included as guided exposure because the NEL Educators' Guide gives them as an observation example, but backward counting is not used as an independent mastery endpoint.
2. `nelReliableCount10` — one-to-one counting, stable order, cardinality and order irrelevance

   v1.17.0 implementation boundary: this skill directly evidences all four NEL reliable-counting principles. The child must track each object once, apply the stable spoken sequence while counting, use the final number name as the set total, and verify that counting the same set in another order does not change the total. The reference lesson uses tangible on-screen objects first and includes a real-world transfer prompt. It does not require numeral writing or treat a visually guessed quantity as sufficient evidence.
3. `nelSubitise5` — instantly recognise small quantities in varied arrangements

   Research boundary: subitising is treated in the NEL Educators' Guide as a **supporting number-sense ability**, not as a separate numbered KSD in the NEL Framework table. SAYMERA keeps it as a distinct reference skill because the guide explicitly describes instant quantity recognition without one-by-one counting and recommends varied dot arrangements, games and mental images. It must therefore complement—not replace—KSD 3.2 reliable counting or KSD 3.3 conservation.

   Product scope: begin with very small immediately recognisable quantities, then use multiple arrangements of the same small quantity (e.g. dice/domino-like, structured and irregular). A correct response should not depend on numeral reading, and the child should not be encouraged to count the items one by one. The skill should distinguish **"I knew it was five"** from **"I counted 1, 2, 3, 4, 5"** as different evidence.
4. `nelConservation10` — same quantity despite rearrangement
5. `nelNumberRepresentations10` — number name ↔ numeral ↔ number word ↔ quantity
6. `nelNumeralFormation10` — form/write numerals 1–10 without making handwriting quality a mathematics mastery contaminant
7. `nelCompareQuantities10` — same / more / fewer / less; later “how many more/fewer?”
8. `nelPartWhole10` — compose/decompose quantities up to 10 in multiple ways

Rote counting, reliable counting and subitising may develop in parallel; this list is an instructional recommendation, not a claim that one must be fully mastered before the next can be experienced.

### Path C — Shapes & Space

Recommended product progression:
1. `nelBasicShapes` — recognise and name circle, square, rectangle, triangle across size/orientation
2. `nelShapeAttributes` — describe relevant attributes, not colour or orientation
3. `nelShapeCompose` — form new shapes/figures from basic shapes
4. `nelSpatialRelations` — position, direction and distance vocabulary in action

## 5. Symbol and formal-operation boundary

Preschool may use and recognise **numerals and number words**, because NEL explicitly requires them.

Preschool does **not** use these as core learning goals:
- `<` and `>` comparison notation;
- formal addition/subtraction equations as the definition of part–whole;
- written algorithms;
- formal operation procedures.

Example:
- Preschool target: six objects can be split into 2 and 4, or 5 and 1.
- P1 bridge: `6 = 2 + 4`, number bonds and formal addition/subtraction.

Likewise:
- Preschool target: one set has more/fewer/same.
- P1 later formalises numerical comparison and symbols where curriculum-appropriate.

## 6. Preschool evidence language

The Primary-oriented `Kur · Gör · Yaz · Anlat · Taşı` evidence model must not force symbolic writing into every preschool concept.

Preschool reference skills use the age-appropriate interpretation:

**Kur · Gör · Göster · Anlat · Taşı**

- **Kur:** manipulate / match / sort / arrange / build.
- **Gör:** recognise a quantity, relation, pattern, shape or spatial relation.
- **Göster:** point, select, place, act out or form the answer. Numeral production is used only where the official skill is numeral formation.
- **Anlat:** describe the mathematical relation in child-appropriate language.
- **Taşı:** use the idea in a new game, object set, movement or daily-life context.

The engine may keep internal evidence keys for compatibility, but the child-facing preschool contract must reflect the actual evidence type.

## 7. Pedagogy contract

NEL-aligned preschool learning should:
- use concrete and familiar materials before pictorial/abstract representations;
- use manipulatives and games;
- use stories, songs, rhymes and daily routines where they genuinely support the concept;
- use prompting questions that surface the child’s strategy;
- include real-world action rather than making the screen the entire experience;
- avoid generic praise as mathematical feedback;
- describe what the child observed or constructed.

Digital interaction complements, rather than replaces, physical play and real objects.

Good SAYMERA preschool prompts can deliberately send the child off-screen, e.g.:
- “Evde aynı türden 4 küçük nesne bul.”
- “Bunları iki farklı şekilde grupla.”
- “Hangisi daha uzun? Nasıl anladın?”

## 8. Assessment contract

NEL states that assessment is **not** about sitting children down to complete worksheets/tasks; games and daily activities can be used to observe learning.

SAYMERA therefore treats preschool mastery evidence as observation-like interaction:
- manipulation;
- selection in a game;
- creation;
- explanation;
- transfer.

Do not turn preschool into a rapid-fire quiz bank.

Wrong responses should trigger a simpler representation, re-pairing, re-arrangement or concrete support instead of escalating verbal correction.

## 9. Existing preschool skill audit

Legacy skill | Decision | NEL v2 destination
---|---|---
`subitize5` | concept is correct; redesign as reference lesson / migrate carefully | `nelSubitise5`
`count10` | too narrow; split rote sequence from reliable object counting | `nelRoteCount20` + `nelReliableCount10`
`compare10` | remove preschool `< >`; keep concrete quantity language | `nelCompareQuantities10`
`partwhole5` | range too narrow and too equation-forward | `nelPartWhole10`
`patternAB` | too narrow; needs create + describe and richer structures | `nelPatterns`
`shapesBasic` | preserve core; separate naming, attributes and composition | `nelBasicShapes` + `nelShapeAttributes` + `nelShapeCompose`
`sortAttribute` | preserve idea, add matching/comparing/ordering and richer attributes | Path A skills
`positionWords` | too narrow | `nelSpatialRelations`

Legacy evidence must not silently mark a materially redesigned NEL v2 skill complete.

## 10. Preschool → P1 bridge

Preschool is foundational but is **not a hard prerequisite for P1**.

Bridge map:
- `nelRoteCount20`, `nelReliableCount10`, `nelSubitise5`, `nelConservation10`, `nelNumberRepresentations10` → P1 `number20`
- `nelPartWhole10` → P1 `numberBonds10`, then `add20` / `sub20`
- `nelCompareQuantities10` → later P1 number comparison/order
- `nelPatterns` → P1 number-pattern work
- `nelBasicShapes`, `nelShapeAttributes`, `nelShapeCompose`, `nelSpatialRelations` → P1 geometry/spatial work
- matching/sorting/ordering support P1 logical reasoning, data and number-system learning

P1 starts with its own readiness and teaching. It must never require an account history proving preschool completion.

## 11. Navigation / progression architecture

Preschool should not inherit the P2 single locked Atlas sequence.

Preferred navigation:
- **İlişkiler & Örüntüler**
- **Sayma & Sayı Hissi**
- **Şekil & Uzam**

Within each path:
- recommend a developmental next step;
- allow revisiting;
- allow nearby experiences when developmentally appropriate;
- do not unlock distant formal Primary content.

The product may suggest a next activity without presenting preschool as a school-year checklist.

## 12. First implementation milestone

Do not replace the live preschool profile with the full v2 map in one incomplete commit.

Milestone order:
1. add canonical NEL metadata and tests;
2. implement one reference preschool skill end-to-end behind the new contract;
3. verify child language, touch interaction and real-device density;
4. add remaining v2 skill generators/reference lessons;
5. only then migrate the preschool navigation from legacy skills to the v2 paths.

The first reference skill should come from the simplest official pre-number progression: **matching**.

## 13. Acceptance gates

Preschool v2 is not accepted until tests prove:
- all official NEL Numeracy KSD 2.1–2.4, 3.1–3.8 and 4.1–4.4 map to product skills;
- daily-life numeracy is cross-cutting;
- no preschool comparison task requires `< >`;
- part–whole can reach 10 and does not require formal addition notation as the core concept;
- reliable counting explicitly exercises one-to-one, stable order, cardinality and order irrelevance;
- patterns include recognise + extend + create + describe;
- all four basic shapes and the required spatial relations are covered;
- P1 does not require preschool completion;
- redesigned v2 skills do not inherit legacy completion silently;
- phone/tablet interactions have no horizontal overflow;
- physical-device acceptance follows CI.
