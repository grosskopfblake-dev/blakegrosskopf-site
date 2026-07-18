# Editing blakegrosskopf.com

Everything on this site is **content-as-data**: the design lives in components, the
content lives in Markdown files with typed frontmatter. You add a project or a post by
**dropping in one file** — no component edits, ever. This guide is all you need whether
you edit by hand or in another Claude session.

---

## The 30-second version

| I want to… | Do this |
|---|---|
| Add a case study | Copy `src/content/work/_TEMPLATE.md` → `src/content/work/my-slug.md`, set `draft: false`, fill it in. |
| Add a blog post | Copy `src/content/writing/_TEMPLATE.md` → `src/content/writing/my-slug.md`, set `draft: false`, write. |
| Add an image | Drop the file in `public/img/work/my-slug/`, point a frontmatter field at `/img/work/my-slug/file.png`. |
| Change nav / email / socials / certs | Edit `src/lib/site.ts`. |
| Preview locally | `npm run dev` → open http://localhost:4321 |
| Ship it | `npm run build` → deploy `dist/` (see DEPLOY.md). |

The **filename becomes the URL**. `work/operation-vermillion-drift.md` →
`/work/operation-vermillion-drift/`. Use kebab-case, no dates in the name.
Files starting with `_` (like the templates) are ignored.

---

## Adding a case study (project)

1. Copy the template:
   ```bash
   cp src/content/work/_TEMPLATE.md src/content/work/my-project.md
   ```
2. Set `draft: false` and fill the frontmatter. The fields that drive the page:

   | Field | Drives |
   |---|---|
   | `title`, `summary` | Card + case-study hero. `summary` is the one-line lead. |
   | `lane` | The badge. One of `Cloud`, `Identity`, `Tooling`, `Detection`, `Research`. Also picks the placeholder art. |
   | `featured` | `true` = large card on the home page and work index. |
   | `order` | Sort order (lower = earlier). |
   | `stack` | The chips. |
   | `links` | Buttons in the hero. `kind` is `repo` \| `writeup` \| `external` \| `demo`. **Never link runnable offensive tooling — link the defense-forward write-up.** |
   | `killchain` | The signature stepped rail. Each `{ title, mitre, detail, live }`. Set `live: true` on the one pivotal step. Omit the whole field for non-linear work. |
   | `findings` | The findings table. `severity` is `critical`/`high`/`medium`/`low`/`info`. |
   | `mitre` | The ATT&CK block. `{ id, name, tactic }`. |
   | `takeaway` | The pulled "what this demonstrates" quote. |
   | `heroImage`, `cardImage` | Optional. Until set, a generated placeholder fills the exact slot (zero layout shift). |

3. Write the body in Markdown. The report structure is just `##` headings —
   **Scope → Recon → Finding → Impact → Remediation**. Prose renders in the serif
   reading style; `inline code`, **bold**, tables, and fenced code blocks all work.
4. Save. In `npm run dev` it appears immediately.

That's it — the card, the case-study page, the kill-chain rail, the findings table, the
ATT&CK block, and the prev/next nav all generate from that one file.

---

## Adding a blog post

1. `cp src/content/writing/_TEMPLATE.md src/content/writing/my-post.md`
2. Set `draft: false`. Fill `title`, `description` (used on the index + social preview),
   `date`, `tags`. Optionally `related: ["work-slug"]` to cross-link case studies —
   they render as "Related work" cards at the foot of the post.
3. Write. Open the post with the point; use `##` headings; link case studies as
   `[/work/slug/](/work/slug/)`.

---

## Adding images (zero layout shift)

Every image is a **fixed-aspect slot**. The slot reserves its space whether or not an
image exists, so adding one later never shifts the layout.

1. Put the file under `public/img/work/<slug>/` (or `public/img/writing/`).
2. Reference it from frontmatter, e.g. `heroImage: /img/work/my-project/hero.png` and
   always add `heroAlt` / `cardAlt` for screen readers.
3. Recommended sizes (they're cropped to fit):
   - **Card:** ~1200×750 (16/10)
   - **Case-study hero:** ~1600×685 (21/9)
   - **Inline figure:** ~1200×800 (3/2)

No image? You ship fine — the generated SVG placeholder (kill-chain, terminal, or target
motif, picked by lane) is intentionally good enough to launch with.

---

## Site-wide settings

`src/lib/site.ts` is the one place for: name, role, tagline, pitch, **email**, GitHub /
LinkedIn, the **resume path**, the nav list, and the **cert spine** (each cert's
`state` is `held` / `active` / `target`). Change it here and it updates everywhere.

**Resume:** drop your PDF at `public/blake-grosskopf-resume.pdf` (the path in
`site.ts`) and the download links light up.

---

## Publishing checklist

- [ ] `draft: false` on the new file.
- [ ] `npm run build` succeeds (0 errors).
- [ ] Skim it at a narrow width — long titles/tables must not scroll the page sideways.
- [ ] No secrets, no raw tool output, no runnable offensive code. Keep it defense-forward.
- [ ] Deploy (see `DEPLOY.md`).
