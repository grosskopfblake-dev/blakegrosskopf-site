import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* A single MITRE ATT&CK reference. `id` is required (e.g. "T1552.005");
   name + tactic are optional but recommended — they render in the ATT&CK block. */
const mitre = z.object({
  id: z.string(),
  name: z.string().optional(),
  tactic: z.string().optional(),
});

/* One node of the signature kill-chain rail. Order = array order. */
const chainStep = z.object({
  title: z.string(),
  mitre: z.string().optional(),
  detail: z.string().optional(),
  live: z.boolean().default(false), // highlight this node (the pivotal move)
});

/* A finding row for the report findings table. */
const finding = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  title: z.string(),
  mitre: z.string().optional(),
  recommendation: z.string(),
});

const link = z.object({
  label: z.string(),
  url: z.string().url(),
  kind: z.enum(['repo', 'writeup', 'external', 'demo']).default('external'),
  note: z.string().optional(), // e.g. "runnable tool withheld"
});

/* ---------- WORK: case studies / projects ---------- */
const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/[^_]*.md' }),
  schema: z.object({
    title: z.string(),
    // Lane badge — the discipline this belongs to.
    lane: z.enum(['Cloud', 'Identity', 'Tooling', 'Detection', 'Research']),
    summary: z.string(),                 // one-line, shown on cards + case-study intro
    date: z.coerce.date(),
    status: z.enum(['completed', 'in-progress', 'ongoing']).default('completed'),
    // Presentation / ordering
    featured: z.boolean().default(false),
    order: z.number().default(99),       // lower = earlier
    draft: z.boolean().default(false),
    // Evidence
    stack: z.array(z.string()).default([]),
    mitre: z.array(mitre).default([]),
    links: z.array(link).default([]),
    // Report structure (body carries Scope→Recon→Finding→Impact→Remediation as H2s)
    killchain: z.array(chainStep).default([]),
    findings: z.array(finding).default([]),
    takeaway: z.string().optional(),     // "what this demonstrates"
    // Images — fixed-ratio slots; swapping a real screenshot in causes zero layout shift.
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    cardImage: z.string().optional(),
    cardAlt: z.string().optional(),
    // Meta
    role: z.string().optional(),
    timeframe: z.string().optional(),
  }),
});

/* ---------- WRITING: articles / notes ---------- */
const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/[^_]*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    related: z.array(z.string()).default([]), // work slugs to cross-link
  }),
});

export const collections = { work, writing };
