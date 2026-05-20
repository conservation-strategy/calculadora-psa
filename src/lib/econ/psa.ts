// Funções para cálculos da Perspectiva PSA

// Import constants from PSAChart
import { 
  QMAX_PSA_TOTAL, 
  QMAX_PSA_PEQUENOS,
  INTERCEPTS_TOTAL,
  INTERCEPTS_PEQUENOS,
  supplyFunctionsPSA_Total,
  supplyFunctionsPSA_Pequenos
} from '@/components/Charts/PSAChart';

// Biome type definition
type Biome = "pampa" | "pantanal" | "cerrado" | "mata_atlantica" | "amazonico" | "caatinga";

// QMAX values for PSA perspective
const QMAX_PSA: Record<Biome, number> = {
  amazonico: 13950979.9,
  caatinga: 1261150.65,
  cerrado: 10025373.1,
  mata_atlantica: 4359888.66,
  pampa: 754346.767,
  pantanal: 90652.6726,
};

// Original intercepts for PSA supply curves
const supplyInterceptsPSA: Record<Biome, number> = {
  amazonico: 3525.904636,
  caatinga: 4022.793722,
  cerrado: 4268.435552,
  mata_atlantica: 5095.743273,
  pampa: 10625.41227,
  pantanal: 6667.859512,
};

// PSA Supply curve functions (independent from CRA perspective)
const supplyFunctionsPSA: Record<Biome, (Q: number, intercept: number) => number> = {
  amazonico: (Q, intercept) => {
    const Qmax = 44710476.05;
    const ratio = Q / Qmax;
    return intercept + (
      39669.20344 * ratio +
      -225589.9933 * ratio ** 2 +
      641568.9998 * ratio ** 3 +
      -796965.6393 * ratio ** 4 +
      357731.1022 * ratio ** 5
    );
  },
  caatinga: (Q, intercept) => {
    const Qmax = 9875320.706;
    const ratio = Q / Qmax;
    return intercept + (
      21352.69876 * ratio +
      -132910.1243 * ratio ** 2 +
      372629.878 * ratio ** 3 +
      -453625.847 * ratio ** 4 +
      200212.8309 * ratio ** 5
    );
  },
  cerrado: (Q, intercept) => {
    const Qmax = 42259636.52;
    const ratio = Q / Qmax;
    return intercept + (
      51981.5291 * ratio +
      -320079.9166 * ratio ** 2 +
      906767.5161 * ratio ** 3 +
      -1089952.478 * ratio ** 4 +
      470192.4242 * ratio ** 5
    );
  },
  mata_atlantica: (Q, intercept) => {
    const Qmax = 12816290.23;
    const ratio = Q / Qmax;
    return intercept + (
      90871.0982 * ratio +
      -514592.9254 * ratio ** 2 +
      1427821.875 * ratio ** 3 +
      -1708362.46 * ratio ** 4 +
      735856.0499 * ratio ** 5
    );
  },
  pampa: (Q, intercept) => {
    const Qmax = 2642331.308;
    const ratio = Q / Qmax;
    return intercept + (
      121343.7148 * ratio +
      -684123.8404 * ratio ** 2 +
      1796239.483 * ratio ** 3 +
      -2086638.624 * ratio ** 4 +
      879704.5281 * ratio ** 5
    );
  },
  pantanal: (Q, intercept) => {
    const Qmax = 756447.216;
    const ratio = Q / Qmax;
    return intercept + (
      102397.9382 * ratio +
      -576866.9949 * ratio ** 2 +
      1511893.419 * ratio ** 3 +
      -1756100.861 * ratio ** 4 +
      740536.3831 * ratio ** 5
    );
  },
};

/**
 * Calcula o equilíbrio PSA para um bioma específico
 */
export function calculatePSAEquilibrium(
  biome: Biome,
  modoPSA: "precoCarbono" | "valorTerra",
  precoCarbono: number,
  valorTerra: number,
  carbonDensity: number,
  custoTransacao: number,
  bufferPSA: number = 15,
  excluirPequenos: boolean = false
): { Qstar: number; Pstar: number } {
  // Escolher Qmax baseado em excluirPequenos
  const Qmax = excluirPequenos ? QMAX_PSA_PEQUENOS[biome] : QMAX_PSA_TOTAL[biome];
  
  // Escolher intercepto baseado em excluirPequenos
  const baseIntercept = excluirPequenos ? INTERCEPTS_PEQUENOS[biome] : INTERCEPTS_TOTAL[biome];
  
  // Escolher função de oferta baseado em excluirPequenos
  const supplyFunction = excluirPequenos ? supplyFunctionsPSA_Pequenos[biome] : supplyFunctionsPSA_Total[biome];
  
  // Calculate demand price based on mode
  const demandPrice = modoPSA === "precoCarbono" 
    ? precoCarbono * carbonDensity  // Modo padrão: preço carbono -> valor terra
    : valorTerra;                   // Modo alternativo: valor terra direto

  const effectiveSupplySurcharge = ((1 + (custoTransacao || 0) / 100) * (1 + (bufferPSA || 0) / 100) - 1) * 100;

  // Bisection method to find equilibrium
  let Qmin = 0;
  let Qmax_search = Qmax;
  const tolerance = 1;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    const Qmid = (Qmin + Qmax_search) / 2;
    const supplyPrice = supplyFunction(Qmid, effectiveSupplySurcharge);
    const diff = supplyPrice - demandPrice;

    if (Math.abs(diff) < tolerance) {
      return { Qstar: Qmid, Pstar: demandPrice };
    }

    if (diff > 0) {
      Qmax_search = Qmid;
    } else {
      Qmin = Qmid;
    }
  }

  return { Qstar: (Qmin + Qmax_search) / 2, Pstar: demandPrice };
}

/**
 * Calcula equilíbrios para todos os biomas
 */
export function calculateAllPSAEquilibria(
  modoPSA: "precoCarbono" | "valorTerra",
  precoCarbono: number,
  valorTerra: number,
  carbonDensities: Record<Biome, number>,
  custoTransacao: number,
  bufferPSA: number = 15,
  excluirPequenos: boolean = false
): Record<Biome, { Qstar: number; Pstar: number }> {
  const biomes: Biome[] = ["amazonico", "caatinga", "cerrado", "mata_atlantica", "pampa", "pantanal"];
  
  const equilibria: Record<string, { Qstar: number; Pstar: number }> = {};
  
  biomes.forEach(biome => {
    equilibria[biome] = calculatePSAEquilibrium(
      biome,
      modoPSA,
      precoCarbono,
      valorTerra,
      carbonDensities[biome],
      custoTransacao,
      bufferPSA,
      excluirPequenos
    );
  });
  
  return equilibria as Record<Biome, { Qstar: number; Pstar: number }>;
}
