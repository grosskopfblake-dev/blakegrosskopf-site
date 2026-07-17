---
title: "The metadata endpoint depends on the compute type"
description: "An SSRF into an Azure Function returned an empty metadata response — not because the attack failed, but because Functions has no VM IMDS. A short lesson on matching the metadata endpoint to the compute you actually landed on."
date: 2026-07-11
tags: ["azure", "ssrf", "imds", "managed-identity", "cloud"]
related: ["operation-vermillion-drift"]
heroAlt: "Comparison of VM IMDS versus App Service identity endpoints."
---

There's a reflex every cloud tester has: find an SSRF, point it at
`169.254.169.254`, collect the managed-identity token, win. During
[Operation Vermillion Drift](/work/operation-vermillion-drift/) that reflex returned
**nothing** — and the empty response was more instructive than a token would have been.

## Why the metadata call came back empty

The SSRF lived in an **Azure Function**. Azure Functions and App Service run on a PaaS
fabric that **does not expose the VM Instance Metadata Service** at `169.254.169.254`.
On top of that, this particular function had **no managed identity assigned at all**, so
there was nothing to steal even if the endpoint had answered. The empty result was a
*negative confirmation*, not a dead end.

The metadata surface you target has to match the compute you actually landed on:

- **Virtual machines** expose IMDS at `http://169.254.169.254/metadata/...`, and a
  managed-identity token requires the `Metadata: true` header.
- **App Service / Functions** don't use IMDS. When they have a managed identity, the
  runtime injects `IDENTITY_ENDPOINT` and `IDENTITY_HEADER` **environment variables**,
  and you request the token from that local endpoint with that header.

So the fix for a "failed" SSRF is often not a different vulnerability — it's a different
target for the same one.

## The pivot that still worked

Since the environment held the secrets anyway, I re-aimed the same SSRF at
**`file:///proc/self/environ`** and dumped the function's entire environment: the live
signing key, connection strings, and a bonus storage SAS. When credentials live in the
process environment, a `file://` read rivals an IMDS token — and it doesn't care what
compute type you're on.

## The takeaway

`169.254.169.254` coming back empty is a signal, not a verdict. Read it as *"wrong
metadata model for this compute,"* enumerate what the runtime actually exposes, and
remember that local-file reads through the same SSRF are frequently the shorter path to
the same secrets.
