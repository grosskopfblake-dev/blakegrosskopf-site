/* Central site configuration. Edit here to change nav, contact, or certs sitewide. */
export const site = {
  name: 'Blake Grosskopf',
  domain: 'blakegrosskopf.com',
  url: 'https://blakegrosskopf.com',
  role: 'Cloud & Identity Offensive Security Researcher',
  tagline: 'I build and break cloud identity systems — then document both sides.',
  description:
    'Independent offensive-security researcher. Cloud attack paths from public exposure to subscription control, SaaS auth reverse-engineering, and the defenses that stop them.',
  pitch:
    'I build and break cloud identity systems end-to-end — reverse-engineering SaaS auth flows into custom tooling, and chaining real cloud attack paths from public exposure to subscription-level control — then document both the offense and the defense.',
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
    { id: 'AZ-900', name: 'Azure Fundamentals', state: 'held' as const },
    { id: 'SC-900', name: 'Security, Compliance & Identity Fundamentals', state: 'active' as const },
    { id: 'SC-500', name: 'Cloud & AI Security Engineer', state: 'active' as const },
    { id: 'CARTP', name: 'Cloud Attack & Red Team Professional', state: 'target' as const },
  ],
};

export type Cert = (typeof site.certs)[number];
