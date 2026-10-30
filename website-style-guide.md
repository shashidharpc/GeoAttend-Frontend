# Website style notes

Keep this file open while building. The idea is to make a few decisions once, then stop second-guessing them.

The look I'm going for: warm, quiet, a bit editorial. Lots of empty space, one accent color, nothing shouting.

---

## Colors

I'm sticking with one palette and not mixing in extras.

```css
:root {
  --paper:   #FAF8F5;  /* page background, slightly warm, never pure white */
  --sand:    #E8E2D9;  /* cards, dividers, section backgrounds */
  --ink:     #2B2B2B;  /* all text */
  --clay:    #C2785C;  /* the only accent: buttons, links, small highlights */
  --stone:   #6F6A63;  /* secondary text, captions, dates */
}
```

A few habits that keep it from looking messy:

- Clay only shows up where someone should click or look. If a page has clay in six places, it's too much.
- Text is always ink or stone. Never grey on sand, it gets hard to read.
- If I ever want a dark version, I swap paper and ink, and lighten clay a little to `#D98C6F`.

Other palettes I considered, in case I change my mind:

- **Cool and professional:** `#F8FAFC` background, `#1E293B` text, `#3B82F6` accent
- **Natural and calm:** `#F6F7F2` background, `#2F3A2F` text, `#7A9E7E` accent
- **Dark and sleek:** `#0F172A` background, `#E2E8F0` text, `#A78BFA` accent

---

## Fonts

Two fonts, no more.

- **Headings:** Playfair Display, semi-bold. It gives the page some personality.
- **Everything else:** Inter, regular weight. Plain and easy to read.

Sizes that feel right on desktop: headline around 52px, section titles around 32px, body text 17px with generous line spacing (about 1.65). On phones, drop the headline to around 36px.

Keep paragraphs narrow, roughly 65 characters per line. Long lines are tiring, even when the design looks nice.

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">
```

---

## Space

Most "this looks cheap" problems are really spacing problems. So:

- Sections get 96px of padding top and bottom on desktop, 56px on mobile. It will feel like too much. It isn't.
- Content sits in a container about 1100px wide, centered.
- Inside cards, 28px of padding all around.
- When two things belong together, put them close. When they don't, put them far apart. That alone does a lot of the design work.

---

## Buttons, cards, links

Buttons are clay with white text, 12px radius, a little generous on padding (14px by 28px). On hover they lift by 2px and nothing else. Secondary buttons are just an outline in clay.

Cards are sand with no border and a very faint shadow. If a card needs a heavy shadow to stand out, the layout is the problem.

Links are clay, underlined only on hover. Keep a visible focus outline for keyboard users.

```css
.btn {
  background: var(--clay);
  color: #fff;
  padding: 14px 28px;
  border: 0;
  border-radius: 12px;
  font: 500 16px 'Inter', sans-serif;
  cursor: pointer;
  transition: transform .2s ease;
}
.btn:hover { transform: translateY(-2px); }

.card {
  background: var(--sand);
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .05);
}
```

---

## Page layout

**Navigation:** logo on the left, three or four links on the right, one clay button at the end. Collapses to a menu icon on phones.

**Home page, top to bottom:**

1. Hero. One headline, one sentence under it, one button. Resist adding a second button.
2. Three things you do, as three cards.
3. A short "about" with a photo beside it.
4. A couple of real examples of work or testimonials.
5. One last call to action.
6. Footer with links and a copyright line.

Other pages: About, Work (or Services), Contact. A blog only if I'll actually write in it.

---

## Images and icons

- Use photos with a similar mood. Mixing bright stock photos with moody ones is the fastest way to lose the look.
- Line icons only (Lucide is good), around 24px.
- Always write alt text, and compress images to WebP before uploading.

---

## Motion

Keep it small. A soft fade-in as sections scroll into view, a slight lift on hover, nothing that bounces or spins. Around 200ms, ease-out.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## Starter CSS

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; }

body {
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  line-height: 1.65;
  background: var(--paper);
  color: var(--ink);
}

h1, h2, h3 { font-family: 'Playfair Display', serif; line-height: 1.15; }
h1 { font-size: clamp(2.25rem, 5vw, 3.25rem); }
h2 { font-size: 2rem; }

.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
section { padding: 96px 0; }

a { color: var(--clay); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; display: block; }

@media (max-width: 640px) {
  section { padding: 56px 0; }
}
```

---

## Before launching

Open the site on an actual phone, not just a resized browser window. Read the first screen out loud and see if it makes sense. Click every link. Check that images aren't huge. Add a favicon and a page title, which people forget more than anything else.
