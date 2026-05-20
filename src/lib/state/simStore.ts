import { create } from "zustand";

// DOC: MixTop representa a divisão percentual entre Recuperação e Compensação
// que deve sempre somar 100%. Começamos pelo mix top-level para facilitar
// a subalocação por métodos específicos nas próximas tarefas.
export type MixTop = {
  recuperacao: number; // percentual para recuperação (0-100)
  compensacao: number; // percentual para compensação (0-100)
};

// DOC: Métodos específicos dentro da categoria Recuperação (agora com cerca/sem cerca)
export type MetodoRec = 
  | "regeneracao_sem_cerca" 
  | "regeneracao_com_cerca"
  | "semeadura_sem_cerca" 
  | "semeadura_com_cerca"
  | "mudas_sem_cerca" 
  | "mudas_com_cerca"
  | "agrofloresta";

// DOC: Cenários de restauro
export type CenarioRestauro = "otimista" | "conservador" | "pessimista";

// DOC: Restrição do mercado CRA
export type RestricaoMercadoCRA = "bioma" | "uf_bioma";

// DOC: MixRecuperacao representa a distribuição interna da categoria Recuperação
// entre os métodos específicos. Deve sempre somar 100% dentro da categoria.
export type MixRecuperacao = Record<MetodoRec, number>;

// DOC: Custos editáveis por hectare para cada método de recuperação + CRA
export type CustoHa = Record<MetodoRec | "cra", number>;

export type InputsBase = {
  bioma?: string;
  tipoSelecao: 'bioma' | 'uf' | 'uf_bioma'; // atualizado: adicionado 'uf_bioma'
  uf?: string; // UF selecionada
  ufBioma?: string; // novo: combinação UF+Bioma (ex: "AMAZONIA_AC")
  areaAlvo?: number; // área em hectares
  restringirRPPN?: boolean; // cenário: restringir oferta a RPPNs
  custoTransacao: number; // custo de transação em % (ex: 10 para 10%)
  custoTransacaoPSA: number; // custo de transação PSA em % (ex: 25 para 25%)
  bufferPSA: number; // buffer de risco PSA em % (ex: 15 para 15%)
  cenarioRestauro: CenarioRestauro; // cenário: otimista, conservador ou pessimista
  restricaoMercadoCRA: RestricaoMercadoCRA; // restrição do mercado CRA: bioma ou uf+bioma
  taxaDesconto: number; // taxa de desconto anual (valor direto, ex: 10 para 10%)
  mixTop: MixTop;
  mixRec: MixRecuperacao; // distribuição interna da categoria Recuperação
  custoHa: CustoHa; // custos editáveis por método
  receitaAgroflorestaHa: number; // receita potencial de agrofloresta em R$/ha (30 anos)
  areaMediaExcedenteRL: number; // Tamanho médio do déficit de RL por propriedade (ha)
};

// Valores padrão para a distribuição de métodos de recuperação (cenário conservador)
export const defaultMixRec: MixRecuperacao = {
  regeneracao_sem_cerca: 25,
  regeneracao_com_cerca: 25,
  semeadura_sem_cerca: 15,
  semeadura_com_cerca: 15,
  mudas_sem_cerca: 10,
  mudas_com_cerca: 10,
  agrofloresta: 0,
};

// Mix para cenário otimista
export const mixRecOtimista: MixRecuperacao = {
  regeneracao_sem_cerca: 0,
  regeneracao_com_cerca: 100,
  semeadura_sem_cerca: 0,
  semeadura_com_cerca: 0,
  mudas_sem_cerca: 0,
  mudas_com_cerca: 0,
  agrofloresta: 0,
};

// Mix para cenário pessimista
export const mixRecPessimista: MixRecuperacao = {
  regeneracao_sem_cerca: 10,
  regeneracao_com_cerca: 10,
  semeadura_sem_cerca: 15,
  semeadura_com_cerca: 15,
  mudas_sem_cerca: 25,
  mudas_com_cerca: 25,
  agrofloresta: 0,
};

// Valores padrão para custos por hectare
export const defaultCustoHa: CustoHa = {
  regeneracao_sem_cerca: 0,
  regeneracao_com_cerca: 0,
  semeadura_sem_cerca: 0,
  semeadura_com_cerca: 0,
  mudas_sem_cerca: 0,
  mudas_com_cerca: 0,
  agrofloresta: 50000,
  cra: 0,
};

