// DOC: Calculadora de métricas econômicas fundamentais (VPL, TIR, B/C)
// Responsável por: cálculos precisos de viabilidade econômica, análise de investimentos
// Algoritmos: Newton-Raphson para TIR, VPL com fluxos irregulares, índices de rentabilidade

import { CashFlow, EconomicMetrics } from "./types";

/**
 * DOC: Calcula o pagamento periódico (PMT) de uma anuidade
 * Fórmula: PMT = PV * r / (1 - (1 + r)^(-n))
 * Usado para converter um valor presente em pagamentos anuais iguais
 *
 * @param presentValue Valor presente (PV) a ser anualizado
 * @param rate Taxa de desconto por período (decimal, ex: 0.10 para 10%)
 * @param periods Número de períodos (ex: 30 anos)
 * @returns Pagamento periódico (PMT)
 */
export function calculatePMT(
  presentValue: number,
  rate: number,
  periods: number
): number {
  if (rate <= 0 || periods <= 0 || presentValue <= 0) {
    return 0;
  }

  // PMT = PV * r / (1 - (1 + r)^(-n))
  const numerator = presentValue * rate;
  const denominator = 1 - Math.pow(1 + rate, -periods);

  return numerator / denominator;
}

/**
 * DOC: Calcula o Valor Presente Líquido (VPL/NPV)
 * Fórmula: VPL = ∑(FCt / (1 + r)^t) - Investimento_inicial
 *
 * @param cashFlows Array de fluxos de caixa anuais
 * @param discountRate Taxa de desconto (decimal, ex: 0.08 para 8%)
 * @param initialInvestment Investimento inicial (opcional, pode estar incluído nos fluxos)
 * @returns VPL em valores monetários
 */
export function calculateNPV(
  cashFlows: number[],
  discountRate: number,
  initialInvestment: number = 0
): number {
  if (discountRate < 0) {
    throw new Error("Taxa de desconto deve ser positiva");
  }

  const presentValueSum = cashFlows.reduce((acc, cashFlow, year) => {
    const discountFactor = Math.pow(1 + discountRate, year + 1);
    return acc + cashFlow / discountFactor;
  }, 0);

  return presentValueSum - initialInvestment;
}

/**
 * DOC: Calcula a Taxa Interna de Retorno (TIR/IRR) usando método Newton-Raphson
 * Encontra a taxa que torna VPL = 0
 *
 * @param cashFlows Array incluindo investimento inicial (negativo) no índice 0
 * @param initialGuess Estimativa inicial para TIR (padrão: 0.1)
 * @param tolerance Tolerância para convergência (padrão: 0.0001)
 * @param maxIterations Máximo de iterações (padrão: 100)
 * @returns TIR como decimal ou null se não convergir
 */
export function calculateIRR(
  cashFlows: number[],
  initialGuess: number = 0.1,
  tolerance: number = 0.0001,
  maxIterations: number = 100
): number | null {
  if (cashFlows.length < 2) {
    return null;
  }

  let rate = initialGuess;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Calcula VPL e sua derivada na taxa atual
    let npv = 0;
    let dnpv = 0; // Derivada do VPL em relação à taxa

    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discountFactor;

      if (t > 0) {
        dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }

    // Verifica convergência
    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    // Atualiza taxa usando Newton-Raphson: rate_new = rate - f(rate) / f'(rate)
    if (Math.abs(dnpv) < 1e-10) {
      // Evita divisão por zero
      return null;
    }

    rate = rate - npv / dnpv;

    // Evita taxas negativas muito extremas
    if (rate < -0.99) {
      rate = -0.99;
    }
  }

  return null; // Não convergiu
}

/**
 * DOC: Calcula a relação Benefício/Custo (B/C)
 * B/C = VP(Benefícios) / VP(Custos)
 *
 * @param benefits Array de benefícios anuais
 * @param costs Array de custos anuais
 * @param discountRate Taxa de desconto
 * @returns Relação B/C (>1 indica viabilidade)
 */
export function calculateBenefitCostRatio(
  benefits: number[],
  costs: number[],
  discountRate: number
): number {
  const maxLength = Math.max(benefits.length, costs.length);

  let presentValueBenefits = 0;
  let presentValueCosts = 0;

  for (let year = 0; year < maxLength; year++) {
    const discountFactor = Math.pow(1 + discountRate, year);

    const benefit = benefits[year] || 0;
    const cost = costs[year] || 0;

    presentValueBenefits += benefit / discountFactor;
    presentValueCosts += cost / discountFactor;
  }

  if (presentValueCosts === 0) {
    return Infinity;
  }

  return presentValueBenefits / presentValueCosts;
}

/**
 * DOC: Calcula o período de Payback (simples e descontado)
 *
 * @param cashFlows Fluxos de caixa (investimento inicial negativo no índice 0)
 * @param discountRate Taxa de desconto (opcional, para payback descontado)
 * @returns Período em anos ou null se não houver payback
 */
