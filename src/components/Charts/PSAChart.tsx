"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { Biome, QMAX_BY_BIOME } from "@/data/biome-data";
import { findEquilibrium } from "@/lib/chart";

// Densidade de carbono por bioma (tCO2/ha) - valores atualizados
const CARBON_DENSITY: Record<Biome, number> = {
  amazonico: 593,
  caatinga: 125,
  cerrado: 178.8,
  mata_atlantica: 413.5,
  pampa: 128.2,
  pantanal: 153.9,
};

// Export for use in other components
export { CARBON_DENSITY };

// QMAX values for PSA perspective - soma dos qMaxOferta de todas as regiões por bioma
export const QMAX_PSA_TOTAL: Record<Biome, number> = {
  amazonico: 44705066.46,
  caatinga: 9875320.69,
  cerrado: 41676626.65,
  mata_atlantica: 12816290.23,
  pampa: 2642163.30,
  pantanal: 4551938.51,
};

// QMAX values for PSA perspective - Oferta Pequenos (excluindo pequenos proprietários)
export const QMAX_PSA_PEQUENOS: Record<Biome, number> = {
  amazonico: 35667502.30,
  caatinga: 4475367.48,
  cerrado: 34186421.93,
  mata_atlantica: 7703558.46,
  pampa: 1928390.82,
  pantanal: 4332671.84,
};

// QMAX da Demanda (Q regularização) - agregado por bioma da perspectiva macro
const QMAX_DEMANDA: Record<Biome, number> = {
  amazonico: 13950979.9,
  caatinga: 1261150.65,
  cerrado: 10025373.1,
  mata_atlantica: 4359888.66,
  pampa: 754346.767,
  pantanal: 90652.6726,
};

// Interceptos base das curvas de oferta - Oferta Total
export const INTERCEPTS_TOTAL: Record<Biome, number> = {
  amazonico: 5719.8,
  caatinga: 5021.7,
  cerrado: 7239.7,
  mata_atlantica: 9037.9,
  pampa: 17037.0,
  pantanal: 8015.0,
};

// Interceptos base das curvas de oferta - Oferta Pequenos
export const INTERCEPTS_PEQUENOS: Record<Biome, number> = {
  amazonico: 6156.3,
  caatinga: 5181.5,
  cerrado: 7605.2,
  mata_atlantica: 10257.0,
  pampa: 18215.0,
  pantanal: 8088.8,
};

// PSA Supply curve functions - Oferta Total
export const supplyFunctionsPSA_Total: Record<Biome, (Q: number, custoTransacao: number) => number> = {
  amazonico: (Q, custoTransacao) => {
    // y = 2.1526e-33x^5 - 2.3565e-25x^4 + 9.2975e-18x^3 - 1.5743e-10x^2 + 1.2974e-03x + 5.7198e+03
    const c0 = INTERCEPTS_TOTAL.amazonico * (1 + custoTransacao / 100);
    return c0 + 
      0.0012974 * Q + 
      -0.00000000015743 * Q ** 2 + 
      0.0000000000000000092975 * Q ** 3 + 
      -0.00000000000000000000000023565 * Q ** 4 + 
      0.0000000000000000000000000000000021526 * Q ** 5;
  },
  caatinga: (Q, custoTransacao) => {
    // y = 2.3555e-30x^5 - 4.7717e-23x^4 + 3.4036e-16x^3 - 1.0016e-09x^2 + 1.7146e-03x + 5.0217e+03
    const c0 = INTERCEPTS_TOTAL.caatinga * (1 + custoTransacao / 100);
    return c0 + 
      0.0017146 * Q + 
      -0.0000000010016 * Q ** 2 + 
      0.00000000000000034036 * Q ** 3 + 
      -0.000000000000000000000047717 * Q ** 4 + 
      0.0000000000000000000000000000023555 * Q ** 5;
  },
  cerrado: (Q, custoTransacao) => {
    // y = 1.2118e-18x^3 - 7.3551e-11x^2 + 1.6199e-03x + 7.2397e+03
    const c0 = INTERCEPTS_TOTAL.cerrado * (1 + custoTransacao / 100);
    return c0 + 
      0.0016199 * Q + 
      -0.000000000073551 * Q ** 2 + 
      0.0000000000000000012118 * Q ** 3;
  },
  mata_atlantica: (Q, custoTransacao) => {
    // y = 9.7340e-31x^5 - 2.9149e-23x^4 + 3.3793e-16x^3 - 1.9502e-09x^2 + 7.1054e-03x + 9.0379e+03
    const c0 = INTERCEPTS_TOTAL.mata_atlantica * (1 + custoTransacao / 100);
    return c0 + 
      0.0071054 * Q + 
      -0.0000000019502 * Q ** 2 + 
      0.00000000000000033793 * Q ** 3 + 
      -0.000000000000000000000029149 * Q ** 4 + 
      0.00000000000000000000000000000097340 * Q ** 5;
  },
  pampa: (Q, custoTransacao) => {
    // y = 8.9922e-27x^5 - 5.2457e-20x^4 + 1.0983e-13x^3 - 9.9894e-08x^2 + 4.3559e-02x + 1.7037e+04
    const c0 = INTERCEPTS_TOTAL.pampa * (1 + custoTransacao / 100);
    return c0 + 
      0.043559 * Q + 
      -0.000000099894 * Q ** 2 + 
      0.00000000000010983 * Q ** 3 + 
      -0.000000000000000000052457 * Q ** 4 + 
      0.0000000000000000000000000089922 * Q ** 5;
  },
  pantanal: (Q, custoTransacao) => {
    // y = 4.3066e-29x^5 - 5.5352e-22x^4 + 2.7542e-15x^3 - 6.5522e-09x^2 + 7.9699e-03x + 8.0150e+03
    const c0 = INTERCEPTS_TOTAL.pantanal * (1 + custoTransacao / 100);
    return c0 + 
      0.0079699 * Q + 
      -0.0000000065522 * Q ** 2 + 
      0.0000000000000027542 * Q ** 3 + 
      -0.00000000000000000000055352 * Q ** 4 + 
      0.000000000000000000000000000043066 * Q ** 5;
  },
};

