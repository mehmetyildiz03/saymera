# SAYMERA — Preschool NEL Curriculum Contract v2

Status: CANONICAL MASTER CURRICULUM CONTRACT. This document defines the Singapore preschool Numeracy scope, product mapping and acceptance gates before live Preschool v2 navigation migration.

Current reference baseline: **NEL Framework 2022** + current MOE NEL Numeracy portal. Re-verified on **2026-09-25**; the NEL framework overview reports its 2025-05-29 update and the Counting Skills & Number Sense page reports a 2025-12-31 update.

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

The code-level source of truth is `PRESCHOOL_NEL_CURRICULUM` in `engine.mjs`. It preserves all **18 official Numeracy KSDs**. Product skills are allowed to split one KSD into multiple evidence experiences, but they may not silently invent a new official KSD.

### Learning Goal 1 — Daily-life numeracy

This is **cross-cutting**, not a fourth mastery path.

- **1.1** — notice how and why numeracy is useful in daily life;
- **1.2** — use appropriate mathematical language in daily situations.

Product rule: every implemented Preschool v2 lesson contract must contain both:
- a real-world/context transfer section;
- a child-appropriate explanation/reasoning section.

### Learning Goal 2 — Relationships and patterns

- **2.1** — match, sort and compare using at least one relevant attribute;
- **2.2** — order by attributes or event sequence;
- **2.3** — recognise, extend and create patterns;
- **2.4** — describe recognised/created relationships and patterns.

Suggested developmental progression:
**Matching → Sorting → Comparing → Ordering → Patterning**

This is a developmental guide, not a hard profile-wide lock.

### Learning Goal 3 — Counting skills and number sense

- **3.1** — rote-count to at least 20;
- **3.2** — count reliably to at least 10 things;
- **3.3** — conserve quantity when a set of up to 10 is rearranged;
- **3.4** — recognise number representations in numeral and number-word form;
- **3.5** — connect number name / numeral / number word with quantity;
- **3.6** — write/form numerals;
- **3.7** — compare two sets up to 10 using same/more/fewer/less language;
- **3.8** — identify parts that form a whole up to 10.

The Educators' Guide refines **3.2 Reliable counting** into four separately observable principles:
- **3.2.1** one-to-one correspondence;
- **3.2.2** stable order;
- **3.2.3** cardinality;
- **3.2.4** order irrelevance.

`nelReliableCount10` must retain evidence for all four.

**Subitising is supporting Number Sense pedagogy, not a numbered KSD.** SAYMERA keeps `nelSubitise5` as a product skill but the master curriculum marks it explicitly as supporting rather than pretending it is a new official KSD.

### Learning Goal 4 — Shapes and spatial concepts

- **4.1** — recognise circle, square, rectangle and triangle;
- **4.2** — attend to the attributes of those four shapes;
- **4.3** — compose other shapes/figures from the basic shapes;
- **4.4** — use position, direction and distance concepts: top/bottom, in front/behind, up/down, left/right, far/near.

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

   Official boundary: this skill implements **NEL KSD 3.3** — recognising that the quantity of a set of up to 10 things stays the same regardless of arrangement. It is about conservation of **discrete quantity/cardinality**, not conservation of length, volume, mass or other Piaget-style conservation tasks.

   Teaching boundary:
   - the same set of objects should be visibly rearranged without adding or removing any object;
   - use several layouts such as a tight cluster, spread-out line, array, circle and random arrangement;
   - the child should judge whether the amount stayed the same **without being forced to recount every item**;
   - numeral reading/writing is not required evidence;
   - object size, spacing or occupied screen area must not be treated as quantity;
   - the interaction should surface the common misconception that a more spread-out set has “more”.

   Evidence should include:
   - **Gör:** recognise that a set still has the same amount after rearrangement;
   - **Kur/Göster:** actively rearrange the same objects and keep the quantity unchanged;
   - **Anlat:** explain in child-appropriate language that none were added or taken away;
   - **Taşı:** repeat the idea with real objects in a daily-life context.

   Distinguish this from KSD 3.2 order irrelevance. Order irrelevance asks whether counting the same set from a different starting point/order gives the same total. Conservation asks whether changing the **spatial arrangement itself** changes the quantity. SAYMERA must preserve both as separate evidence.