export function calculatePaybackPeriod(
  cashFlows: number[],
  discountRate?: number
): number | null {
  if (cashFlows.length < 2 || cashFlows[0] >= 0) {
    return null;
  }

  let cumulativeFlow = cashFlows[0]; // Investimento inicial (negativo)

  for (let year = 1; year < cashFlows.length; year++) {
    let currentFlow = cashFlows[year];

    // Se payback descontado, aplica desconto
    if (discountRate !== undefined) {
      currentFlow = currentFlow / Math.pow(1 + discountRate, year);
    }

    cumulativeFlow += currentFlow;

    // Se fluxo cumulativo ficou positivo, encontrou o payback
    if (cumulativeFlow >= 0) {
      // Interpola para encontrar o ponto exato
      const previousCumulative = cumulativeFlow - currentFlow;
      const fractionOfYear = Math.abs(previousCumulative) / currentFlow;

      return year - 1 + fractionOfYear;
    }
  }

  return null; // Não há payback no período analisado
}

/**
 * DOC: Calcula o Índice de Lucratividade (Profitability Index)
 * IL = VP(Fluxos futuros) / Investimento inicial
 *
 * @param cashFlows Fluxos incluindo investimento inicial
 * @param discountRate Taxa de desconto
 * @returns Índice de lucratividade (>1 indica viabilidade)
 */
export function calculateProfitabilityIndex(
  cashFlows: number[],
  discountRate: number
): number {
  if (cashFlows.length < 2) {
    return 0;
  }

  const initialInvestment = Math.abs(cashFlows[0]);
  const futureCashFlows = cashFlows.slice(1);

  const presentValueFuture = futureCashFlows.reduce((acc, cf, year) => {
    return acc + cf / Math.pow(1 + discountRate, year + 1);
  }, 0);

  if (initialInvestment === 0) {
    return Infinity;
  }

  return presentValueFuture / initialInvestment;
}

/**
 * DOC: Calcula TIR Modificada (MIRR) com taxas diferentes para investimento e reinvestimento
 *
 * @param cashFlows Fluxos de caixa
 * @param financeRate Taxa de financiamento (custo do capital)
 * @param reinvestRate Taxa de reinvestimento
 * @returns MIRR como decimal ou null
 */
export function calculateModifiedIRR(
  cashFlows: number[],
  financeRate: number,
  reinvestRate: number
): number | null {
  if (cashFlows.length < 2) {
    return null;
  }

  // Separa fluxos negativos (investimentos) e positivos (retornos)
  let presentValueInvestments = 0;
  let futureValueReturns = 0;

  const lastYear = cashFlows.length - 1;

  for (let year = 0; year < cashFlows.length; year++) {
    const cf = cashFlows[year];

    if (cf < 0) {
      // Traz investimentos a valor presente
      presentValueInvestments += cf / Math.pow(1 + financeRate, year);
    } else if (cf > 0) {
      // Leva retornos a valor futuro
      const periodsToEnd = lastYear - year;
      futureValueReturns += cf * Math.pow(1 + reinvestRate, periodsToEnd);
    }
  }

  if (presentValueInvestments >= 0 || futureValueReturns <= 0) {
    return null;
  }

  // MIRR = (VF_positivos / VP_negativos)^(1/n) - 1
  const mirr =
    Math.pow(
      futureValueReturns / Math.abs(presentValueInvestments),
      1 / lastYear
    ) - 1;

  return mirr;
}

/**
 * DOC: Função wrapper que calcula todas as métricas econômicas
 *
 * @param cashFlows Fluxos de caixa completos
 * @param discountRate Taxa de desconto
 * @param financeRate Taxa de financiamento (para MIRR)
 * @param reinvestRate Taxa de reinvestimento (para MIRR)
 * @returns Objeto com todas as métricas
 */
export function calculateAllMetrics(
  cashFlows: number[],
  discountRate: number,
  financeRate: number = discountRate,
  reinvestRate: number = discountRate
): EconomicMetrics {
  const npv = calculateNPV(
    cashFlows.slice(1),
    discountRate,
    Math.abs(cashFlows[0])
  );
  const irr = calculateIRR(cashFlows);
  const paybackPeriod = calculatePaybackPeriod(cashFlows, discountRate);
  const profitabilityIndex = calculateProfitabilityIndex(
    cashFlows,
    discountRate
  );
  const modifiedIrr = calculateModifiedIRR(
    cashFlows,
    financeRate,
    reinvestRate
  );

  // Calcula B/C separando benefícios e custos
  const benefits = cashFlows.map((cf) => Math.max(cf, 0));
  const costs = cashFlows.map((cf) => Math.max(-cf, 0));
  const benefitCostRatio = calculateBenefitCostRatio(
    benefits,
    costs,
    discountRate
  );

  return {
    npv,
    irr,
    benefitCostRatio,
    paybackPeriod,
    profitabilityIndex,
    modifiedIrr,
  };
}
