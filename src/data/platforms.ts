// Preferred target platform registry for the Pathfinder Engine.
export interface Platform {
  name: string;
  domain: string;
  category: string;
  homeUrl: string;
}

export const PLATFORMS: Platform[] = [
  // Citizen science
  { name: "Zooniverse", domain: "zooniverse.org", category: "citizen-science", homeUrl: "https://www.zooniverse.org" },
  { name: "SciStarter", domain: "scistarter.org", category: "citizen-science", homeUrl: "https://scistarter.org" },
  { name: "iNaturalist", domain: "inaturalist.org", category: "citizen-science", homeUrl: "https://www.inaturalist.org" },
  { name: "eBird", domain: "ebird.org", category: "citizen-science", homeUrl: "https://ebird.org" },
  { name: "CitSci.org", domain: "citsci.org", category: "citizen-science", homeUrl: "https://citsci.org" },
  { name: "Anecdata", domain: "anecdata.io", category: "citizen-science", homeUrl: "https://anecdata.io" },
  { name: "GLOBE Program", domain: "globe.gov", category: "citizen-science", homeUrl: "https://www.globe.gov" },
  { name: "EU-Citizen.Science", domain: "eu-citizen.science", category: "citizen-science", homeUrl: "https://eu-citizen.science" },

  // Hack-for-good / AI-for-good
  { name: "Omdena", domain: "omdena.com", category: "hack-for-good", homeUrl: "https://www.omdena.com" },
  { name: "Devpost", domain: "devpost.com", category: "hack-for-good", homeUrl: "https://devpost.com" },
  { name: "Kaggle", domain: "kaggle.com", category: "hack-for-good", homeUrl: "https://www.kaggle.com" },
  { name: "DrivenData", domain: "drivendata.org", category: "hack-for-good", homeUrl: "https://www.drivendata.org" },
  { name: "Zindi", domain: "zindi.africa", category: "hack-for-good", homeUrl: "https://zindi.africa" },

  // OSINT / investigation (Open-Source Intelligence)
  { name: "Bellingcat", domain: "bellingcat.com", category: "osint", homeUrl: "https://www.bellingcat.com" },
  { name: "Bellingcat Volunteer Community", domain: "bc-community.org", category: "osint", homeUrl: "https://www.bc-community.org" },
  { name: "Atlos", domain: "atlos.org", category: "osint", homeUrl: "https://atlos.org" },
  { name: "Trace Labs", domain: "tracelabs.org", category: "osint", homeUrl: "https://www.tracelabs.org" },
  { name: "Citizen Evidence Lab", domain: "citizenevidence.org", category: "osint", homeUrl: "https://citizenevidence.org" },
  { name: "GIJN", domain: "gijn.org", category: "osint", homeUrl: "https://gijn.org" },

  // Volunteering / skilled volunteering
  { name: "VolunteerMatch", domain: "volunteermatch.org", category: "volunteering", homeUrl: "https://www.volunteermatch.org" },
  { name: "Idealist", domain: "idealist.org", category: "volunteering", homeUrl: "https://www.idealist.org" },
  { name: "Catchafire", domain: "catchafire.org", category: "skilled-volunteering", homeUrl: "https://www.catchafire.org" },
  { name: "All for Good", domain: "allforgood.org", category: "volunteering", homeUrl: "https://www.allforgood.org" },
  { name: "Points of Light", domain: "pointsoflight.org", category: "volunteering", homeUrl: "https://www.pointsoflight.org" },
  { name: "Taproot Plus", domain: "taprootplus.org", category: "skilled-volunteering", homeUrl: "https://taprootplus.org" },
  { name: "Volunteer.gov", domain: "volunteer.gov", category: "volunteering", homeUrl: "https://www.volunteer.gov" },

  // Civic / open data
  { name: "Code.org", domain: "code.org", category: "civic-tech", homeUrl: "https://code.org" },
  { name: "Code for America", domain: "codeforamerica.org", category: "civic-tech", homeUrl: "https://codeforamerica.org" },
  { name: "Data.gov", domain: "data.gov", category: "open-data", homeUrl: "https://data.gov" },

  // Humanitarian / crisis / mapping
  { name: "HOT (Humanitarian OpenStreetMap)", domain: "hotosm.org", category: "humanitarian-mapping", homeUrl: "https://tasks.hotosm.org" },
  { name: "Missing Maps", domain: "missingmaps.org", category: "humanitarian-mapping", homeUrl: "https://www.missingmaps.org" },
  { name: "UN-SPIDER", domain: "un-spider.org", category: "humanitarian-mapping", homeUrl: "https://www.un-spider.org" }
];

/**
 * Builds a Google search query URL ("dork") if Google grounding returned no direct project URL.
 * Never links to a site's internal search results box.
 */
export function buildGoogleSearchFallbackUrl(platformName: string, keywords: string, domain?: string): string {
  const pLower = (platformName || "").toLowerCase();
  const match = PLATFORMS.find(
    p =>
      p.name.toLowerCase() === pLower ||
      p.domain.toLowerCase() === pLower ||
      pLower.includes(p.name.toLowerCase()) ||
      pLower.includes(p.domain.toLowerCase())
  );

  const targetDomain = domain || match?.domain;
  const kw = (keywords || "").trim();

  if (targetDomain) {
    const query = `site:${targetDomain} ${kw}`.trim();
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  const query = `${platformName} ${kw} project`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
