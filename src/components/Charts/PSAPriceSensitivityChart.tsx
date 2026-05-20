"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { calculateAllPSAEquilibria } from "@/lib/econ/psa";
import { CARBON_DENSITY } from "./PSAChart";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface PSAPriceSensitivityChartProps {
  modoPSA: "precoCarbono" | "valorTerra";
  precoCarbono: number;
  valorTerra: number;
  custoTransacao: number;
  bufferPSA: number;
  excluirPequenos: boolean;
}

export default function PSAPriceSensitivityChart({ 
  modoPSA,
  precoCarbono,
  valorTerra,
  custoTransacao, 
  bufferPSA,
  excluirPequenos 
}: PSAPriceSensitivityChartProps) {
  const { t, tr, locale } = useTranslation();
  
  const chartData = useMemo(() => {
    const data = [];
    
    if (modoPSA === "precoCarbono") {
      // Modo padrão: variar preço do carbono de 0 a 300 R$/tCO2
      for (let preco = 0; preco <= 300; preco += 10) {
        const equilibria = calculateAllPSAEquilibria(
          "precoCarbono",
          preco,
          0, // valorTerra não usado neste modo
          CARBON_DENSITY,
          custoTransacao,
          bufferPSA,
          excluirPequenos
        );
        
        // Somar Q* de todos os biomas
        const totalQstar = Object.values(equilibria).reduce((sum, eq) => sum + eq.Qstar, 0);
        
        data.push({
          preco,
          qstar: totalQstar,
        });
      }
    } else {
      // Modo alternativo: variar valor da terra de 0 a 300k R$/ha
      for (let valor = 0; valor <= 300000; valor += 10000) {
        const equilibria = calculateAllPSAEquilibria(
          "valorTerra",
          0, // precoCarbono não usado neste modo
          valor,
          CARBON_DENSITY,
          custoTransacao,
          bufferPSA,
          excluirPequenos
        );
        
        // Somar Q* de todos os biomas
        const totalQstar = Object.values(equilibria).reduce((sum, eq) => sum + eq.Qstar, 0);
        
        data.push({
          preco: valor,
          qstar: totalQstar,
        });
      }
    }
    
    // Ordenar os dados por quantidade (qstar) para garantir curva correta no gráfico invertido
    data.sort((a, b) => a.qstar - b.qstar);
    
    // Filtrar dados para mostrar apenas até 100k R$/ha quando modo for valorTerra
    if (modoPSA === "valorTerra") {
      return data.filter(d => d.preco <= 100000);
    }
    
    return data;
  }, [modoPSA, precoCarbono, valorTerra, custoTransacao, bufferPSA, excluirPequenos]);

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };
  
  const yAxisLabel = modoPSA === "precoCarbono" 
    ? t.psa.carbonPriceLabel
    : t.psa.landValueLabel;
    
  const tooltipLabel = modoPSA === "precoCarbono"
    ? t.psa.carbonPrice
    : t.psa.landValue;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {tr("psa.totalAreaSensitivityTitle", { label: tooltipLabel })}
      </h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 70, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4dde9" />
          
          <XAxis
            type="number"
            dataKey="qstar"
            domain={[0, 'auto']}
            label={{
              value: t.psa.totalAreaQstarHectares,
              position: "insideBottom",
              offset: -10,
              style: { fontSize: 14, fontWeight: 500 }
            }}
            tick={{ fontSize: 12 }}
            tickFormatter={formatNumber}
          />
          
          <YAxis
            domain={modoPSA === "valorTerra" ? [0, 100000] : [0, 'auto']}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fontSize: 14, fontWeight: 500, textAnchor: "middle" }
            }}
            tick={{ fontSize: 12 }}
            tickFormatter={modoPSA === "valorTerra" ? formatNumber : undefined}
          />
          
          <Tooltip
            formatter={(value) => [
              (() => {
                const numericValue = Number(value ?? 0);
                return modoPSA === "precoCarbono"
                  ? "R$ " +
                      numericValue.toLocaleString(locale, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }) +
                      "/tCO2"
                  : "R$ " + formatNumber(numericValue) + "/ha";
              })(),
              tooltipLabel
            ]}
            labelFormatter={(label) =>
              tr("psa.tooltipQuantity", { value: formatNumber(Number(label ?? 0)) })
            }
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #86c8b3",
              borderRadius: "4px",
              padding: "10px"
            }}
          />
          
          <Legend
            verticalAlign="top"
            height={36}
            iconType="line"
            formatter={() => t.psa.totalAreaPotentialLegend}
          />
          
          <Line
            type="monotone"
            dataKey="preco"
            stroke="#31688e"
            strokeWidth={2}
            dot={{ fill: "#31688e", r: 3 }}
            activeDot={{ r: 5 }}
            name={tooltipLabel}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <p className="text-sm text-gray-600 mt-4">
        {t.psa.sensitivityDescriptionPrefix}
        {modoPSA === "precoCarbono" 
          ? t.psa.sensitivityDescriptionCarbon
          : t.psa.sensitivityDescriptionLand
        }
      </p>
    </div>
  );
}
