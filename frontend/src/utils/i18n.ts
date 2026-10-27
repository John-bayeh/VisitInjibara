// ──────────────────────────────────────────────────────────
// frontend/src/utils/i18n.ts
//
// Natural, grammatically authentic Amharic (አማርኛ) and English dictionary.
// Structured per Requirement 7: String externalization allowing full
// Amharic localization without modifying component logic.
// ──────────────────────────────────────────────────────────

export type Language = 'en' | 'am';

export interface TranslationDictionary {
  siteTitle: string;
  siteSubtitle: string;
  online: string;
  offline: string;
  toggleLangLabel: string;

  // View Switcher (Requirement 4)
  views: {
    map: string;
    graph: string;
    list: string;
  };

  // Categories
  categories: {
    nature: string;
    community: string;
    culture: string;
    viewpoint: string;
    ecology: string;
    heritage: string;
  };

  // Relational Graph
  graph: {
    title: string;
    instruction: string;
    hubLabel: string;
    hubSub: string;
  };

  // Destination List
  list: {
    title: string;
    subtitle: string;
    sitesCount: string;
    guideAvailable: string;
    selfGuided: string;
    exploreBtn: string;
  };

  // Detail Drawer / Bottom Sheet
  detail: {
    elevationSuffix: string;
    roadAndSeasonTitle: string;
    guideTitle: string;
    verifiedOn: string;
    unverified: string;
    callBtn: string;
    whatsappBtn: string;
    telegramBtn: string;
    noGuideMsg: string;
    closeLabel: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    siteTitle: 'VISIT INJIBARA',
    siteSubtitle: 'Awi Zone • አዊ ዞን',
    online: 'Online',
    offline: 'Offline Mode',
    toggleLangLabel: 'EN / አማ',

    views: {
      map: 'Map View',
      graph: 'Relational Graph',
      list: 'Destinations',
    },

    categories: {
      nature: 'Nature',
      community: 'Community',
      culture: 'Culture',
      viewpoint: 'Viewpoint',
      ecology: 'Ecology',
      heritage: 'Heritage',
    },

    graph: {
      title: 'Interactive Destination Network',
      instruction: 'Tap any circle to view photo & details',
      hubLabel: 'AWI',
      hubSub: 'ZONE',
    },

    list: {
      title: 'Discover Awi & Injibara',
      subtitle: 'Explore natural wonders, cultural centers & mountain viewpoints',
      sitesCount: 'Sites',
      guideAvailable: 'Verified Guide',
      selfGuided: 'Self-guided',
      exploreBtn: 'View Guide & Advice →',
    },

    detail: {
      elevationSuffix: 'elevation',
      roadAndSeasonTitle: 'Getting There & Seasonal Advice',
      guideTitle: 'Connect with Verified Youth Guide',
      verifiedOn: 'Verified',
      unverified: 'Unverified',
      callBtn: 'Call',
      whatsappBtn: 'WhatsApp',
      telegramBtn: 'Telegram',
      noGuideMsg: 'No verified youth guide is currently registered for this site.',
      closeLabel: 'Close details',
    },
  },

  am: {
    siteTitle: 'ኢንጂባራን ይጎብኙ',
    siteSubtitle: 'አዊ ዞን • ጎጃም፣ ኢትዮጵያ',
    online: 'መስመር ላይ',
    offline: 'ከመስመር ውጭ (ኦፍላይን)',
    toggleLangLabel: 'አማ / EN',

    views: {
      map: 'ካርታ',
      graph: 'የቦታዎች ትስስር',
      list: 'የመዳረሻዎች ዝርዝር',
    },

    categories: {
      nature: 'የተፈጥሮ መስህብ',
      community: 'ከተማና ማህበረሰብ',
      culture: 'ባህልና ቅርስ',
      viewpoint: 'የተራራ እይታ',
      ecology: 'ደንና ሥነ-ምህዳር',
      heritage: 'ታሪካዊ ቅርስ',
    },

    graph: {
      title: 'የቱሪዝም መዳረሻዎች መስተጋብራዊ ትስስር',
      instruction: 'ዝርዝሩንና ፎቶውን ለማየት የቦታውን ክብ ይጫኑ',
      hubLabel: 'አዊ',
      hubSub: 'ዞን',
    },

    list: {
      title: 'የኢንጂባራና የአዊ ዞን ውብ መዳረሻዎች',
      subtitle: 'ድንቅ የተፈጥሮ ሃይቆችን፣ ፏፏቴዎችንና ባህላዊ ቅርሶችን ይጎብኙ',
      sitesCount: 'መዳረሻዎች',
      guideAvailable: 'አስጎብኚ አለው',
      selfGuided: 'የግል ጉብኝት',
      exploreBtn: 'ሙሉ መረጃና አስጎብኚ →',
    },

    detail: {
      elevationSuffix: 'ከባህር ጠለል በላይ',
      roadAndSeasonTitle: 'የመንገድ ሁኔታና ወቅታዊ መመሪያ',
      guideTitle: 'ከተረጋገጠ የአካባቢው ወጣት አስጎብኚ ጋር ይገናኙ',
      verifiedOn: 'የተረጋገጠበት ቀን',
      unverified: 'ያልተረጋገጠ',
      callBtn: 'በስልክ ይደውሉ',
      whatsappBtn: 'ዋትስአፕ (WhatsApp)',
      telegramBtn: 'ቴሌግራም (Telegram)',
      noGuideMsg: 'ለዚህ ቦታ የተመደበ የሰለጠነ ወጣት አስጎብኚ በጊዜው አልተገኘም።',
      closeLabel: 'ዝጋ',
    },
  },
};
