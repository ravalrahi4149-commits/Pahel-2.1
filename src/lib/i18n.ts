import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "gu";

export const translations = {
  en: {
    // Navigation
    overview: "Overview",
    dashboard: "Dashboard",
    buildings: "Buildings",
    newInspection: "New Inspection",
    inspectionHistory: "Inspection History",
    compareInspections: "Compare Inspections",
    growthMonitoring: "Growth Monitoring",
    reports: "Reports & Exports",
    settings: "Settings",
    helpAbout: "Help & Methodology",
    logout: "Log Out",
    login: "Log In",
    register: "Register",

    // Brand
    brandName: "CrackLife AI",
    tagline: "Detect. Monitor. Protect.",
    heroTitle: "See Every Crack. Track Every Change.",
    heroSubtitle:
      "Advanced AI-assisted computer vision for structural crack detection, surface segmentation, and longitudinal building health monitoring.",
    startInspectionCta: "Start New Inspection",
    exploreDemoCta: "Interactive Demo",
    learnMore: "Learn More",

    // Workflow
    workflowTitle: "Engineered for Structural Precision",
    step1Title: "1. Capture & Upload",
    step1Desc: "Upload high-resolution surface photos from smartphones, DSLRs, or automated inspection cameras.",
    step2Title: "2. Detect & Segment",
    step2Desc: "Our hybrid vision engine isolates crack contours, calculates pixel areas, and flags candidate regions.",
    step3Title: "3. Monitor Longitudinal Change",
    step3Desc: "Register recurring scans over time to quantify fissure elongation and generate compliance PDF reports.",

    // Dashboard
    totalBuildings: "Registered Assets",
    totalInspections: "Total Inspections",
    completedInspections: "Verified Inspections",
    reviewNeeded: "Review Required",
    avgCrackArea: "Average Crack Density",
    recentActivity: "Recent Inspection Activity",
    trendTitle: "Crack Area Trend Over Time",
    statusDistribution: "Review Status Breakdown",
    flaggedAssets: "Assets Requiring Qualified Review",

    // Building Management
    addBuilding: "Register New Building",
    buildingName: "Building Name",
    buildingId: "Asset Identifier",
    address: "Location / Address",
    buildingType: "Structure Type",
    floors: "Floors",
    yearBuilt: "Year Constructed",
    monitoringStatus: "Monitoring Status",
    activeStatus: "Active Monitoring",
    reviewNeededStatus: "Follow-up Required",
    actions: "Actions",
    viewDetails: "View Details",

    // Inspection
    surfaceType: "Surface Type",
    location: "Location / Surface Zone",
    inspectorNotes: "Field Observations & Notes",
    calibrationScale: "Scale Calibration (mm/px)",
    detectionMethod: "Detection Method",
    detectedPixelArea: "Detected Crack Area",
    pixelPercentage: "Surface Density",
    candidateRegions: "Candidate Regions",
    processingDuration: "Analysis Duration",
    opacityBlend: "Overlay Blend Opacity",
    sideBySide: "Side-by-Side View",
    splitCurtain: "Curtain Slider",
    maskOnly: "Binary Mask",
    downloadReport: "Download Official PDF",
    downloadOverlay: "Download Annotated Overlay",
    markVerified: "Mark as Verified Baseline",
    flagReview: "Flag for Structural Review",

    // Comparison & Monitoring
    earlierInspection: "Earlier Inspection (Baseline)",
    laterInspection: "Later Inspection (Follow-up)",
    percentagePointDiff: "Percentage-Point Difference",
    relativeChange: "Relative Change",
    alignmentScore: "Registration Quality Score",
    growthTrend: "Longitudinal Surface Area Trajectory",

    // Disclaimer
    disclaimerTitle: "Responsible AI & Civil Engineering Notice",
    disclaimerText:
      "CrackLife AI is an image-processing and surface-documentation assistant. Image-derived measurements do not evaluate subsurface load-bearing capacity, internal reinforcement condition, or definitive structural stability. All structural decisions require assessment by a licensed civil or structural engineer.",

    // General UI
    searchPlaceholder: "Search assets, inspections, or identifiers...",
    save: "Save Changes",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    loading: "Processing analysis...",
    emptyState: "No records found.",
  },
  gu: {
    // Navigation
    overview: "ઝાંખી",
    dashboard: "ડેશબોર્ડ",
    buildings: "ઇમારતો",
    newInspection: "નવું નિરીક્ષણ",
    inspectionHistory: "નિરીક્ષણ ઇતિહાસ",
    compareInspections: "સરખામણી કરો",
    growthMonitoring: "તિરાડ વૃદ્ધિ મોનિટરિંગ",
    reports: "અહેવાલો અને નિકાસ",
    settings: "સેટિંગ્સ",
    helpAbout: "મદદ અને માર્ગદર્શિકા",
    logout: "લૉગ આઉટ",
    login: "લૉગ ઇન",
    register: "નોંધણી કરો",

    // Brand
    brandName: "ક્રેકલાઇફ AI",
    tagline: "શોધો. મોનિટર કરો. સુરક્ષિત કરો.",
    heroTitle: "દરેક તિરાડ જુઓ. દરેક ફેરફાર ટ્રેક કરો.",
    heroSubtitle:
      "માળખાકીય તિરાડ શોધ, સપાટી વિભાજન અને લાંબા ગાળાના બિલ્ડિંગ હેલ્થ મોનિટરિંગ માટે અદ્યતન AI-સહાયિત કમ્પ્યુટર વિઝન પ્લેટફોર્મ.",
    startInspectionCta: "નવું નિરીક્ષણ શરૂ કરો",
    exploreDemoCta: "લાઇવ ડેમો જુઓ",
    learnMore: "વધુ જાણો",

    // Workflow
    workflowTitle: "માળખાકીય ચોકસાઈ માટે બનાવેલ સિસ્ટમ",
    step1Title: "૧. કેપ્ચર અને અપલોડ",
    step1Desc: "સ્માર્ટફોન, કેમેરા અથવા ડ્રોન દ્વારા સપાટીના ફોટા અપલોડ કરો.",
    step2Title: "૨. શોધો અને વિશ્લેષણ કરો",
    step2Desc: "અમારું AI વિઝન એન્જિન તિરાડને ઓળખે છે, પિક્સેલ ક્ષેત્રફળ ગણે છે અને માર્ક કરે છે.",
    step3Title: "૩. ફેરફારોનું મોનિટરિંગ",
    step3Desc: "સમયાંતરે થયેલા ફેરફારોની સરખામણી કરો અને સત્તાવાર PDF રિપોર્ટ ડાઉનલોડ કરો.",

    // Dashboard
    totalBuildings: "કુલ ઇમારતો",
    totalInspections: "કુલ નિરીક્ષણો",
    completedInspections: "ચકાસાયેલ નિરીક્ષણો",
    reviewNeeded: "સમીક્ષા જરૂરી",
    avgCrackArea: "સરેરાશ તિરાડ ઘનતા",
    recentActivity: "તાજેતરની નિરીક્ષણ પ્રવૃત્તિ",
    trendTitle: "સમય સાથે તિરાડ ક્ષેત્રફળનો ટ્રેન્ડ",
    statusDistribution: "સ્થિતિ વિતરણ",
    flaggedAssets: "વિશેષ સમીક્ષા જરૂરી ઇમારતો",

    // Building Management
    addBuilding: "નવી ઇમારત ઉમેરો",
    buildingName: "ઇમારતનું નામ",
    buildingId: "ઓળખ નંબર (ID)",
    address: "સરનામું / સ્થળ",
    buildingType: "બાંધકામનો પ્રકાર",
    floors: "માળની સંખ્યા",
    yearBuilt: "બાંધકામનું વર્ષ",
    monitoringStatus: "મોનિટરિંગ સ્થિતિ",
    activeStatus: "સક્રિય મોનિટરિંગ",
    reviewNeededStatus: "સમીક્ષા જરૂરી",
    actions: "ક્રિયાઓ",
    viewDetails: "વિગતો જુઓ",

    // Inspection
    surfaceType: "સપાટીનો પ્રકાર",
    location: "સ્થળ / રૂમ / સ્તંભ",
    inspectorNotes: "નિરીક્ષકની નોંધ",
    calibrationScale: "સ્કેલ કેલિબ્રેશન (મીમી/પિક્સેલ)",
    detectionMethod: "વિશ્લેષણ પદ્ધતિ",
    detectedPixelArea: "શોધાયેલ તિરાડ ક્ષેત્રફળ",
    pixelPercentage: "સપાટી તિરાડ ટકાવારી",
    candidateRegions: "તિરાડ પ્રદેશો",
    processingDuration: "પ્રોસેસિંગ સમય",
    opacityBlend: "ઓવરલે બ્લેન્ડ પારદર્શકતા",
    sideBySide: "સાથે-સાથે દૃશ્ય",
    splitCurtain: "કર્ટન સ્લાઇડર",
    maskOnly: "માસ્ક દૃશ્ય",
    downloadReport: "સત્તાવાર PDF ડાઉનલોડ કરો",
    downloadOverlay: "માર્ક કરેલ ફોટો ડાઉનલોડ કરો",
    markVerified: "ચકાસાયેલ રેકોર્ડ તરીકે સાચવો",
    flagReview: "એન્જિનિયરિંગ સમીક્ષા માટે ફ્લેગ કરો",

    // Comparison & Monitoring
    earlierInspection: "અગાઉનું નિરીક્ષણ (બેઝલાઇન)",
    laterInspection: "તાજેતરનું નિરીક્ષણ (ફોલો-અપ)",
    percentagePointDiff: "ટકાવારી પોઇન્ટ તફાવત",
    relativeChange: "સાપેક્ષ વૃદ્ધિ ટકાવારી",
    alignmentScore: "ચોકસાઈ સ્કોર",
    growthTrend: "લાંબા ગાળાનો વૃદ્ધિ ટ્રેન્ડ",

    // Disclaimer
    disclaimerTitle: "સિવિલ એન્જિનિયરિંગ અને જવાબદાર AI સૂચના",
    disclaimerText:
      "ક્રેકલાઇફ AI એ સપાટી વિશ્લેષણ અને દસ્તાવેજીકરણ સહાયક છે. ફોટો આધારિત રીડિંગ્સ ઈમારતની સલામતી કે માળખાકીય મજબૂતાઈનું અંતિમ પ્રમાણપત્ર આપતા નથી. કોઈપણ મહત્વપૂર્ણ નિર્ણય માટે લાયસન્સ ધરાવતા સિવિલ એન્જિનિયરની સમીક્ષા અનિવાર્ય છે.",

    // General UI
    searchPlaceholder: "ઇમારતો, ID અથવા નિરીક્ષણો શોધો...",
    save: "સાચવો",
    cancel: "રદ કરો",
    confirm: "ખાતરી કરો",
    delete: "કાઢી નાખો",
    loading: "વિશ્લેષણ પ્રક્રિયા ચાલુ છે...",
    emptyState: "કોઈ રેકોર્ડ મળ્યા નથી.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations.en[key] || String(key),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cracklife_lang");
      if (saved === "en" || saved === "gu") return saved;
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("cracklife_lang", lang);
    }
  };

  const t = (key: keyof typeof translations.en): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useLanguage = () => useContext(LanguageContext);