5. `nelNumberRepresentations10` — number name ↔ numeral ↔ number word ↔ quantity

   Official role: this product skill jointly implements **KSD 3.4** (recognise numbers in numeral and written-word forms) and **KSD 3.5** (connect spoken number name / numeral / written number word with quantity).

   Representation contract:
   - **number name** = the spoken name of the number; it is not the same evidence as reading a written word;
   - **numeral** = the written mathematical symbol, e.g. `5`;
   - **number word** = the written language form, localised in SAYMERA (e.g. Turkish `beş`);
   - **quantity** = the amount itself, shown through varied concrete/pictorial representations rather than a single dot-card template.

   NEL Educators' Guide examples include objects, fingers, ten frames, tally marks and base-10 materials as ways to represent quantity. SAYMERA does not need to use every material in every lesson, but the child must learn that the same quantity can appear in more than one representation.

   Product boundary:
   - reference implementation will use quantities **1–10** to stay coherent with the surrounding early-number work; this is a SAYMERA product boundary, not a claim that KSD 3.4/3.5 explicitly state a 10-only ceiling;
   - teach each representation link before testing it;
   - preserve audio for spoken number names so general reading ability does not become the only route to mathematical evidence;
   - written number-word recognition still needs genuine visual evidence because KSD 3.4 explicitly includes words;
   - do **not** score handwriting/formation here; numeral production belongs to separate KSD 3.6 / `nelNumeralFormation10`;
   - do not let a child pass by memorising one fixed dot arrangement; vary the quantity model.

   Implemented evidence:
   - **Kur:** build/select a quantity, then attach the matching numeral or word card;
   - **Gör:** recognise the same quantity across varied representations;
   - **Göster:** match spoken name, numeral and written word to quantity in both directions;
   - **Anlat:** identify which representations mean the same amount and why;
   - **Taşı:** find/use numerals and quantities in an authentic daily-life context.

   v1.20.0 reference implementation:
   - 10 Learn steps teach quantity → spoken number name → numeral → written number word → mixed representation links before checking;
   - written number words 1–10 are introduced explicitly;
   - spoken number-name evidence requires an actual listen action in both Learn and the form-matching Practice task;
   - quantity models rotate across objects, fingers, ten frame and tally marks;
   - daily-life transfer uses quantity-bearing contexts rather than treating door/bus/date identifiers as cardinal evidence;
   - 5 Practice sections plus Review are covered by Chromium and WebKit browser QA on phone and tablet viewports;
   - no numeral handwriting or numeric-entry task is used in this skill.

