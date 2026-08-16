/** Single Person author for E-E-A-T (Notes, About, JSON-LD).
 *  Neutral by design — personal name omitted so the brand stays transferable.
 */
export const AUTHOR = {
  name: 'Independent developer',
  role: 'Independent developer',
  bio: 'Builds free, client-side Amazon calculators so sellers and buyers can run the numbers before they commit money — without accounts or uploaded inputs.',
  url: 'https://herminox.com/about/',
  sameAs: [],
};

export function personLd() {
  const person = {
    '@type': 'Person',
    name: AUTHOR.name,
    jobTitle: AUTHOR.role,
    description: AUTHOR.bio,
    url: AUTHOR.url,
    worksFor: {
      '@type': 'Organization',
      name: 'Herminox',
      url: 'https://herminox.com/',
    },
  };
  if (AUTHOR.sameAs.length) person.sameAs = AUTHOR.sameAs;
  return person;
}
