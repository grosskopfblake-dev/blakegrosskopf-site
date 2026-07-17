---
title: "Your Okta tenant is sprayable by default — and MFA won't fix it"
description: "The Identity Engine sign-in surface validates passwords from the open internet by design. Here's what actually gates external spraying — and why turning on MFA isn't it."
date: 2026-07-04
tags: ["okta", "identity", "password-spray", "mfa", "detection"]
related: ["okta-oie-credential-oracle"]
heroAlt: "Okta sign-in gating: pre-password controls versus MFA."
---

The most common reaction to Okta password-spraying is "we have MFA, so we're fine."
Building the [OIE credential-validation oracle](/work/okta-oie-credential-oracle/) made
it clear why that's the wrong control at the wrong stage.

## MFA is a *post*-password hurdle

The Identity Engine sign-in flow validates the **password** before MFA ever enters the
picture. An external oracle that returns a clean valid/invalid verdict per credential
pair has already gotten what it wants — a confirmed password — regardless of whether MFA
would later block the session. MFA raises the *impact ceiling*; it does nothing to stop
credential **validation**. That distinction is the whole game.

## What actually gates it: pre-password controls

Only controls that reject the request **before** the password is checked make the oracle
unreachable from an untrusted egress:

1. **Network Zones / Dynamic Zones** — restrict authentication to expected geographies
   and IP ranges; block anonymizers, Tor, and known-bad ASNs. This is the single most
   effective control against external spray.
2. **ThreatInsight in "Log and block"** — log-only mode observes the attack without
   stopping it. Block mode is the one that matters.
3. **Universal phishing-resistant MFA (FIDO2/WebAuthn)** — not to stop validation, but to
   make a confirmed password worthless for the next step.
4. **System Log detection** — alert on many *distinct* usernames failing from one IP or
   ASN in a short window, and on `security.threat.detected`. Low-and-slow spraying stays
   under lockout thresholds, so velocity and behavioral rules have to cover the gap.

## Don't trust a passing Classic-authn test

Almost every public Okta spraying tool targets the **legacy Classic** endpoint, not the
OIE `/idp/idx` flow. A tenant can pass one of those tools and still be wide open to the
Identity Engine surface. If you're validating your own tenant, test the surface your
users actually sign in through.

## Bottom line

This isn't an Okta zero-day — the sign-in page is internet-facing by design. It's a
**defense-in-depth** question, and the answer is set at the network/zone layer and by
your MFA and password hygiene, not by assuming MFA covers a stage it never touches.