6. `nelNumeralFormation10` — produce/write numerals while keeping mathematical evidence distinct from penmanship quality

   **Official role:** implements **NEL KSD 3.6 — “Write numbers in numeral.”**

   **Source-derived teaching guidance (NEL Educators' Guide 2022):**
   - children can **form the numeral 5 using playdough**;
   - numeral writing should be offered **when appropriate and in a meaningful context**, with **recording scores for a game** given as an example;
   - this follows the broader NEL CPA direction: tangible/concrete experience can lead through pictorial representation to abstract words and symbols.

   **SAYMERA product boundary (not an official KSD ceiling):**
   - the reference skill will cover numerals **1–10**, matching the surrounding early-number product scope;
   - KSD 3.6 itself is not represented here as explicitly stating a 1–10 ceiling;
   - `10` is treated as a **two-digit numeral** made from the digit shapes `1` and `0`;
   - the `0` in `10` is a glyph component for writing the numeral ten, **not** a separate zero-quantity mastery target in this skill.

   **Production and scoring boundary:**
   - intentional numeral production is required; recognition alone is not enough;
   - the produced numeral must be recognisable as the intended numeral;
   - exact stroke order is **not** a mathematics mastery requirement unless later official evidence gives a reason to make it one;
   - handwriting beauty, neatness and speed are **not** mathematics scores;
   - the app may give supportive path/corridor guidance for touch, mouse or stylus, but it should tolerate ordinary young-child motor variation;
   - no OCR/handwriting-recognition dependency is required for the reference implementation;
   - the digital task complements real material formation and real writing rather than replacing them.

   **Implemented evidence:**
   - **Kur:** form a numeral shape with a malleable/material-like interaction, reflecting the official playdough example;
   - **Gör:** follow a broad visual numeral path as supported formation practice, without turning recognition into the mastery endpoint;
   - **Yaz:** intentionally produce the numeral associated with an already-understood number;
   - **Anlat:** identify what number the written mark records and connect it back to its number meaning;
   - **Taşı:** record a meaningful number in a game or daily activity, such as a score.

   `nelNumeralFormation10` depends conceptually on the representation work already taught in `nelNumberRepresentations10`: the child should know what a numeral **means** before the app treats producing its written form as evidence.

   v1.21.0 reference implementation:
   - 10 Learn steps cover numerals 1–10 with material-like formation and broad guided paths before independent writing evidence;
   - the official playdough example is represented by a distinct thick “material” formation mode rather than a keyboard task;
   - Practice has five evidence sections: material formation, guided path, independent numeral writing, explaining what the written numeral records, and meaningful score recording;
   - touch, stylus and mouse use the same normalized 0–100 geometry;
   - acceptance uses broad checkpoint/path coverage with ordinary motor tolerance and does **not** require a fixed stroke direction/order;
   - visibly off-path scribbling is rejected, while the same numeral path drawn in reverse direction is accepted;
   - free-write and score-recording tasks keep the acceptance guide visually hidden;
   - `10` requires both written digit components (`1` and `0`) while keeping zero-quantity mastery outside this skill;
   - there is no OCR and no numeric-keypad substitute for formation evidence;
   - Chromium and WebKit QA cover phone and tablet viewports, including horizontal-overflow and touch-target checks.

7. `nelCompareQuantities10` — compare the quantity of two sets up to 10 using appropriate relational language

   **Official role:** implements **NEL KSD 3.7** — compare the quantities of **two sets of up to 10 things each** and use **“same as”, “more than”, “fewer than” and “less than”** appropriately.

   **Source-derived teaching progression (NEL Educators' Guide 2022):**
   - early comparison should focus first on deciding whether one set is **the same as** or **more than** another;
   - **less/fewer than** is described as a more difficult relation and should follow;
   - once children can reliably identify same/more/less relations, it is useful to proceed to **how many more** or **how many less/fewer**;
   - official examples compare groups of objects verbally and include making/reading a **real-object graph**, such as two rows of children.

   **SAYMERA mathematical boundary:**
   - the compared property is **quantity/cardinality**, not object size, length, height, colour, occupied screen area or another attribute;
   - this must remain distinct from KSD 2.1 / `nelCompareAttributes`, where size, length and height are legitimate comparison attributes;
   - both sets stay within the explicit official maximum of **10 things each**;
   - one-to-one pairing and leftover objects are preferred concrete evidence because they make “same / more / less” visible without requiring formal notation;
   - counting may support the comparison, but comparing two written numerals alone is not sufficient evidence for this preschool KSD;
   - spacing, arrangement and object size must not become shortcuts for quantity. Equal sets can be shown at different spacing, and a smaller set can deliberately occupy more screen area;
   - **`<` and `>` are not KSD 3.7 mastery targets**. SAYMERA keeps formal comparison symbols for later curriculum-appropriate learning.

   **Turkish localisation boundary:**
   - official English source terms remain explicit in curriculum metadata;
   - child-facing Turkish uses natural quantity language: **“aynı sayıda”**, **“daha çok”**, **“daha az sayıda”**, **“daha az”**;
   - SAYMERA does not turn the English grammatical distinction between *fewer* and *less* into two artificial mathematical concepts for a Turkish-speaking child.

   **Planned core evidence:**
   - **Kur:** pair the objects in two sets one-to-one and expose whether anything is left unmatched;
   - **Gör:** identify same/more relations before progressing to the less/fewer relation;
   - **Göster:** select or act out the appropriate verbal quantity relation without `<` or `>`;
   - **Anlat:** explain the relation using matched pairs and any leftover objects rather than visual area;
   - **Taşı:** compare rows/groups in a real-object-graph style daily-life activity.

   **Supported extension, not an extra KSD 3.7 mastery gate:** after same/more/less is secure, SAYMERA may ask **“kaç tane daha çok / kaç tane daha az?”**. The Educators' Guide recommends this as the next useful step, but the numbered KSD itself requires comparison and appropriate relation language, not a separate numerical-difference endpoint.

   v1.22.0 reference implementation:
   - 10 Learn steps move from one-to-one pairing and same/more relations toward less/fewer language, explanation and real-object-graph transfer;
   - comparison is always between two concrete/pictorial sets of at most 10 objects each;
   - one-to-one pairing exposes unmatched objects as the primary concrete proof of more/less;
   - misleading size, spacing and occupied-area cues are deliberately varied so visual area cannot stand in for cardinality;
   - formal `<` and `>` symbols are excluded from child-facing KSD 3.7 evidence;
   - Turkish child-facing language uses natural phrases such as “aynı sayıda”, “daha çok” and “daha az sayıda” while preserving official English terms in metadata;
   - “kaç tane daha çok / daha az?” remains an extension rather than a core completion gate;
   - Practice has five evidence sections: one-to-one pairing, same/more recognition, less-language use, leftover-based explanation and real-object-graph transfer;
   - Chromium and WebKit QA cover phone and tablet viewports, one-to-one graph alignment, anti-spacing/anti-size cues, Review and Inspector sandbox isolation.

8. `nelPartWhole10` — name the parts that form a whole quantity up to 10

   **Official role:** implements **NEL KSD 3.8** — **“Name the parts that form the whole in a quantity of up to 10”**, with official examples such as 5 being made up of 2 and 3, or 1 and 4.

   **Source-derived teaching guidance (NEL Educators' Guide 2022):**
   - part-whole means understanding that a number can be split into parts;
   - a whole number can be represented in **two or more parts**;
   - the guide uses a **tower of five blocks** in two colours to show different ways of composing the same whole;
   - it also uses a **bracelet/bead activity** where the same beads are moved into two groups and the two part quantities are named;
   - the guide explicitly records multiple decompositions of 5, including **2 and 3, 3 and 2, 1 and 4, and 4 and 1**;
   - **finger play during routines/transitions** is suggested to reinforce different parts that make 5;
   - this understanding is identified as a foundation for later addition and subtraction.

   **SAYMERA mathematical boundary:**
   - the official maximum whole is **10**;
   - the initial digital reference range will be wholes **2–10**, because the core interaction uses two **non-empty** parts; this lower bound is a SAYMERA product choice, not an official NEL minimum;
   - the reference flow begins with **two-part decompositions**, because that is the dominant official example structure, while preserving the broader idea that a whole may be represented in **two or more parts**;
   - several different decompositions of the **same whole** must be shown; one memorised split is not enough;
   - swapping the positions of two parts remains a valid representation of the same whole (e.g. 2-and-3 / 3-and-2);
   - zero-part decompositions are **not** a core target unless later official evidence supports bringing zero into this preschool KSD;
   - numerals may label already-understood quantities, but a formal addition equation such as `2 + 3 = 5` is **not required** to define or master KSD 3.8;
   - a Primary-style number-bond diagram is not required as the preschool mastery representation.

   **Implemented evidence:**
   - **Kur:** physically/digitally split one fixed whole set into two non-empty parts without changing the total;
   - **Gör:** recognise several different splits that still make the same whole;
   - **Göster:** name/select the two part quantities that form the whole;
   - **Anlat:** explain that the parts changed but all original objects still belong to the same whole;
   - **Taşı:** use fingers, beads/bracelet, coloured blocks or another real-object context to show a new split.

   This skill bridges naturally to later P1 number bonds, but **P1 number-bond completion must not be back-ported as the preschool mastery definition**.

   v1.23.0 reference implementation:
   - 10 Learn steps begin from one whole set, then build 2-and-3, 1-and-4 and swapped 4-and-1 decompositions of five before varying the whole;
   - Learn explicitly shows multiple decompositions of the same whole and includes a three-part example so “two or more parts” is not reduced to a fixed two-box rule;
   - child interaction moves the original objects into parts, so every object is used exactly once and the whole is preserved;
   - Practice has five evidence sections: splitting the whole, recognising another decomposition, naming the parts, explaining why the whole is unchanged, and transferring to fingers/bracelet-style contexts;
   - zero-part decompositions and formal addition equations are excluded from the core preschool evidence;
   - no Primary number-bond terminology or diagram is required for KSD 3.8 mastery;
   - Chromium and WebKit QA cover phone and tablet viewports, multiple and swapped decompositions, the three-part concept, Review, horizontal overflow and Inspector sandbox isolation.

Rote counting, reliable counting and subitising may develop in parallel; this list is an instructional recommendation, not a claim that one must be fully mastered before the next can be experienced.

### Path C — Shapes & Space

Recommended product progression:
1. `nelBasicShapes` — recognise and name circle, square, rectangle, triangle across size/orientation

   **Official role:** implements **NEL KSD 4.1 — recognise the four basic shapes: circle, square, rectangle and triangle.**

   **Source-derived observation and teaching guidance (NEL Framework / Educators' Guide 2022):**
   - children should recognise and name the four basic shapes in their **classrooms and immediate environment**;
   - shape recognition must survive changes in **size and orientation** rather than depending on one prototype;
   - children learn shape names while they **look at, touch and hold** objects/shapes in their environment;
   - the guide notes that children often recognise circles and squares before other shapes, but this is developmental guidance, not a reason to omit rectangle or triangle from the KSD.

   **SAYMERA KSD 4.1 boundary:**
   - the complete official target set is exactly **circle / square / rectangle / triangle**;
   - Turkish child-facing names are **daire / kare / dikdörtgen / üçgen**;
   - colour, absolute size and orientation are deliberately varied because none of them defines shape identity;
   - a square remains a square when rotated; a triangle does not have to point upward; rectangles appear in horizontal and vertical orientations;
   - naming evidence must not depend on reading fluency: spoken/audio shape names remain available in child-facing naming tasks;
   - environmental examples should preserve the underlying 2D shape rather than confusing a whole 3D object with a 2D shape.

   **Separation from later shape KSDs:**
   - **KSD 4.2 / `nelShapeAttributes`** owns explicit attribute reasoning such as number of sides and equal-side properties;
   - KSD 4.1 may expose varied examples, but **side counting or equal-side explanations are not required for 4.1 mastery**;
   - **KSD 4.3** owns composing new shapes/figures from basic shapes;
   - **KSD 4.4** owns position, direction and distance language.

   **Planned evidence:**
   - **Kur:** match a basic-shape piece to another instance of the same shape;
   - **Gör:** recognise the same shape across different size and orientation;
   - **Göster:** select/name daire, kare, dikdörtgen or üçgen without requiring written-word reading;
   - **Anlat:** show that rotating or resizing the figure does not change its shape name, without requiring KSD 4.2 property vocabulary;
   - **Taşı:** find the same 2D shape in a classroom/immediate-environment style scene.

2. `nelShapeAttributes` — describe relevant attributes, not colour or orientation
3. `nelShapeCompose` — form new shapes/figures from basic shapes
4. `nelSpatialRelations` — position, direction and distance vocabulary in action

### Current Preschool v2 implementation status

Status after SAYMERA v1.23.0:

Product skill | NEL role | Status
---|---|---
`nelMatchAttributes` | 2.1 / supports 2.4 | ✅ implemented + browser QA
`nelSortAttributes` | 2.1 / supports 2.4 | ✅ implemented + browser QA
`nelCompareAttributes` | 2.1 / supports 2.4 | ✅ implemented + browser QA
`nelOrderAttributes` | 2.2 / supports 2.4 | ✅ implemented + browser QA
`nelPatterns` | 2.3 + 2.4 | ✅ implemented + browser QA
`nelRoteCount20` | 3.1 | ✅ implemented + browser QA
`nelReliableCount10` | 3.2 + 3.2.1–3.2.4 | ✅ implemented + browser QA
`nelSubitise5` | supporting Number Sense | ✅ implemented + browser QA
`nelConservation10` | 3.3 | ✅ implemented + browser QA
`nelNumberRepresentations10` | 3.4 + 3.5 | ✅ implemented + browser QA
`nelNumeralFormation10` | 3.6 | ✅ implemented + browser QA
`nelCompareQuantities10` | 3.7 | ✅ implemented + browser QA
`nelPartWhole10` | 3.8 | ✅ implemented + browser QA
`nelBasicShapes` | 4.1 | **NEXT**
`nelShapeAttributes` | 4.2 | planned
`nelShapeCompose` | 4.3 | planned
`nelSpatialRelations` | 4.4 | planned

This table is a product implementation snapshot, not a claim that NEL itself prescribes this software order.

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
- all 18 official NEL Numeracy KSDs (1.1–1.2, 2.1–2.4, 3.1–3.8, 4.1–4.4) exist in the canonical master curriculum;
- KSD 1.1 and 1.2 are enforced cross-cutting rather than turned into isolated mastery chapters;
- every implemented Preschool v2 lesson includes context/transfer and mathematical explanation evidence;
- no preschool comparison task requires `< >`;
- part–whole can reach 10 and does not require formal addition notation as the core concept;
- reliable counting explicitly exercises one-to-one, stable order, cardinality and order irrelevance;
- patterns include recognise + extend + create + describe;
- all four basic shapes and the required spatial relations are covered;
- P1 does not require preschool completion;
- redesigned v2 skills do not inherit legacy completion silently;
- phone/tablet interactions have no horizontal overflow;
- physical-device acceptance follows CI.
