export type Biome = "pampa" | "pantanal" | "cerrado" | "mata_atlantica" | "amazonico" | "caatinga";

// Fixed Qmax values by biome (in hectares)
export const QMAX_BY_BIOME: Record<Biome, number> = {
    amazonico: 6262407.71,
    caatinga: 733098.85,
    cerrado: 5260134.56,
    mata_atlantica: 1720488.60,
    pampa: 146695.11,
    pantanal: 327266.62,
} as const;

// Model type for supply and demand curves
type CurveModel = 'polynomial' | 'power';

// BiomeData interface with polynomial coefficients
export interface BiomeData {
  biome: Biome;
  biomeName: string;
  qMax: number;
  appArea: number;
  
  // Supply curve data
  supplyModel: CurveModel;
  supplyIntercept: number; // c0 (base intercept)
  supplyCoefficients: {
    c1?: number; // linear coefficient
    c2?: number; // quadratic
    c3?: number; // cubic
    c4?: number; // quartic
    c5?: number; // quintic
  };
  
  // Demand curve data
  demandModel: CurveModel;
  demandCoefficients: {
    c0: number;  // intercept or A (for power model)
    c1?: number; // linear or B (for power model)
    c2?: number; // quadratic
    c3?: number; // cubic
    c4?: number; // quartic
    c5?: number; // quintic
  };
}

// Complete biome data with all coefficients
export const BIOME_DATA: Record<Biome, BiomeData> = {
  amazonico: {
    biome: "amazonico",
    biomeName: "Amazônia",
    qMax: 6262407.71,
    appArea: 647266.38390,
    supplyModel: "polynomial",
    supplyIntercept: 5719.8,
    supplyCoefficients: {
      c1: 0.0012974,
      c2: -0.00000000015743,
      c3: 0.0000000000000000092975,
      c4: -0.00000000000000000000000023565,
      c5: 0.0000000000000000000000000000000021526,
    },
    demandModel: "polynomial",
    demandCoefficients: {
      c0: 15861.788988445974609930999577045440673828125,
      c1: -0.00633226846786090046687034416095229971688240766525,
      c2: 0.00000000178216096923355218231667455560177093509822,
      c3: -0.00000000000000016913930787048024076599156951710221,
    },
  },
  caatinga: {
    biome: "caatinga",
    biomeName: "Caatinga",
    qMax: 733098.85,
    appArea: 289354.18030,
    supplyModel: "polynomial",
    supplyIntercept: 5021.7,
    supplyCoefficients: {
      c1: 0.0017146,
      c2: -0.0000000010016,
      c3: 0.00000000000000034036,
      c4: -0.000000000000000000000047717,
      c5: 0.0000000000000000000000000000023555,
    },
    demandModel: "polynomial",
    demandCoefficients: {
      c0: 13495.769580934473196975886821746826171875,
      c1: -0.09122797795303395906874044385403976775705814361572,
      c2: 0.00000052397642549083633562058545315998081548514165,
      c3: -0.000000000001457118080185652264629704268518259081,
      c4: 0.00000000000000000187782371861831710273392990138306,
      c5: -0.00000000000000000000000090663836545361725944447038,
    },
  },
  cerrado: {
    biome: "cerrado",
    biomeName: "Cerrado",
    qMax: 5260134.56,
    appArea: 930422.84930,
    supplyModel: "polynomial",
    supplyIntercept: 7239.7,
    supplyCoefficients: {
      c1: 0.0016199,
      c2: -0.000000000073551,
      c3: 0.0000000000000000012118,
    },
    demandModel: "polynomial",
    demandCoefficients: {
      c0: 24679.37161734266192070208489894866943359375,
      c1: -0.01933876097841707303315317290071106981486082077026,
      c2: 0.00000001557285426400962111960007093740959716043903,
      c3: -0.00000000000000604440056729502283682895240322314115,
      c4: 0.00000000000000000000106158461952868035381799941466,
      c5: -0.00000000000000000000000000006976251063948414238292,
    },
  },
  mata_atlantica: {
    biome: "mata_atlantica",
    biomeName: "Mata Atlântica",
    qMax: 1720488.60,
    appArea: 1156122.669237,
    supplyModel: "polynomial",
    supplyIntercept: 9037.9,
    supplyCoefficients: {
      c1: 0.0071054,
      c2: -0.0000000019502,
      c3: 0.00000000000000033793,
      c4: -0.000000000000000000000029149,
      c5: 0.00000000000000000000000000000097340,
    },
    demandModel: "power",
    demandCoefficients: {
      c0: 438470.471040480420924723148345947265625, // A
      c1: -0.25128317218908019503587070175854023545980453491211, // B
    },
  },
  pampa: {
    biome: "pampa",
    biomeName: "Pampa",
    qMax: 146695.11,
    appArea: 115661.70690,
    supplyModel: "polynomial",
    supplyIntercept: 17037.0,
    supplyCoefficients: {
      c1: 0.043559,
      c2: -0.000000099894,
      c3: 0.00000000000010983,
      c4: -0.000000000000000000052457,
      c5: 0.0000000000000000000000000089922,
    },
    demandModel: "polynomial",
    demandCoefficients: {
      c0: 34071.671620408465969376266002655029296875,
      c1: -0.45527258707075163313149346322461497038602828979492,
      c2: 0.00000579415778903797124048868569246018012108834228,
      c3: -0.00000000002469781234654059325012046175976148558798,
    },
  },
  pantanal: {
    biome: "pantanal",
    biomeName: "Pantanal",
    qMax: 327266.62,
    appArea: 50992.12535,
    supplyModel: "polynomial",
    supplyIntercept: 8015.0,
    supplyCoefficients: {
      c1: 0.0079699,
      c2: -0.0000000065522,
      c3: 0.0000000000000027542,
      c4: -0.00000000000000000000055352,
      c5: 0.000000000000000000000000000043066,
    },
    demandModel: "power",
    demandCoefficients: {
      c0: 31653.9372341857015271671116352081298828125, // A
      c1: -0.10076870692256353900795318168093217536807060241699, // B
    },
  },
};

