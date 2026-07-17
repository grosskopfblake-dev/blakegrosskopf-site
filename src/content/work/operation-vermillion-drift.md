---
title: "Operation Vermillion Drift"
lane: Cloud
summary: "A full Azure cloud kill chain against a self-built AzureGoat range — anonymous public URL to resource-group Contributor, external-attacker lens, no portal access."
date: 2026-07-09
status: completed
featured: true
order: 1
stack: ["Azure", "Terraform", "SSRF", "Managed Identity", "PyJWT", "az rest / ARM"]
role: "Independent security research · self-built range"
timeframe: "Jun–Jul 2026"
takeaway: "I can carry a cloud attack from anonymous public exposure to subscription-level control end-to-end, reason about why each step works at the platform level, and improvise an equivalent path when the intended one is blocked — then translate the whole chain into concrete defenses."
heroAlt: "Attack-path diagram: public blob exposure escalating to Azure resource-group Contributor."
cardAlt: "Operation Vermillion Drift — AzureGoat cloud kill chain."
links:
  - label: "AzureGoat (upstream range)"
    url: "https://github.com/ine-labs/AzureGoat"
    kind: external
    note: "the intentionally-vulnerable lab I deployed and attacked"
killchain:
  - { title: "Public blob recon", mitre: "T1526", detail: "Inferred storage account from the function hostname; anonymously pulled the frontend package." }
  - { title: "App source disclosure", mitre: "T1530", detail: "Leaked backend function source and settings from the downloadable package + public GitHub." }
  - { title: "Hardcoded secrets", mitre: "T1552.001", detail: "JWT signing key, Cosmos key, and storage-account key baked into the deployment package." }
  - { title: "Forged admin JWT", mitre: "HS256", detail: "Signed an admin token with the leaked secret — full API access, no registration." }
  - { title: "SSRF → file://", mitre: "T1190", live: true, detail: "IMDS was empty (no VM metadata on Functions); pivoted to file:///proc/self/environ to dump the environment." }
  - { title: "Storage key + SSH keys", mitre: "T1552.004", detail: "Stolen key enumerated the whole account; a hidden container held VM SSH private keys." }
  - { title: "VM managed identity", mitre: "T1078.004", detail: "On the VM, IMDS yielded the system-assigned managed-identity token." }
  - { title: "RG Contributor", mitre: "Impact", detail: "Replayed the token against ARM — Contributor over the resource group." }
findings:
  - { severity: critical, title: "Hardcoded secrets in a publicly-downloadable deployment package", mitre: "T1552.001", recommendation: "Never ship secrets in build artifacts; use Key Vault references + managed identity, and rotate on exposure." }
  - { severity: critical, title: "SSRF with arbitrary-URL and file:// fetch", mitre: "T1190", recommendation: "Allow-list outbound destinations; strip file/gopher schemes; treat any user-supplied URL as hostile." }
  - { severity: critical, title: "Over-privileged VM managed identity (Contributor)", mitre: "T1078.004", recommendation: "Scope managed identities to least privilege per resource; never grant Contributor for convenience." }
  - { severity: high, title: "Broken JWT authentication (forgeable admin token)", mitre: "T1552", recommendation: "Verify audience/issuer, not just signature+expiry; keep signing keys out of shipped code." }
  - { severity: high, title: "Blob-level public storage container", mitre: "T1530", recommendation: "Disable anonymous access; use private endpoints and short-lived scoped SAS." }
  - { severity: medium, title: "SSH private keys stored in a readable blob", mitre: "T1552.004", recommendation: "Keep private keys out of object storage; rotate any key that touches a blob." }
mitre:
  - { id: "T1526", name: "Cloud Service Discovery", tactic: "Discovery" }
  - { id: "T1530", name: "Data from Cloud Storage", tactic: "Collection" }
  - { id: "T1552.001", name: "Unsecured Credentials: Credentials In Files", tactic: "Credential Access" }
  - { id: "T1190", name: "Exploit Public-Facing Application (SSRF)", tactic: "Initial Access" }
  - { id: "T1552.004", name: "Unsecured Credentials: Private Keys", tactic: "Credential Access" }
  - { id: "T1078.004", name: "Valid Accounts: Cloud Accounts", tactic: "Persistence / Priv. Esc." }
  - { id: "T1552.005", name: "Cloud Instance Metadata API", tactic: "Credential Access" }
---

## Scope

Operation Vermillion Drift was run against **AzureGoat**, an intentionally-vulnerable
Azure range, which I **provisioned myself in Terraform** on my own Azure subscription
and then attacked purely from the outside — no portal, no credentials, no insider
knowledge beyond what a real external attacker could gather. The fictional target,
*Vermillion Dynamics*, is a 60-person SaaS startup that lifted an employee-records app
into Azure with no security review: a public blob "for backups," a managed identity
scoped wide "to make auth easy," an automation account with broad rights "so deploys
don't break." Those are not exotic bugs — they are the ordinary shortcuts real cloud
teams take under deadline.

