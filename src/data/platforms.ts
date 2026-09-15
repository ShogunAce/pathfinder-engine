// v0 seed. {KEYWORDS} = URL-encoded keyword string inserted by the model.
export interface Platform {
  name: string;
  category: string;
  urlTemplate: string;
}

export const PLATFORMS: Platform[] = [
  { name: "Zooniverse",      category: "citizen-science", urlTemplate: "https://www.zooniverse.org/projects?search={KEYWORDS}" },
  { name: "SciStarter",      category: "citizen-science", urlTemplate: "https://scistarter.org/finder?q={KEYWORDS}" },
  { name: "iNaturalist",     category: "citizen-science", urlTemplate: "https://www.inaturalist.org/search?q={KEYWORDS}" },
  { name: "Omdena",          category: "hack-for-good",   urlTemplate: "https://www.omdena.com/projects?search={KEYWORDS}" },
  { name: "Devpost",         category: "hack-for-good",   urlTemplate: "https://devpost.com/hackathons?search={KEYWORDS}" },
  { name: "VolunteerMatch",  category: "volunteering",    urlTemplate: "https://www.volunteermatch.org/search/?k={KEYWORDS}" },
  { name: "Idealist",        category: "volunteering",    urlTemplate: "https://www.idealist.org/en/search?q={KEYWORDS}" },
  { name: "Catchafire",      category: "skilled-volunteering", urlTemplate: "https://www.catchafire.org/opportunities/?q={KEYWORDS}" },
  { name: "GitHub Issues",   category: "open-source",     urlTemplate: "https://github.com/search?q={KEYWORDS}+good-first-issue&type=issues" },
  { name: "Up For Grabs",    category: "open-source",     urlTemplate: "https://up-for-grabs.net/#/?tags={KEYWORDS}" }
];

export function buildPlatformSearchUrl(platformName: string, keywords: string): string {
  const match = PLATFORMS.find(p => p.name.toLowerCase() === platformName.toLowerCase());
  const encoded = encodeURIComponent(keywords.trim());
  if (match) {
    return match.urlTemplate.replace("{KEYWORDS}", encoded);
  }
  // Fallback if platform name slightly diverges
  return `https://www.google.com/search?q=${encoded}+volunteer+action`;
}
