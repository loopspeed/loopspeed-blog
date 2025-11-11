## Post 1

I almost quit my first Three.js game when the marble fell through the infinite void.

The night I thought everything was broken turned into the night I learned instanced physics are unforgiving but fixable.

> Visual hook: Photo of the whiteboard scribble "DON'T LET THE SPHERE ESCAPE" with arrows circling a sketchy level.

- "Why is gravity allergic to my code?" was the actual line I muttered before realizing I’d misaligned one collider by 0.02.
- I rebuilt the platform system so every tile recycles like a conveyor belt; the bug vanished and the frame rate jumped.
- Testing became story time: I recorded each fix with a screenshot so future-me could laugh instead of panic.

P.S. Want the collider checklist I wish I had on day one?

**Pinned comments**

- "Share the conveyor-belt schema! I need that recycling trick."
- "What tool did you use for the collision debug overlay?"
- "Can you post a before/after clip of the marble escape?"
- "I felt this—my player once fell forever too. How did you trace the culprit?"
- "Bookmarking for my first R3F prototype."
- "Drop the Rapier vs Cannon.js thoughts in a follow-up?"

## Post 2

My first WebGL win happened at 3:07am when a cosine color palette finally behaved like a sunrise.

I spent days fighting muddy gradients until one shader tweak made the whole course glow.

> Visual hook: Gradient strip image titled "Palette #27 — the keeper" overlaying the game screenshot.

- "Make it feel alive" was the challenge from a mentor, so I wrote a tiny GLSL function to breathe color into the tiles.
- Each hue now tracks player progress; every correct answer nudges the world warmer.
- Watching testers smile as the floor lit up told me the polish mattered as much as physics.

P.S. Should I open-source the palette generator?

**Pinned comments**

- "Yes please—link the GLSL snippet!"
- "Curious how you map quiz difficulty to color shifts."
- "Show us Palette #1 vs #27 for contrast."
- "Is the gradient baked or computed at runtime?"
- "Dropping this in our design Slack."

## Post 3

"Can a quiz feel like Mario Kart?"

It started as a sticky note dare and ended as the smoothest mechanic I’ve ever built.

> Visual hook: GIF of the platform rows recycling behind the marble with a caption bubble "Still rolling".

- I prototyped with static levels until a friend said, "I love it… but it ends." Challenge accepted.
- The solution: a row recycling system that reassigns data on the fly, so the world never runs out.
- The lesson: constraints are invitations; the right question keeps the build fun.

P.S. Want the pseudo-code for the recycling loop?

**Pinned comments**

- "Drop the noise algorithm you used for obstacles!"
- "How do you keep memory usage stable with endless rows?"
- "This reminds me of Temple Run—accidental homage?"
- "Show the data structure for the row metadata."
- "Pinning for my procedural design class."
- "Please host a live teardown of this system."

## Post 4

I learned the hard way that performance is a story you tell frame by frame.

Early builds danced at 25fps until a simple performance monitor script became my truth serum.

> Visual hook: Split-screen capture of FPS counter going from red 25 to green 120 with the caption "After the tuning montage".

- The Drei PerformanceMonitor whispered, "Decline"—so I introduced adaptive quality that throttles shaders before players notice.
- "It feels smoother" was the first feedback from my partner after the change, and that sentence was worth every refactor.
- Now I demo the high/medium/low modes like behind-the-scenes DVD extras; people love knowing there’s a safety net.

P.S. Should I share the quality toggles checklist?

**Pinned comments**

- "Which metrics triggered your quality drops?"
- "Does the adaptive mode also tweak post-processing?"
- "Can you post the Zustand store shape for performance states?"
- "Love the DVD extras metaphor—mind if I steal it?"
- "My mobile users need this—teach a workshop?"

## Post 5

The real breakthrough? Letting AI co-write the code without steering the ship.

I fed it prompts about shader structure, never the answers, and it became my pair-programmer instead of my crutch.

> Visual hook: Side-by-side screenshot of the prompt doc and the resulting shader with a caption "Context is the secret sauce".

- "Right context beats right answer" became my mantra, so I drafted clean-code checklists before every request.
- The assistant surfaced docs I hadn’t seen; I still owned the architecture, but it sped up every iteration.
- Watching the marble reflect colors that a prompt helped refine felt like cheating—except it was just good process.

P.S. Want the exact prompt template I use for shaders?

**Pinned comments**

- "Share the clean-code checklist link again!"
- "How do you keep AI from hallucinating wrong Three.js APIs?"
- "Would love a rundown of your prompt anatomy."
- "This makes me rethink how I brief AI tools."
- "Drop the GLSL refactor example in a carousel?"
- "Invite the AI to critique your next build live?"