// Supply curve intercepts (base prices without transaction costs)
export const SUPPLY_INTERCEPTS: Record<Biome, number> = {
  amazonico: 5719.8,
  caatinga: 5021.7,
  cerrado: 7239.7,
  mata_atlantica: 9037.9,
  pampa: 17037.0,
  pantanal: 8015.0,
} as const;



/**
 * Calculate supply price for a given quantity using polynomial expansion
 * Formula: P(Q) = intercept + c1*Q + c2*Q^2 + c3*Q^3 + c4*Q^4 + c5*Q^5
 */
export function calculateSupplyPriceBiome(Q: number, data: BiomeData): number {
  const { supplyIntercept, supplyCoefficients } = data;
  const { c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0 } = supplyCoefficients;
  
  return (
    supplyIntercept +
    c1 * Q +
    c2 * Math.pow(Q, 2) +
    c3 * Math.pow(Q, 3) +
    c4 * Math.pow(Q, 4) +
    c5 * Math.pow(Q, 5)
  );
}

/**
 * Calculate demand price for a given quantity
 * Supports polynomial and power (log-log) models
 */
export function calculateDemandPriceBiome(Q: number, data: BiomeData): number {
  const { demandModel, demandCoefficients } = data;
  
  if (demandModel === 'power') {
    // Power model: P = A * Q^B
    const A = demandCoefficients.c0;
    const B = demandCoefficients.c1 || 0;
    const qSafe = Math.max(Q, 0.1); // Avoid log(0)
    return A * Math.pow(qSafe, B);
  } else {
    // Polynomial model: P = c0 + c1*Q + c2*Q^2 + c3*Q^3 + c4*Q^4 + c5*Q^5
    const { c0, c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0 } = demandCoefficients;
    return (
      c0 +
      c1 * Q +
      c2 * Math.pow(Q, 2) +
      c3 * Math.pow(Q, 3) +
      c4 * Math.pow(Q, 4) +
      c5 * Math.pow(Q, 5)
    );
  }
}
