---
# ============================================================================
#  WORK / CASE STUDY TEMPLATE
#  Copy this file, rename it to your-project-slug.md, set draft: false, and fill
#  it in. The filename (minus .md) becomes the URL: /work/your-project-slug/.
#  No component edits are ever needed — the page renders entirely from this file.
# ============================================================================

title: "Full Project Title"
lane: Cloud                 # one of: Cloud | Identity | Tooling | Detection | Research
summary: "One sentence, shown on the card and as the case-study lead. Say what you did and the outcome."
date: 2026-01-01            # YYYY-MM-DD
status: completed           # completed | in-progress | ongoing
draft: true                 # <-- set to false to publish

featured: false             # true = large card on the home page + work index
order: 99                   # lower sorts earlier (1, 2, 3 ...)

# --- evidence ---
stack: ["Tool", "Technique", "Language"]   # shown as chips
role: "Independent security research"       # optional, shown in the meta row
timeframe: "Jan 2026"                        # optional

# Links render as buttons in the hero. kind: repo | writeup | external | demo
# NEVER link runnable offensive tooling — link the defense-forward write-up instead.
links:
  - label: "Write-up"
    url: "https://github.com/grosskopfblake-dev/your-repo"
    kind: writeup
    note: "optional caveat, e.g. runnable tool withheld"

# --- the signature kill-chain rail (optional; omit for non-linear work) ---
# Each entry is one node, left→right. Set live: true on the single pivotal step.
killchain:
  - { title: "Step one", mitre: "T1526", detail: "one-line what happened" }
  - { title: "Pivotal step", mitre: "T1190", live: true, detail: "the key move" }
  - { title: "Outcome", mitre: "Impact", detail: "what access this gained" }

# --- findings table (optional) ---
findings:
  - { severity: critical, title: "The core weakness", mitre: "T1552.001", recommendation: "How to fix it." }
  # severity: critical | high | medium | low | info

# --- MITRE ATT&CK block (optional) ---
mitre:
  - { id: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access" }

# One-sentence "what this demonstrates" — renders as a pulled takeaway.
takeaway: "The transferable skill this project proves."

# --- images (optional; slots show generated placeholder art until you add files) ---
# Store real images under /public/img/work/your-project-slug/ and reference them here.
heroImage: ""               # e.g. /img/work/your-project-slug/hero.png
heroAlt: "Describe the hero image for screen readers."
cardImage: ""               # e.g. /img/work/your-project-slug/card.png
cardAlt: "Describe the card image."
---

## Scope

What was in scope, whose infrastructure this was (say clearly it's self-owned / a lab /
authorized), and the framing. Keep it truthful.

## Recon

How you mapped the target and what you found.

## Finding

The core vulnerability or discovery, explained with the *why*.

## Impact

What access or outcome the chain produced.

## Remediation

The concrete fixes — ideally noting which single change breaks the chain.
