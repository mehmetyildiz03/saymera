# SAYMERA Developer Lesson Inspector — v1.8.4

The inspector is intentionally absent from normal child navigation. It is enabled only when the application is opened with:

`?inspect=1`

## Sandbox safety

Entering the inspector replaces the in-memory state with a deep clone. While the sandbox is active, `saveState()` does not write to localStorage. Exiting restores the original in-memory state object.

This means QA actions can:

- unlock curriculum paths,
- mark teaching as complete,
- simulate finished lessons,
- force delayed review due,
- reset a selected lesson,
- complete earlier practice sections,

without corrupting real learner progress.

## Direct navigation

For a selected lesson the inspector can:

- open the Lesson Center,
- launch a specific teaching step for the two reference lessons,
- launch a specific Practice section,
- simulate and launch due Review.

## Runtime pedagogy QA

The engine audit checks:

- canonical P2 curriculum order;
- no out-of-order future completion;
- future new-learning locks;
- sequential Practice completion;
- Review only after the first learning cycle;
- explicit reference lesson contracts;
- comparison symbol set limited to `< > =` and including equality;
- the hard Practice completion gate: at least four attempts, at least three correct, and a correct final response.

The UI audit additionally checks:

- comparison meaning is taught before notation is used with numbers;
- required number1000 reference teaching steps still exist;
- the hundred model keeps its 10×10 geometry;
- the ten rod keeps 10 equal cells;
- drag/drop uses geometry-based target resolution.

CI mirrors the critical contracts in `tests/dev-inspector.test.mjs`.
