// DOC: Tipos centralizados para análise econômica
// Responsável por: definir interfaces para cálculos financeiros, curvas CRA, métricas
// Usado por: lib/econ/*, API routes, componentes de resultado

export interface CashFlow {
  year: number;
  investment: number; // Investimento (negativo)
  revenue: number; // Receitas (positivo)
  costs: number; // Custos operacionais (negativo)
  netCashFlow: number; // Fluxo líquido
}

export interface EconomicMetrics {
  npv: number; // Valor Presente Líquido
  irr: number | null; // Taxa Interna de Retorno (null se não convergir)
  benefitCostRatio: number; // Relação Benefício/Custo
  paybackPeriod: number | null; // Período de Payback (null se não houver)
  profitabilityIndex: number; // Índice de Lucratividade
  modifiedIrr: number | null; // TIR Modificada
}

export interface SensitivityAnalysis {
  parameter: string; // Nome do parâmetro analisado
  baseValue: number; // Valor base
  variations: SensitivityPoint[];
}

export interface SensitivityPoint {
  variation: number; // Variação percentual (-50% a +50%)
  parameterValue: number; // Valor do parâmetro
  npv: number; // VPL resultante
  irr: number | null; // TIR resultante
}

// DOC: Interface para curvas de oferta e demanda de CRA
export interface CRAMarketCurve {
  biome: string;
  region?: string;
  supply: CRASupplyPoint[];
  demand: CRADemandPoint[];
  equilibrium?: {
    price: number; // R$/ha
    quantity: number; // hectares
  };
}

export interface CRASupplyPoint {
  quantity: number; // hectares disponíveis
  price: number; // R$/ha
  qualityScore: number; // 0-100 (qualidade/certificação)
  location: {
    state: string;
    municipality?: string;
    coordinates?: [number, number]; // [lat, lng]
  };
  transactionCosts: number; // R$/ha
}

export interface CRADemandPoint {
  quantity: number; // hectares demandados
  maxPrice: number; // R$/ha - preço máximo disposto a pagar
  urgency: "low" | "medium" | "high";
  buyer: {
    type: "producer" | "company" | "government";
    size: "small" | "medium" | "large";
  };
}

// DOC: Interface para custos de transação
export interface TransactionCosts {
  legal: number; // Custos legais e cartoriais
  certification: number; // Custos de certificação
  monitoring: number; // Custos de monitoramento
  brokerage: number; // Corretagem
  insurance?: number; // Seguro (opcional)
  total: number; // Total dos custos de transação
}

// DOC: Interface para custo de oportunidade
export interface OpportunityCost {
  landUse: "agriculture" | "livestock" | "forestry" | "urban";
  expectedReturn: number; // R$/ha/ano
  timeHorizon: number; // anos
  riskFactor: number; // 0-1 (0 = sem risco, 1 = muito arriscado)
  npvOpportunity: number; // VPL da oportunidade perdida
}

// DOC: Parâmetros econômicos globais
export interface EconomicParameters {
  discountRate: number; // Taxa de desconto
  inflationRate: number; // Taxa de inflação
  carbonPrice: number; // R$/tCO2
  timeHorizon: number; // Horizonte temporal (anos)

  // Premissas de mercado
  market: {
    craGrowthRate: number; // Taxa de crescimento do mercado CRA
    carbonGrowthRate: number; // Taxa de crescimento preço carbono
    riskPremium: number; // Prêmio de risco
  };

  // Fatores de ajuste
  adjustments: {
    regionalMultiplier: number; // Multiplicador regional
    seasonalityFactor: number; // Fator de sazonalidade
    liquidityDiscount: number; // Desconto por liquidez
  };
}

// DOC: Interface para resultado completo de análise econômica
export interface EconomicAnalysisResult {
  metrics: EconomicMetrics;
  cashFlows: CashFlow[];
  sensitivity: SensitivityAnalysis[];

  // Análises específicas
  craAnalysis?: {
    marketCurve: CRAMarketCurve;
    transactionCosts: TransactionCosts;
    priceProjection: Array<{
      year: number;
      projectedPrice: number;
      confidence: number; // 0-1
    }>;
  };

  opportunityCost?: OpportunityCost;

  // Breakdowns detalhados
  breakdown: {
    totalInvestment: number;
    totalRevenue: number;
    totalCosts: number;

    byCategory: {
      establishment: number;
      maintenance: number;
      monitoring: number;
      transaction: number;
    };

    byMethod: Record<
      string,
      {
        investment: number;
        revenue: number;
        area: number;
      }
    >;
  };
}

// DOC: Configurações para diferentes tipos de análise
export interface AnalysisConfig {
  includeInflation: boolean;
  includeCarbonRevenue: boolean;
  includeOpportunityCost: boolean;
  includeTransactionCosts: boolean;

  sensitivityParameters: Array<{
    parameter: keyof EconomicParameters;
    range: { min: number; max: number };
    steps: number;
  }>;

  monteCarlo?: {
    iterations: number;
    confidenceLevel: number; // 0.95 para 95%
  };
}
