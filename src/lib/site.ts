/* Central site configuration. Edit here to change nav, contact, or certs sitewide. */
export const site = {
  name: 'Blake Grosskopf',
  domain: 'blakegrosskopf.com',
  url: 'https://blakegrosskopf.com',
  role: 'Offensive Security Researcher',
  tagline: 'I build cloud and enterprise labs, then break them end-to-end — and write the defense that stops me.',
  description:
    'Aspiring red teamer, currently shadowing a red team. I build cloud and enterprise labs from scratch, break them end-to-end, and write the detections and defenses that stop the attack.',
  pitch:
    'An aspiring red teamer, shadowing a red team while running my own labs. I stand up cloud and enterprise environments from scratch, attack them from an external position all the way to full control, then write the defense that would have stopped me.',
  email: 'grosskopfblake@gmail.com',
  socials: {
    github: 'https://github.com/grosskopfblake-dev',
    githubHandle: 'grosskopfblake-dev',
    linkedin: 'https://www.linkedin.com/in/blakegrosskopf/',
    linkedinHandle: 'in/blakegrosskopf',
  },
  // Resume PDF — drop the file at public/blake-grosskopf-resume.pdf to enable the download.
  resume: '/blake-grosskopf-resume.pdf',
  nav: [
    { label: 'Work', href: '/work/' },
    { label: 'Writing', href: '/writing/' },
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
  ],
  // Cert spine — held → active → target.
  certs: [
    { id: 'SC-900', name: 'Security, Compliance & Identity Fundamentals', state: 'held' as const },
    { id: 'PNPT', name: 'Practical Network Penetration Tester', state: 'active' as const },
    { id: 'SC-500', name: 'Cloud & AI Security Engineer', state: 'target' as const },
    { id: 'CARTP', name: 'Cloud Attack & Red Team Professional', state: 'target' as const },
  ],
};

export type Cert = (typeof site.certs)[number];