// Custos padrão por bioma e método (em R$/ha)
// Fonte: Valores baseados em estudos de custos de restauração por bioma brasileiro
export const custosPadraoPorBioma: Record<string, CustoHa> = {
  amazonico: {
    regeneracao_sem_cerca: 269,
    regeneracao_com_cerca: 5066,
    semeadura_sem_cerca: 1673,
    semeadura_com_cerca: 12444,
    mudas_sem_cerca: 11099,
    mudas_com_cerca: 33132,
    agrofloresta: 50000,
    cra: 1200,
  },
  caatinga: {
    regeneracao_sem_cerca: 270,
    regeneracao_com_cerca: 5066,
    semeadura_sem_cerca: 1597,
    semeadura_com_cerca: 22297,
    mudas_sem_cerca: 10765,
    mudas_com_cerca: 42398,
    agrofloresta: 50000,
    cra: 900,
  },
  cerrado: {
    regeneracao_sem_cerca: 269,
    regeneracao_com_cerca: 5066,
    semeadura_sem_cerca: 5467,
    semeadura_com_cerca: 26462,
    mudas_sem_cerca: 12093,
    mudas_com_cerca: 44367,
    agrofloresta: 50000,
    cra: 1000,
  },
  mata_atlantica: {
    regeneracao_sem_cerca: 278,
    regeneracao_com_cerca: 5066,
    semeadura_sem_cerca: 802,
    semeadura_com_cerca: 23679,
    mudas_sem_cerca: 11634,
    mudas_com_cerca: 46031,
    agrofloresta: 50000,
    cra: 1400,
  },
  pampa: {
    regeneracao_sem_cerca: 270,
    regeneracao_com_cerca: 5066,
    semeadura_sem_cerca: 923,
    semeadura_com_cerca: 24133,
    mudas_sem_cerca: 10119,
    mudas_com_cerca: 45804,
    agrofloresta: 50000,
    cra: 800,
  },
  pantanal: {
    regeneracao_sem_cerca: 471,
    regeneracao_com_cerca: 5066,
    semeadura_sem_cerca: 566,
    semeadura_com_cerca: 24553,
    mudas_sem_cerca: 8624,
    mudas_com_cerca: 44270,
    agrofloresta: 50000,
    cra: 950,
  },
};

