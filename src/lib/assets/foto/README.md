# Page-layout photographs (NOT the panel's directory)

Two photographs that are part of a page's layout rather than of the gallery: the hero image
on the homepage and the picture beside the core message in the O nas teaser. Both are
imported by name in the component that renders them and optimized at build by
`@sveltejs/enhanced-img` (AVIF/WebP srcset, intrinsic width/height so there is no CLS).

WHY THEY ARE NOT IN `../uploads`. That directory belongs to the editorial panel: it is where
the panel writes every photo an editor attaches, and `/o-nas` globs it to build the gallery.
A hero photograph kept there would appear in an editor's photo picker as though it were a
gallery tile, and the panel's deletion rule would have to reason about a file that two page
layouts depend on. Keeping the two directories apart makes the ownership obvious from the
path alone.

`budynek-front.jpg` was COPIED into `../uploads/` on 2026-08-18 so it could also be the
gallery's sixth tile. The original here stays, because the hero imports it from this path
and because the gallery cannot read a file outside its own directory. Editing the hero
photograph therefore now means replacing BOTH files, and that is the price of the split
rather than an argument against it.

The consequence, and it is a real one: these two pictures are NOT editable from the panel.
Changing either is a pull request. That is the accepted trade for the hero of a public
institution's homepage, and it is recorded here rather than discovered later.

Both photographs were taken by the żłobek and sent on 2026-08-18. Neither contains a child,
so no wizerunek consent is owed for them. Each carries a real Polish `alt` describing the
building, because they are content and not decoration.
