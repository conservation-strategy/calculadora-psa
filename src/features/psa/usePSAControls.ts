"use client";

import { useMemo, useState } from "react";
import { useSimStore } from "@/lib/state/simStore";
import { calculateAllPSAEquilibria } from "@/lib/econ/psa";
import { calculatePMT } from "@/lib/econ/financial";
import { CARBON_DENSITY } from "@/components/Charts/PSAChart";

export type ModoPSA = "precoCarbono" | "valorTerra";

export function usePSAControls() {
  const inputs = useSimStore((state) => state.inputs);
  const setTaxaDesconto = useSimStore((state) => state.setTaxaDesconto);
  const setCustoTransacaoPSA = useSimStore((state) => state.setCustoTransacaoPSA);
  const setBufferPSA = useSimStore((state) => state.setBufferPSA);

  const [modoPSA, setModoPSA] = useState<ModoPSA>("precoCarbono");
  const [precoCarbono, setPrecoCarbono] = useState(50);
  const [valorTerra, setValorTerra] = useState(12000);
  const [excluirPequenos, setExcluirPequenos] = useState(false);
  const [mercadoPSAExpanded, setMercadoPSAExpanded] = useState(true);
  const [showPSANumericResults, setShowPSANumericResults] = useState(false);

  const resultadosPSA = useMemo(() => {
    const equilibria = calculateAllPSAEquilibria(
      modoPSA,
      precoCarbono,
      valorTerra,
      CARBON_DENSITY,
      inputs.custoTransacaoPSA,
      inputs.bufferPSA,
      excluirPequenos
    );

    const totalQstar = Object.values(equilibria).reduce((sum, eq) => sum + eq.Qstar, 0);

    const receitaTotal30anos = Object.entries(equilibria).reduce((sum, [biome, eq]) => {
      const carbonDensity = CARBON_DENSITY[biome as keyof typeof CARBON_DENSITY];
      const precoCarbonoEfetivo = modoPSA === "precoCarbono" ? precoCarbono : valorTerra / carbonDensity;
      return sum + eq.Qstar * precoCarbonoEfetivo * carbonDensity;
    }, 0);

    const taxaDesconto = (inputs.taxaDesconto || 10) / 100;
    const receitaAnual = calculatePMT(receitaTotal30anos, taxaDesconto, 30);

    return {
      totalQstar,
      receitaTotal30anos,
      receitaAnual,
    };
  }, [
    modoPSA,
    precoCarbono,
    valorTerra,
    inputs.custoTransacaoPSA,
    inputs.bufferPSA,
    inputs.taxaDesconto,
    excluirPequenos,
  ]);

  const valorTerraAnualizado = useMemo(() => {
    const taxaDesconto = (inputs.taxaDesconto || 10) / 100;
    return calculatePMT(valorTerra, taxaDesconto, 30);
  }, [valorTerra, inputs.taxaDesconto]);

  return {
    inputs,
    modoPSA,
    setModoPSA,
    precoCarbono,
    setPrecoCarbono,
    valorTerra,
    setValorTerra,
    excluirPequenos,
    setExcluirPequenos,
    mercadoPSAExpanded,
    setMercadoPSAExpanded,
    showPSANumericResults,
    setShowPSANumericResults,
    setTaxaDesconto,
    setCustoTransacaoPSA,
    setBufferPSA,
    resultadosPSA,
    valorTerraAnualizado,
  };
}