// Custos padrão por UF e método (valores baseados nos biomas predominantes em R$/ha)
export const custosPadraoPorUF: Record<string, CustoHa> = {
  AC: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1673, semeadura_com_cerca: 12444, mudas_sem_cerca: 11099, mudas_com_cerca: 33132, agrofloresta: 50000, cra: 1200 },
  AL: { regeneracao_sem_cerca: 278, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 802, semeadura_com_cerca: 23679, mudas_sem_cerca: 11634, mudas_com_cerca: 46031, agrofloresta: 50000, cra: 1400 },
  AP: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1673, semeadura_com_cerca: 12444, mudas_sem_cerca: 11099, mudas_com_cerca: 33132, agrofloresta: 50000, cra: 1200 },
  AM: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1673, semeadura_com_cerca: 12444, mudas_sem_cerca: 11099, mudas_com_cerca: 33132, agrofloresta: 50000, cra: 1200 },
  BA: { regeneracao_sem_cerca: 270, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1597, semeadura_com_cerca: 22297, mudas_sem_cerca: 10765, mudas_com_cerca: 42398, agrofloresta: 50000, cra: 1000 },
  CE: { regeneracao_sem_cerca: 270, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1597, semeadura_com_cerca: 22297, mudas_sem_cerca: 10765, mudas_com_cerca: 42398, agrofloresta: 50000, cra: 900 },
  DF: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 5467, semeadura_com_cerca: 26462, mudas_sem_cerca: 12093, mudas_com_cerca: 44367, agrofloresta: 50000, cra: 1000 },
  ES: { regeneracao_sem_cerca: 278, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 802, semeadura_com_cerca: 23679, mudas_sem_cerca: 11634, mudas_com_cerca: 46031, agrofloresta: 50000, cra: 1400 },
  GO: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 5467, semeadura_com_cerca: 26462, mudas_sem_cerca: 12093, mudas_com_cerca: 44367, agrofloresta: 50000, cra: 1000 },
  MA: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 3570, semeadura_com_cerca: 19453, mudas_sem_cerca: 11596, mudas_com_cerca: 38750, agrofloresta: 50000, cra: 1100 },
  MT: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 3570, semeadura_com_cerca: 19453, mudas_sem_cerca: 11596, mudas_com_cerca: 38750, agrofloresta: 50000, cra: 1100 },
  MS: { regeneracao_sem_cerca: 360, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 3017, semeadura_com_cerca: 24508, mudas_sem_cerca: 10359, mudas_com_cerca: 44319, agrofloresta: 50000, cra: 975 },
  MG: { regeneracao_sem_cerca: 274, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 3135, semeadura_com_cerca: 25071, mudas_sem_cerca: 11864, mudas_com_cerca: 45199, agrofloresta: 50000, cra: 1200 },
  PA: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1673, semeadura_com_cerca: 12444, mudas_sem_cerca: 11099, mudas_com_cerca: 33132, agrofloresta: 50000, cra: 1200 },
  PB: { regeneracao_sem_cerca: 270, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1597, semeadura_com_cerca: 22297, mudas_sem_cerca: 10765, mudas_com_cerca: 42398, agrofloresta: 50000, cra: 900 },
  PR: { regeneracao_sem_cerca: 278, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 802, semeadura_com_cerca: 23679, mudas_sem_cerca: 11634, mudas_com_cerca: 46031, agrofloresta: 50000, cra: 1300 },
  PE: { regeneracao_sem_cerca: 270, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1597, semeadura_com_cerca: 22297, mudas_sem_cerca: 10765, mudas_com_cerca: 42398, agrofloresta: 50000, cra: 950 },
  PI: { regeneracao_sem_cerca: 270, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 3532, semeadura_com_cerca: 24380, mudas_sem_cerca: 11429, mudas_com_cerca: 43383, agrofloresta: 50000, cra: 940 },
  RJ: { regeneracao_sem_cerca: 278, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 802, semeadura_com_cerca: 23679, mudas_sem_cerca: 11634, mudas_com_cerca: 46031, agrofloresta: 50000, cra: 1500 },
  RN: { regeneracao_sem_cerca: 270, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1597, semeadura_com_cerca: 22297, mudas_sem_cerca: 10765, mudas_com_cerca: 42398, agrofloresta: 50000, cra: 900 },
  RS: { regeneracao_sem_cerca: 270, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 923, semeadura_com_cerca: 24133, mudas_sem_cerca: 10119, mudas_com_cerca: 45804, agrofloresta: 50000, cra: 800 },
  RO: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1673, semeadura_com_cerca: 12444, mudas_sem_cerca: 11099, mudas_com_cerca: 33132, agrofloresta: 50000, cra: 1150 },
  RR: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1673, semeadura_com_cerca: 12444, mudas_sem_cerca: 11099, mudas_com_cerca: 33132, agrofloresta: 50000, cra: 1200 },
  SC: { regeneracao_sem_cerca: 278, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 802, semeadura_com_cerca: 23679, mudas_sem_cerca: 11634, mudas_com_cerca: 46031, agrofloresta: 50000, cra: 1300 },
  SP: { regeneracao_sem_cerca: 274, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 3135, semeadura_com_cerca: 25071, mudas_sem_cerca: 11864, mudas_com_cerca: 45199, agrofloresta: 50000, cra: 1400 },
  SE: { regeneracao_sem_cerca: 270, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 1597, semeadura_com_cerca: 22297, mudas_sem_cerca: 10765, mudas_com_cerca: 42398, agrofloresta: 50000, cra: 950 },
  TO: { regeneracao_sem_cerca: 269, regeneracao_com_cerca: 5066, semeadura_sem_cerca: 5467, semeadura_com_cerca: 26462, mudas_sem_cerca: 12093, mudas_com_cerca: 44367, agrofloresta: 50000, cra: 950 }
};

// Função para obter custos compatível com versão anterior
/** Custo por metro linear de cerca (R$/m) */
export const CUSTO_M_LINEAR_CERCA = 15.21;

/**
 * Custo de cercamento de referência usado para deslocar a curva de demanda (R$/ha).
 * Corresponde ao valor original de Young (2015) — R$ 1.742/ha — corrigido pela
 * inflação acumulada do IPCA de 2015 a 2025, resultando em aproximadamente R$ 5.400/ha.
 */
export const CUSTO_CERCAMENTO_ORIGINAL_YOUNG = 5400;

