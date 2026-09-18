# Touch drag and comparison-symbol revision — v1.7.5

The comparison lesson now teaches notation in this order:

1. verbal comparison by place value;
2. definitions of “küçüktür / büyüktür / eşittir”;
3. drag `<`, `>`, `=` onto those definitions **without numbers**;
4. connect a verbal number sentence to its symbol;
5. use symbols and ordering with numbers.

Drag/drop uses pointer events for mouse, touch and pen, but drop targets are resolved from target bounding boxes instead of `document.elementFromPoint()`. This avoids the iOS/Safari failure mode where the dragged element retains pointer capture and masks the intended drop target.

Tap-card → tap-slot remains an accessibility/fallback interaction. It is not the primary interaction.

A one-time revision replay is scheduled for users who already completed the earlier comparison lesson, without clearing mastery. Number-pattern content is not changed in this release.