// PSA Supply curve functions - Oferta Pequenos (excluindo pequenos proprietários)
export const supplyFunctionsPSA_Pequenos: Record<Biome, (Q: number, custoTransacao: number) => number> = {
  amazonico: (Q, custoTransacao) => {
    // y = 9.9508e-33x^5 - 8.2441e-25x^4 + 2.4486e-17x^3 - 3.1083e-10x^2 + 1.8726e-03x + 6.1563e+03
    const c0 = INTERCEPTS_PEQUENOS.amazonico * (1 + custoTransacao / 100);
    return c0 + 
      0.0018726 * Q + 
      -0.00000000031083 * Q ** 2 + 
      0.000000000000000024486 * Q ** 3 + 
      -0.00000000000000000000000082441 * Q ** 4 + 
      0.0000000000000000000000000000000099508 * Q ** 5;
  },
  caatinga: (Q, custoTransacao) => {
    // y = 1.1758e-28x^5 - 1.0538e-21x^4 + 3.3677e-15x^3 - 4.6451e-09x^2 + 4.2979e-03x + 5.1815e+03
    const c0 = INTERCEPTS_PEQUENOS.caatinga * (1 + custoTransacao / 100);
    return c0 + 
      0.0042979 * Q + 
      -0.0000000046451 * Q ** 2 + 
      0.0000000000000033677 * Q ** 3 + 
      -0.0000000000000000000010538 * Q ** 4 + 
      0.00000000000000000000000000011758 * Q ** 5;
  },
  cerrado: (Q, custoTransacao) => {
    // y = 2.7407e-18x^3 - 1.3300e-10x^2 + 2.2312e-03x + 7.6052e+03
    const c0 = INTERCEPTS_PEQUENOS.cerrado * (1 + custoTransacao / 100);
    return c0 + 
      0.0022312 * Q + 
      -0.000000000133 * Q ** 2 + 
      0.0000000000000000027407 * Q ** 3;
  },
  mata_atlantica: (Q, custoTransacao) => {
    // y = 4.9371e-16x^3 - 4.5615e-09x^2 + 1.3779e-02x + 1.0257e+04
    const c0 = INTERCEPTS_PEQUENOS.mata_atlantica * (1 + custoTransacao / 100);
    return c0 + 
      0.013779 * Q + 
      -0.0000000045615 * Q ** 2 + 
      0.00000000000000049371 * Q ** 3;
  },
  pampa: (Q, custoTransacao) => {
    // y = 4.1420e-26x^5 - 1.7667e-19x^4 + 2.7161e-13x^3 - 1.8211e-07x^2 + 5.8502e-02x + 1.8215e+04
    const c0 = INTERCEPTS_PEQUENOS.pampa * (1 + custoTransacao / 100);
    return c0 + 
      0.058502 * Q + 
      -0.00000018211 * Q ** 2 + 
      0.00000000000027161 * Q ** 3 + 
      -0.00000000000000000017667 * Q ** 4 + 
      0.000000000000000000000000041420 * Q ** 5;
  },
  pantanal: (Q, custoTransacao) => {
    // y = 6.4524e-29x^5 - 7.8121e-22x^4 + 3.6220e-15x^3 - 7.9328e-09x^2 + 8.7334e-03x + 8.0888e+03
    const c0 = INTERCEPTS_PEQUENOS.pantanal * (1 + custoTransacao / 100);
    return c0 + 
      0.0087334 * Q + 
      -0.0000000079328 * Q ** 2 + 
      0.000000000000003622 * Q ** 3 + 
      -0.00000000000000000000078121 * Q ** 4 + 
      0.000000000000000000000000000064524 * Q ** 5;
  },
};