/**
 * Custo de instalação de cerca por hectare (R$/ha) em função do tamanho médio da área cercada.
 * Fórmula: perímetro ≈ 4 × √(A×10000) m = 400√A m → custo/ha = 400√A × $/m / A = (400 × $/m) / √A
 */
export function calcCustoRecNatComCerca(areaMediaHa: number): number {
  if (areaMediaHa <= 0) return 0;
  return (4 * 100 * CUSTO_M_LINEAR_CERCA) / Math.sqrt(areaMediaHa);
}

/**
 * Área média padrão do déficit de RL (ha) calibrada para reproduzir R$ 5.066/ha.
 * Solução de: 6084/√A = 5066 → A = (6084/5066)²
 */
export const AREA_MEDIA_EXCEDENTE_RL_DEFAULT = Math.pow(4 * 100 * CUSTO_M_LINEAR_CERCA / 5066, 2);

export function getCustosPadraoPorBioma(bioma?: string, areaMediaExcedenteRL?: number): CustoHa {
  return getCustosPadraoPorRegiao('bioma', bioma, areaMediaExcedenteRL);
}

/**
 * Retorna os custos padrão para um bioma ou UF específico.
 * Se areaMediaExcedenteRL for fornecida, recalcula regeneracao_com_cerca pela fórmula de cerca.
 */
export function getCustosPadraoPorRegiao(tipo: 'bioma' | 'uf', regiao?: string, areaMediaExcedenteRL?: number): CustoHa {
  let custos: CustoHa;
  if (!regiao) {
    custos = { ...defaultCustoHa };
  } else if (tipo === 'bioma' && custosPadraoPorBioma[regiao]) {
    custos = { ...custosPadraoPorBioma[regiao] };
  } else if (tipo === 'uf' && custosPadraoPorUF[regiao]) {
    custos = { ...custosPadraoPorUF[regiao] };
  } else {
    custos = { ...defaultCustoHa };
  }
  if (areaMediaExcedenteRL != null && areaMediaExcedenteRL > 0) {
    // Componente de cerca varia com a área; componente fixo (espécies/mudas) permanece constante.
    // BASE_FENCE = custo de cerca à área-padrão (≈ R$ 5.066/ha) já embutido nas tabelas.
    const BASE_FENCE = calcCustoRecNatComCerca(AREA_MEDIA_EXCEDENTE_RL_DEFAULT);
    const newFence   = calcCustoRecNatComCerca(areaMediaExcedenteRL);
    custos.regeneracao_com_cerca = newFence;
    custos.semeadura_com_cerca   = custos.semeadura_com_cerca - BASE_FENCE + newFence;
    custos.mudas_com_cerca       = custos.mudas_com_cerca     - BASE_FENCE + newFence;
  }
  return custos;
}

export interface SimStore {
  inputs: InputsBase;
  setMixTop: (partial: Partial<MixTop>) => void;
  normalizeMixTop: () => void;
  setBioma: (bioma?: string) => void;
  setTipoSelecao: (tipo: 'bioma' | 'uf' | 'uf_bioma') => void;
  setUF: (uf?: string) => void;
  setUFBioma: (ufBioma?: string) => void;
  setAreaAlvo: (area?: number) => void;
  setRestringirRPPN: (restringir: boolean) => void;
  setCustoTransacao: (custoTransacao: number) => void;
  setCustoTransacaoPSA: (custoTransacaoPSA: number) => void;
  setBufferPSA: (bufferPSA: number) => void;
  setCenarioRestauro: (cenario: CenarioRestauro) => void;
  setRestricaoMercadoCRA: (restricao: RestricaoMercadoCRA) => void;
  setTaxaDesconto: (taxa: number) => void;
  setMixRec: (partial: Partial<MixRecuperacao>) => void;
  normalizeMixRec: () => void;
  setCustoHa: (metodo: keyof CustoHa, valor: number) => void;
  setReceitaAgroflorestaHa: (valor: number) => void;
  setAreaMediaExcedenteRL: (area: number) => void;
}

/**
 * Normaliza o MixTop para garantir que a soma seja exatamente 100%
 * Prioriza o último valor alterado, ajustando o outro proporcionalmente
 */