Everything below happened on infrastructure I own. The goal was a complete,
repeatable cloud-pentest kill chain across the attack paths that actually matter in
the wild: **public web foothold → managed-identity token theft → storage and secret
looting → subscription-level control.**

## Recon — from a hostname to the source code

The only starting point was a public application URL. Fingerprinting the page
identified it as an INE AzureGoat deployment, and the function-app hostname gave up the
naming convention for the storage account. One container was **Blob-level public** — I
couldn't list it, but I could anonymously download the frontend package. Its
`index.html` named a second container hosting the React bundle, and the bundle named
the backend API host. Public exposure, walked one hop at a time, handed me the app's
whole topology before I'd sent a single authenticated request.

The backend was a Python Azure Function. Between the downloadable deployment package
and the project's public GitHub template, I could read the function's source and its
settings file — which is where the real problem lived.

## Finding — secrets in the package, then SSRF for the rest

The shipped package contained **hardcoded secrets**: the JWT signing key, a Cosmos DB
primary key, and a storage-account key. The application signs its sessions with
**HS256 using that leaked key**, and its auth check validates only the signature and
expiry. With the key in hand I forged an **admin JWT** with PyJWT and reached every
protected route — no registration, no password, no MFA in the path.

The app also exposed a "save content" endpoint that fetched an arbitrary URL
server-side and stored the response — a textbook **SSRF** with a built-in exfil
channel. The instinctive move, hitting the instance metadata endpoint at
`169.254.169.254`, returned nothing: **Azure Functions has no VM metadata service**,
and this function had no managed identity at all. That negative result is the lesson —
*the metadata endpoint you target has to match the compute type.* Instead I pointed the
SSRF at **`file:///proc/self/environ`** and dumped the function's entire environment,
confirming the live secrets and leaking a read/write storage SAS as a bonus.

The stolen storage-account key then unlocked the **whole** account — containers that
Blob-level public access had kept hidden. One of them held **SSH private keys** for the
range's virtual machines, alongside a config file salted with decoys: RFC1918 addresses
and a live-but-unrelated public IP designed to waste an attacker's time. The public
GitHub template disambiguated which host was real, and the matching private key logged
me straight in.

## Impact — resource-group Contributor

On the virtual machine, the metadata service behaved as expected for a VM: with the
`Metadata: true` header it returned the **system-assigned managed-identity token**.
Replayed against Azure Resource Manager, that token enumerated the resource group and —
per its role assignments — carried **Contributor**. From an anonymous public URL, the
chain now had write control over every resource in the group.

The intended escalation route in this range runs through an automation account, but the
subscription's platform restrictions meant that component couldn't be deployed at all.
Rather than stop, I reconstructed an **equivalent Contributor foothold** through the
leaked SSH keys and the over-privileged VM identity. That is the point worth sitting
with: **attackers route around missing pieces.** A control that only blocks the
"textbook" path, while leaving an equivalent one open, buys nothing.

## Remediation — where the chain breaks

Each link has a cheap, boring fix, and any *one* of them breaks the chain:

- **Get secrets out of build artifacts.** Key Vault references plus a managed identity,
  and rotation the moment a key touches a package. This single change removes the forged
  JWT, the storage compromise, and the SSH pivot at the root.
- **Treat every user-supplied URL as hostile.** Allow-list outbound destinations and
  strip `file://` / `gopher://` schemes — SSRF stops being a credential-exfil primitive.
- **Scope managed identities to least privilege.** A VM identity almost never needs
  Contributor over its resource group; scope it to the specific resources it uses.
- **Close public storage and keep private keys out of blobs.** Disable anonymous
  container access, prefer private endpoints and short-lived SAS, and never store SSH
  keys as objects.
- **Verify tokens properly.** Check audience and issuer, not just signature and expiry.

## Building and running it — the honest part

The range fought back before the target did. The subscription enforced a
Microsoft-locked region policy that couldn't be edited or exempted, a zero
Consumption-plan quota, and CPU-architecture conflicts across five candidate regions; a
serverless database creation was flaky enough to orphan billing resources. I worked the
Azure Resource Manager REST API directly (`az rest`) to route around CLI wrapper crashes,
and captured the whole blocker chain in a runbook that cut rebuild time from a
multi-hour investigation to a ~25-minute apply. Provisioning the lab was itself a real
exercise in reliable cloud tooling under constraint — the kind of friction that shows up
in every genuine engagement.