interface PSAChartProps {
  biome: Biome;
  modoPSA: "precoCarbono" | "valorTerra";
  precoCarbono: number;
  valorTerra: number;
  custoTransacao: number;
  bufferPSA: number;
  excluirPequenos: boolean;
  taxaDesconto: number;
  compactView?: boolean;
  showNumericResults?: boolean;
  showNumericToggle?: boolean;
}

export default function PSAChart({ biome, modoPSA, precoCarbono, valorTerra, custoTransacao, bufferPSA, excluirPequenos, taxaDesconto, compactView = false, showNumericResults, showNumericToggle = true }: PSAChartProps) {
  const { t, tr, locale } = useTranslation();
  const [showNumericResultsLocal, setShowNumericResultsLocal] = useState(!compactView);
  const resolvedShowNumericResults = showNumericResults ?? showNumericResultsLocal;
  const biomeNames: Record<Biome, string> = {
    pampa: t.biomes.pampa,
    pantanal: t.biomes.pantanal,
    cerrado: t.biomes.cerrado,
    mata_atlantica: t.biomes.mata_atlantica,
    amazonico: t.biomes.amazonia,
    caatinga: t.biomes.caatinga,
  };

  const infoLabel = (label: string, helpText: string, align: "left" | "center" | "right" = "center") => (
    <span className="inline-flex items-center gap-1">
      <span className="relative group inline-flex items-center">
        <button
          type="button"
          aria-label={tr("psa.infoAria", { label })}
          className="w-3.5 h-3.5 rounded-full border border-gray-400 text-gray-500 text-[9px] leading-none font-semibold hover:bg-gray-100"
        >
          i
        </button>
        <span className={`pointer-events-none absolute bottom-full mb-2 w-64 rounded-md bg-gray-900 text-white text-[11px] font-normal leading-relaxed p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg ${
          align === "left"
            ? "left-0"
            : align === "right"
              ? "right-0"
              : "left-1/2 -translate-x-1/2"
        }`}>
          {helpText}
        </span>
      </span>
      <span>{label}</span>
    </span>
  );

  const chartData = useMemo(() => {
    // Escolher Qmax baseado em excluirPequenos
    const Qmax = excluirPequenos ? QMAX_PSA_PEQUENOS[biome] : QMAX_PSA_TOTAL[biome];
    
    // Escolher função de oferta baseado em excluirPequenos
    const supplyFunction = excluirPequenos ? supplyFunctionsPSA_Pequenos[biome] : supplyFunctionsPSA_Total[biome];
    
    const carbonDensity = CARBON_DENSITY[biome];
    
    // Calculate demand price based on mode
    const demandPrice = modoPSA === "precoCarbono" 
      ? precoCarbono * carbonDensity  // Modo padrão: preço carbono -> valor terra
      : valorTerra;                   // Modo alternativo: valor terra direto
    const effectiveSupplySurcharge = ((1 + (custoTransacao || 0) / 100) * (1 + (bufferPSA || 0) / 100) - 1) * 100;
    
    const numPoints = 100;
    const data = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const Q = (i / numPoints) * Qmax;
      const supplyPrice = supplyFunction(Q, effectiveSupplySurcharge);
      
      data.push({
        Q,
        supply: supplyPrice,
        demand: demandPrice,
      });
    }
    
    return data;
  }, [biome, modoPSA, precoCarbono, valorTerra, custoTransacao, bufferPSA, excluirPequenos]);

  // Find equilibrium
  const equilibrium = useMemo(() => {
    // Escolher Qmax baseado em excluirPequenos
    const Qmax = excluirPequenos ? QMAX_PSA_PEQUENOS[biome] : QMAX_PSA_TOTAL[biome];
    
    // Escolher função de oferta baseado em excluirPequenos
    const supplyFunction = excluirPequenos ? supplyFunctionsPSA_Pequenos[biome] : supplyFunctionsPSA_Total[biome];
    
    const carbonDensity = CARBON_DENSITY[biome];
    
    // Calculate demand price based on mode
    const demandPrice = modoPSA === "precoCarbono" 
      ? precoCarbono * carbonDensity  // Modo padrão: preço carbono -> valor terra
      : valorTerra;                   // Modo alternativo: valor terra direto
    const effectiveSupplySurcharge = ((1 + (custoTransacao || 0) / 100) * (1 + (bufferPSA || 0) / 100) - 1) * 100;
    
    // Verificar os limites primeiro
    const supplyAtZero = supplyFunction(0, effectiveSupplySurcharge);
    const supplyAtMax = supplyFunction(Qmax, effectiveSupplySurcharge);
    
    // Se oferta em Q=0 já é maior que demanda, equilíbrio é Q=0
    if (supplyAtZero >= demandPrice) {
      return { Qstar: 0, Pstar: demandPrice };
    }
    
    // Se oferta em Q=Qmax ainda é menor que demanda, equilíbrio é Q=Qmax
    if (supplyAtMax <= demandPrice) {
      return { Qstar: Qmax, Pstar: demandPrice };
    }
    
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
  }, [biome, modoPSA, precoCarbono, valorTerra, custoTransacao, bufferPSA, excluirPequenos]);

  // Função para calcular pagamento anualizado (PMT) usando valor presente
  const calculateAnnualizedPayment = (PV: number, r: number, n: number = 30): number => {
    // Se taxa de desconto for zero, usa divisão simples
    if (r === 0) {
      return PV / n;
    }
    
    // Converte taxa percentual para decimal
    const rDecimal = r / 100;
    
    // Fórmula PMT: PV * [r(1+r)^n] / [(1+r)^n - 1]
    const factor1 = rDecimal * Math.pow(1 + rDecimal, n);
    const factor2 = Math.pow(1 + rDecimal, n) - 1;
    
    return PV * (factor1 / factor2);
  };

  // Calcular Q de equilíbrio da perspectiva Macro (mercado CRA)
  const qRegularizacao = useMemo(() => {
    const Qmax = QMAX_BY_BIOME[biome];
    const equilibrioMacro = findEquilibrium(biome, Qmax, custoTransacao || 0);
    return equilibrioMacro ? equilibrioMacro.Qstar : 0;
  }, [biome, custoTransacao]);

  // Calcula valores anualizados
  const Pstar_anualizado = calculateAnnualizedPayment(equilibrium.Pstar, taxaDesconto);
  const Q_PSA = Math.max(0, equilibrium.Qstar - qRegularizacao);
  const Receita_PSA = equilibrium.Pstar * Q_PSA;
  const Receita_PSA_anualizada = calculateAnnualizedPayment(Receita_PSA, taxaDesconto);

  const formatNumber = (value: number) => {
    return value.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Escolher Qmax baseado em excluirPequenos para o gráfico
  const currentQmax = excluirPequenos ? QMAX_PSA_PEQUENOS[biome] : QMAX_PSA_TOTAL[biome];
  
  // Calcular custo da terra específico para este bioma
  const carbonDensity = CARBON_DENSITY[biome];
  
  // Mostrar o valor que o usuário digitou (não o calculado)
  const labelValor = modoPSA === "precoCarbono" 
    ? tr("psa.carbonPriceSelected", {
        value: precoCarbono.toLocaleString(locale, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
      })
    : tr("psa.landValueSelected", { value: formatNumber(valorTerra) });

  const chartHeight = compactView ? 210 : 280;

  return (
    <div className={compactView ? "space-y-2" : "space-y-4"} data-chart="psa">
      <div className="flex justify-between items-start">
        <h3 className={compactView ? "text-base font-semibold text-gray-800" : "text-lg font-semibold text-gray-800"}>
          {biomeNames[biome]}
        </h3>
        <div className={compactView ? "text-right text-xs" : "text-right text-sm"}>
          <div className="text-gray-600">
            {tr("psa.carbonDensityDisplay", { value: CARBON_DENSITY[biome] })}
          </div>
          <div className={compactView ? "text-blue-700 font-medium text-xs" : "text-blue-700 font-medium"}>
            {labelValor}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={chartData} margin={{ top: 30, right: 20, left: 72, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4dde9" />
          <XAxis
            dataKey="Q"
            type="number"
            domain={[0, currentQmax]}
            allowDataOverflow={false}
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            label={{ value: t.supplyDemand.quantityHa, position: "insideBottom", offset: -5 }}
            stroke="#31688e"
          />
          <YAxis
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            label={{
              value: t.supplyDemand.pricePerHa,
              angle: -90,
              position: "insideLeft",
              offset: 6,
              style: { fontSize: 11, textAnchor: "middle" }
            }}
            stroke="#31688e"
          />
          <Tooltip
            formatter={(value) => `R$ ${formatNumber(Number(value ?? 0))}`}
            labelFormatter={(value) =>
              tr("psa.tooltipQuantity", { value: formatNumber(Number(value ?? 0)) })
            }
          />
          <Legend
            wrapperStyle={{
              paddingTop: "10px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "13px",
            }}
          />
          <Line
            type="monotone"
            dataKey="supply"
            stroke="#482878"
            strokeWidth={2}
            dot={false}
            name={t.psa.psaSupply}
          />
          <Line
            type="monotone"
            dataKey="demand"
            stroke="#35b779"
            strokeWidth={2}
            dot={false}
            name={t.psa.psaDemand}
          />
          <ReferenceLine
            x={equilibrium.Qstar}
            stroke="#1f9e89"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{ value: t.psa.qStarEquilibrium, position: "top", fill: "#1f9e89", fontSize: 11 }}
          />
          <ReferenceLine
            x={qRegularizacao}
            stroke="#6cce59"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{ value: t.psa.qCra, position: "top", fill: "#6cce59", fontSize: 11 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Resultados numéricos minimizáveis */}
      {(showNumericToggle || resolvedShowNumericResults) && (
        <div>
          {showNumericToggle && (
            <button
              onClick={() => setShowNumericResultsLocal(!showNumericResultsLocal)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label={resolvedShowNumericResults ? t.psa.minimizeNumericResults : t.psa.expandNumericResults}
            >
              <span>{t.psa.numericResults}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {resolvedShowNumericResults ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
            </button>
          )}

          {resolvedShowNumericResults && (
            <div className={`${showNumericToggle ? "mt-2" : "mt-0"} border border-gray-200 overflow-hidden rounded-lg text-xs`}>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-2 py-1.5 bg-gray-50 font-medium text-gray-700">{infoLabel(t.psa.qStarEquilibrium, t.psa.qStarEquilibriumHelp, "left")}</td>
                  <td className="px-2 py-1.5 bg-gray-50 text-gray-900 font-semibold text-right">{formatNumber(equilibrium.Qstar)} ha</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-2 py-1.5 bg-white font-medium text-gray-700">{infoLabel(t.psa.qCra, t.psa.qCraHelp, "right")}</td>
                  <td className="px-2 py-1.5 bg-white text-gray-900 font-semibold text-right">{formatNumber(qRegularizacao)} ha</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-2 py-1.5 bg-gray-50 font-medium text-gray-700">{infoLabel(t.psa.pStar30Years, t.psa.pStar30YearsHelp, "left")}</td>
                  <td className="px-2 py-1.5 bg-gray-50 text-gray-900 font-semibold text-right">R$ {formatNumber(equilibrium.Pstar)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-2 py-1.5 bg-white font-medium text-gray-700">{infoLabel(t.psa.pStarAnnualized, t.psa.pStarAnnualizedHelp, "right")}</td>
                  <td className="px-2 py-1.5 bg-white text-gray-900 font-semibold text-right">R$ {formatNumber(Pstar_anualizado)}{t.common.perYear}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-2 py-1.5 bg-gray-50 font-medium text-gray-700">{infoLabel(t.psa.qPsa, t.psa.qPsaHelp, "left")}</td>
                  <td className="px-2 py-1.5 bg-gray-50 text-gray-900 font-semibold text-right">{formatNumber(Q_PSA)} ha</td>
                  {/* <td className="px-2 py-1.5 bg-white" colSpan={2}></td> */}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-2 py-1.5 bg-gray-50 font-medium text-gray-700">{infoLabel(t.psa.psaRevenue30Years, t.psa.psaRevenue30YearsHelp, "left")}</td>
                  <td className="px-2 py-1.5 bg-gray-50 text-gray-900 font-semibold text-right">R$ {formatNumber(Receita_PSA)}</td>
                </tr>
                <tr >
                  <td className="px-2 py-1.5 bg-white font-medium text-gray-700">{infoLabel(t.psa.psaRevenueAnnualized, t.psa.psaRevenueAnnualizedHelp, "right")}</td>
                  <td className="px-2 py-1.5 bg-white text-gray-900 font-semibold text-right whitespace-nowrap">R$ {formatNumber(Receita_PSA_anualizada)}{t.common.perYear}</td>
                </tr>
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