export function normalizeMixTop(mixTop: MixTop): MixTop {
  const { recuperacao, compensacao } = mixTop;

  // Validate inputs
  if (typeof recuperacao !== "number" || typeof compensacao !== "number") {
    return { recuperacao: 50, compensacao: 50 };
  }

  if (isNaN(recuperacao) || isNaN(compensacao)) {
    return { recuperacao: 50, compensacao: 50 };
  }

  const total = recuperacao + compensacao;

  // Se já soma 100, retorna como está
  if (Math.abs(total - 100) < 0.01) {
    return { recuperacao, compensacao };
  }

  // Se ambos são 0, retorna valores padrão
  if (recuperacao === 0 && compensacao === 0) {
    return { recuperacao: 50, compensacao: 50 };
  }

  // Se um dos valores é 0, o outro deve ser 100
  if (recuperacao === 0) {
    return { recuperacao: 0, compensacao: 100 };
  }
  if (compensacao === 0) {
    return { recuperacao: 100, compensacao: 0 };
  }

  // Normaliza proporcionalmente apenas se total > 0
  if (total > 0) {
    const normalizedRecuperacao = (recuperacao / total) * 100;
    const normalizedCompensacao = 100 - normalizedRecuperacao;
    return {
      recuperacao: Math.round(normalizedRecuperacao * 100) / 100,
      compensacao: Math.round(normalizedCompensacao * 100) / 100,
    };
  }

  // Fallback para valores inválidos
  return { recuperacao: 50, compensacao: 50 };
}

/**
 * Normaliza o MixRecuperacao para garantir que a soma seja exatamente 100%
 * DOC: Redistribui proporcionalmente quando a soma é diferente de 100%
 */
export function normalizeMixRec(mixRec: MixRecuperacao): MixRecuperacao {
  const metodos = Object.keys(mixRec) as MetodoRec[];
  const valores = metodos.map((m) => mixRec[m]);
  const total = valores.reduce((sum, val) => sum + val, 0);

  // Validar inputs
  if (valores.some((v) => typeof v !== "number" || isNaN(v))) {
    return { ...defaultMixRec };
  }

  // Se já soma 100, retorna como está
  if (Math.abs(total - 100) < 0.01) {
    return { ...mixRec };
  }

  // Se total é 0, retorna valores padrão
  if (total <= 0) {
    return { ...defaultMixRec };
  }

  // Normaliza proporcionalmente
  const normalized: MixRecuperacao = {} as MixRecuperacao;
  let accumulatedSum = 0;

  metodos.forEach((metodo, index) => {
    if (index === metodos.length - 1) {
      // Último método recebe o restante para garantir soma = 100
      normalized[metodo] = 100 - accumulatedSum;
    } else {
      const normalizedValue =
        Math.round((mixRec[metodo] / total) * 100 * 100) / 100;
      normalized[metodo] = normalizedValue;
      accumulatedSum += normalizedValue;
    }
  });

  return normalized;
}

/**
 * DOC: Calcula hectares estimados para um método específico de recuperação
 * Fórmula: areaRestauracao * (mixRec[método]/100)
 * A areaRestauracao já é a área não compensada (Qmax - Q*)
 */
export function calcHectaresMetodo(
  metodo: MetodoRec,
  areaRestauracao: number | undefined,
  mixRec: MixRecuperacao
): number {
  if (!areaRestauracao || areaRestauracao <= 0) {
    return 0;
  }

  const percentualMetodo = mixRec[metodo] / 100;

  return areaRestauracao * percentualMetodo;
}

const METODOS_REC_LIST: MetodoRec[] = [
  "regeneracao_sem_cerca", "regeneracao_com_cerca",
  "semeadura_sem_cerca", "semeadura_com_cerca",
  "mudas_sem_cerca", "mudas_com_cerca", "agrofloresta",
];

/**
 * Calcula o custo médio ponderado de restauração (R$/ha) baseado no mix e custos do cenário selecionado.
 */
export function calcCustoMedioRestauracao(mixRec: MixRecuperacao, custoHa: CustoHa): number {
  return METODOS_REC_LIST.reduce((acc, metodo) => {
    return acc + ((mixRec[metodo] ?? 0) / 100) * (custoHa[metodo] ?? 0);
  }, 0);
}

