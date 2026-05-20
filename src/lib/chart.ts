import { Biome, BIOME_DATA, calculateDemandPriceBiome, calculateSupplyPriceBiome, SUPPLY_INTERCEPTS } from "@/data/biome-data";

export const INTERCEPTS_PEQUENOS: Record<Biome, number> = {
    amazonico: 6156.3,
    caatinga: 5181.5,
    cerrado: 7605.2,
    mata_atlantica: 10257.0,
    pampa: 18215.0,
    pantanal: 8088.8,
  };
  

// Helper function to get supply function with optional reduction and transaction cost  
function getSupplyFunction(biome: Biome, custoTransacao: number = 0, excluirPequenos: boolean = false): (Q: number) => number {
  const biomeData = BIOME_DATA[biome];
  
  // Quando excluirPequenos é true, usar os interceptos da perspectiva PSA
  const baseIntercept = excluirPequenos ? INTERCEPTS_PEQUENOS[biome] : SUPPLY_INTERCEPTS[biome];
  const transactionMultiplier = 1 + custoTransacao / 100;
  
  return (Q: number) => {
    // Calculate base supply price using biome data
    const basePrice = calculateSupplyPriceBiome(Q, biomeData);
    // Adjust intercept for transaction cost and PSA scenario
    const interceptAdjustment = (baseIntercept - biomeData.supplyIntercept) * transactionMultiplier;
    return basePrice - biomeData.supplyIntercept + baseIntercept * transactionMultiplier;
  };
}

// Helper function to get demand function
function getDemandFunction(biome: Biome, demandShift: number = 0): (Q: number) => number {
  const biomeData = BIOME_DATA[biome];
  return (Q: number) => calculateDemandPriceBiome(Q, biomeData) + demandShift;
}

function bisection(
  f: (x: number) => number,
  a: number,
  b: number,
  tol: number = 1e-6,
  maxIter: number = 100
): number | null {
  let fa = f(a);
  let fb = f(b);

  if (fa * fb > 0) return null; // No sign change

  for (let i = 0; i < maxIter; i++) {
    const c = (a + b) / 2;
    const fc = f(c);

    if (Math.abs(fc) < tol || Math.abs(b - a) < tol) {
      return c;
    }

    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }

  return (a + b) / 2;
}

// Find equilibrium point between supply and demand
export function findEquilibrium(
    biome: Biome,
    Qmax: number,
    custoTransacao: number = 0,
    excluirPequenos: boolean = false,
    demandShift: number = 0
  ): { Qstar: number; Pstar: number } | null {
    const supply = getSupplyFunction(biome, custoTransacao, excluirPequenos);
    const demand = getDemandFunction(biome, demandShift);
    const diff = (Q: number) => supply(Q) - demand(Q);
  
    // Sample the function to find brackets
    const samples = 500;
    const step = Qmax / samples;
    const brackets: Array<[number, number]> = [];
  
    for (let i = 0; i < samples; i++) {
      const Q1 = i * step;
      const Q2 = (i + 1) * step;
      const d1 = diff(Q1);
      const d2 = diff(Q2);
  
      if (!isFinite(d1) || !isFinite(d2)) continue;
  
      if (d1 * d2 < 0) {
        brackets.push([Q1, Q2]);
      }
    }
  
    // Helper: when no crossing, check which side dominates
    const noIntersectionResult = () => {
      // If supply is consistently below demand, the market clears at Qmax
      // and price is determined by the supply side (marginal cost of last supplier).
      const midDiff = diff(Qmax / 2);
      if (midDiff < 0) {
        // Oferta potencial supera demanda em todos os pontos: preço pelo lado da oferta
        return {
          Qstar: Math.round(Qmax * 100) / 100,
          Pstar: Math.round(supply(Qmax) * 100) / 100,
        };
      }
      // Supply always above demand: use demand price at Qmax (existing behaviour)
      return {
        Qstar: Math.round(Qmax * 100) / 100,
        Pstar: Math.round(demand(Qmax) * 100) / 100,
      };
    };
  
    if (brackets.length === 0) return noIntersectionResult();
  
    // Find all roots
    const roots: number[] = [];
    for (const [a, b] of brackets) {
      const root = bisection(diff, a, b);
      if (root !== null && root >= 0 && root <= Qmax) {
        roots.push(root);
      }
    }
  
    if (roots.length === 0) return noIntersectionResult();
  
    // Pick the lowest positive Q (most economically relevant)
    const Qstar = Math.min(...roots.filter((r) => r > 0));
    const Pstar = supply(Qstar);
  
    return {
      Qstar: Math.round(Qstar * 100) / 100,
      Pstar: Math.round(Pstar * 100) / 100,
    };
}
  