export const useSimStore = create<SimStore>((set, get) => ({
  inputs: {
    bioma: "amazonico",
    tipoSelecao: 'bioma' as const,
    uf: undefined,
    ufBioma: "AMAZONIA_AC", // Acre (AC) Amazônia como padrão
    areaAlvo: 6262407.71, // Qmax da Amazônia
    cenarioRestauro: 'otimista' as const, // Padrão: otimista
    restricaoMercadoCRA: 'bioma' as const, // Padrão: restrição por bioma
    taxaDesconto: 10, // Taxa de desconto padrão: 10%
    custoTransacao: 10, // Custo de transação padrão: 10%
    custoTransacaoPSA: 25, // Custo de transação PSA padrão: 25%
    bufferPSA: 15, // Buffer PSA padrão: 15%
    mixTop: { recuperacao: 50, compensacao: 50 },
    mixRec: { ...mixRecOtimista },
    custoHa: getCustosPadraoPorRegiao('bioma', "amazonico", AREA_MEDIA_EXCEDENTE_RL_DEFAULT), // Custos padrão do bioma inicial
    receitaAgroflorestaHa: 70000, // Receita potencial de agrofloresta: R$ 70.000/ha em 30 anos
    areaMediaExcedenteRL: AREA_MEDIA_EXCEDENTE_RL_DEFAULT, // Área média de déficit de RL calibrada para R$ 5.066/ha
  },

  setMixTop: (partial: Partial<MixTop>) =>
    set((state) => {
      try {
        const currentMixTop = state.inputs.mixTop;
        const newMixTop = { ...currentMixTop };

        // Auto-ajusta o outro valor para manter soma = 100
        if (
          partial.recuperacao !== undefined &&
          partial.compensacao === undefined
        ) {
          const newRecuperacao = Math.max(
            0,
            Math.min(100, partial.recuperacao)
          );
          newMixTop.recuperacao = newRecuperacao;
          newMixTop.compensacao = 100 - newRecuperacao;
        } else if (
          partial.compensacao !== undefined &&
          partial.recuperacao === undefined
        ) {
          const newCompensacao = Math.max(
            0,
            Math.min(100, partial.compensacao)
          );
          newMixTop.compensacao = newCompensacao;
          newMixTop.recuperacao = 100 - newCompensacao;
        } else if (
          partial.recuperacao !== undefined &&
          partial.compensacao !== undefined
        ) {
          // Both values provided, normalize them
          const normalized = normalizeMixTop({
            recuperacao: partial.recuperacao,
            compensacao: partial.compensacao,
          });
          newMixTop.recuperacao = normalized.recuperacao;
          newMixTop.compensacao = normalized.compensacao;
        }

        return {
          inputs: {
            ...state.inputs,
            mixTop: newMixTop,
          },
        };
      } catch (error) {
        console.error("Error in setMixTop:", error);
        return state; // Return unchanged state on error
      }
    }),

  normalizeMixTop: () =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        mixTop: normalizeMixTop(state.inputs.mixTop),
      },
    })),

  setBioma: (bioma?: string) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        bioma,
        tipoSelecao: 'bioma' as const,
        uf: undefined,
        custoHa: getCustosPadraoPorRegiao('bioma', bioma, state.inputs.areaMediaExcedenteRL), // Atualiza custos ao mudar bioma
      },
    })),

  setTipoSelecao: (tipoSelecao: 'bioma' | 'uf' | 'uf_bioma') =>
    set((state) => {
      if (tipoSelecao === 'bioma') {
        // Ao trocar para bioma, definir Cerrado como padrão
        return {
          inputs: {
            ...state.inputs,
            tipoSelecao,
            bioma: 'cerrado',
            uf: undefined,
            ufBioma: undefined,
            areaAlvo: 7926174, // Qmax do Cerrado
            custoHa: getCustosPadraoPorRegiao('bioma', 'cerrado', state.inputs.areaMediaExcedenteRL),
          },
        };
      } else if (tipoSelecao === 'uf') {
        // Ao trocar para UF+Bioma, definir CERRADO_GO como padrão
        return {
          inputs: {
            ...state.inputs,
            tipoSelecao,
            bioma: undefined,
            uf: undefined,
            ufBioma: 'CERRADO_GO',
            areaAlvo: 681669.786, // Qmax do Cerrado GO
            custoHa: getCustosPadraoPorRegiao('bioma', 'cerrado', state.inputs.areaMediaExcedenteRL),
          },
        };
      } else {
        // Fallback para uf_bioma (caso seja usado diretamente)
        return {
          inputs: {
            ...state.inputs,
            tipoSelecao,
            bioma: undefined,
            uf: undefined,
            ufBioma: 'CERRADO_GO',
            areaAlvo: 681669.786, // Qmax do Cerrado GO
            custoHa: getCustosPadraoPorRegiao('bioma', 'cerrado', state.inputs.areaMediaExcedenteRL),
          },
        };
      }
    }),

  setUFBioma: (ufBioma?: string) =>
    set((state) => ({
      inputs: { ...state.inputs, ufBioma },
    })),

  setUF: (uf?: string) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        uf,
        tipoSelecao: 'uf' as const,
        bioma: undefined,
        custoHa: getCustosPadraoPorRegiao('uf', uf, state.inputs.areaMediaExcedenteRL), // Atualiza custos ao mudar UF
      },
    })),

  setAreaAlvo: (areaAlvo?: number) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        areaAlvo,
      },
    })),

  setRestringirRPPN: (restringirRPPN: boolean) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        restringirRPPN,
      },
    })),

  setReduzirCustoOferta: (reduzirCustoOferta: boolean) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        reduzirCustoOferta,
      },
    })),

  setCustoTransacao: (custoTransacao: number) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        custoTransacao,
      },
    })),

  setCustoTransacaoPSA: (custoTransacaoPSA: number) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        custoTransacaoPSA,
      },
    })),

  setBufferPSA: (bufferPSA: number) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        bufferPSA,
      },
    })),

  setCenarioRestauro: (cenarioRestauro: CenarioRestauro) =>
    set((state) => {
      // Atualizar mix de recuperação baseado no cenário
      const newMixRec =
        cenarioRestauro === 'otimista'
          ? { ...mixRecOtimista }
          : cenarioRestauro === 'conservador'
            ? { ...defaultMixRec }
            : { ...mixRecPessimista };
      
      return {
        inputs: {
          ...state.inputs,
          cenarioRestauro,
          mixRec: newMixRec,
        },
      };
    }),

  setRestricaoMercadoCRA: (restricaoMercadoCRA: RestricaoMercadoCRA) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        restricaoMercadoCRA,
      },
    })),

  setTaxaDesconto: (taxaDesconto: number) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        taxaDesconto: Math.max(0, Math.min(100, taxaDesconto)), // Limita entre 0% e 100%
      },
    })),

  setMixRec: (partial: Partial<MixRecuperacao>) =>
    set((state) => {
      try {
        const currentMixRec = state.inputs.mixRec;
        const newMixRec = { ...currentMixRec, ...partial };

        return {
          inputs: {
            ...state.inputs,
            mixRec: newMixRec,
          },
        };
      } catch (error) {
        console.error("Error in setMixRec:", error);
        return state;
      }
    }),

  normalizeMixRec: () =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        mixRec: normalizeMixRec(state.inputs.mixRec),
      },
    })),

  setCustoHa: (metodo: keyof CustoHa, valor: number) =>
    set((state) => {
      try {
        const valorSeguro = Math.max(0, valor || 0);
        return {
          inputs: {
            ...state.inputs,
            custoHa: {
              ...state.inputs.custoHa,
              [metodo]: valorSeguro,
            },
          },
        };
      } catch (error) {
        console.error("Error in setCustoHa:", error);
        return state;
      }
    }),

  setReceitaAgroflorestaHa: (valor: number) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        receitaAgroflorestaHa: Math.max(0, valor || 0),
      },
    })),

  setAreaMediaExcedenteRL: (area: number) =>
    set((state) => {
      const safeArea = Math.max(0.01, area || AREA_MEDIA_EXCEDENTE_RL_DEFAULT);
      // Isola componente fixo (independente de cerca) backdando o custo de cerca anterior
      const oldFence = calcCustoRecNatComCerca(state.inputs.areaMediaExcedenteRL);
      const newFence = calcCustoRecNatComCerca(safeArea);
      return {
        inputs: {
          ...state.inputs,
          areaMediaExcedenteRL: safeArea,
          custoHa: {
            ...state.inputs.custoHa,
            regeneracao_com_cerca: newFence,
            semeadura_com_cerca: state.inputs.custoHa.semeadura_com_cerca - oldFence + newFence,
            mudas_com_cerca:     state.inputs.custoHa.mudas_com_cerca     - oldFence + newFence,
          },
        },
      };
    }),
}));
