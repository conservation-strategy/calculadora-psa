"use client";

import PSAChart from "@/components/Charts/PSAChart";
import PSAPriceSensitivityChart from "@/components/Charts/PSAPriceSensitivityChart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { usePSAControls } from "./usePSAControls";

type PSAPerspectiveProps = {
  controls: ReturnType<typeof usePSAControls>;
};

export default function PSAPerspective({ controls }: PSAPerspectiveProps) {
  const { t, tr, locale } = useTranslation();

  const formatNumber = (value: number) => {
    return value.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const {
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
  } = controls;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">{t.psa.aboutTitle}</h3>
            <p className="text-blue-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t.psa.aboutDescription }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <div className="lg:sticky lg:top-[178px] lg:self-start">
          <div className="bg-white rounded-lg shadow-md p-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{t.page.inputData}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.page.modeInput}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModoPSA("precoCarbono")}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      modoPSA === "precoCarbono"
                        ? "bg-blue-100 text-blue-700 border-blue-300 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {t.page.carbonPrice}
                  </button>
                  <button
                    onClick={() => setModoPSA("valorTerra")}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      modoPSA === "valorTerra"
                        ? "bg-blue-200 text-blue-800 border-blue-400 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {t.page.landValue}
                  </button>
                </div>
              </div>

              {modoPSA === "precoCarbono" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span>
                      {tr("page.carbonPriceValue", {
                        value: precoCarbono.toLocaleString(locale, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }),
                      })}
                    </span>
                  </label>
                  <div className="pt-2 pb-4">
                    <Slider
                      value={[precoCarbono]}
                      onValueChange={(value) => setPrecoCarbono(value[0])}
                      min={10}
                      max={300}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10</span>
                      <span>300</span>
                    </div>
                  </div>
                </div>
              )}

              {modoPSA === "valorTerra" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span>{tr("page.landValueValue", { value: formatNumber(valorTerra) })}</span>
                  </label>
                  <div className="pt-2 pb-4">
                    <Slider
                      value={[valorTerra]}
                      onValueChange={(value) => setValorTerra(value[0])}
                      min={1000}
                      max={50000}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{`R$ ${(1000).toLocaleString(locale, { maximumFractionDigits: 0 })}`}</span>
                      <span>{`R$ ${(50000).toLocaleString(locale, { maximumFractionDigits: 0 })}`}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span>{tr("page.psaTransactionCost", { value: (inputs.custoTransacaoPSA || 0).toFixed(1) })}</span>
                </label>
                <div className="pt-2 pb-4">
                  <Slider
                    value={[inputs.custoTransacaoPSA || 0]}
                    onValueChange={(value) => setCustoTransacaoPSA(value[0])}
                    min={0}
                    max={50}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span>{tr("page.psaBuffer", { value: (inputs.bufferPSA || 0).toFixed(1) })}</span>
                </label>
                <div className="pt-2 pb-4">
                  <Slider
                    value={[inputs.bufferPSA || 0]}
                    onValueChange={(value) => setBufferPSA(value[0])}
                    min={0}
                    max={50}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {tr("page.temporalDiscountRate", { value: inputs.taxaDesconto.toFixed(1) })}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={t.page.temporalDiscountRateInfoAria}
                        className="w-4 h-4 rounded-full border border-gray-400 text-gray-500 text-[10px] leading-none font-semibold hover:bg-gray-100"
                      >
                        i
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 text-xs leading-relaxed">{t.page.temporalDiscountRateInfo}</PopoverContent>
                  </Popover>
                </div>
                <div className="pt-2 pb-4">
                  <Slider
                    value={[inputs.taxaDesconto]}
                    onValueChange={(value) => setTaxaDesconto(value[0])}
                    min={0}
                    max={14}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>14%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.page.includeSmallProperties}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExcluirPequenos(false)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      !excluirPequenos
                        ? "bg-blue-100 text-blue-700 border-blue-300 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {t.page.include}
                  </button>
                  <button
                    onClick={() => setExcluirPequenos(true)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      excluirPequenos
                        ? "bg-orange-100 text-orange-700 border-orange-300 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {t.page.exclude}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`bg-white rounded-lg shadow-md ${mercadoPSAExpanded ? "p-5" : "p-3"}`}>
            <div className={`flex justify-between items-center ${mercadoPSAExpanded ? "mb-6" : "mb-0"}`}>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-800">{t.page.psaMarketByBiome}</h2>
                {mercadoPSAExpanded && (
                  <button
                    onClick={() => setShowPSANumericResults(!showPSANumericResults)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {showPSANumericResults ? t.page.hideNumericResults : t.page.showNumericResults}
                  </button>
                )}
              </div>
              <button
                onClick={() => setMercadoPSAExpanded(!mercadoPSAExpanded)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label={mercadoPSAExpanded ? t.supplyDemand.minimize : t.supplyDemand.expand}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mercadoPSAExpanded ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              </button>
            </div>

            {mercadoPSAExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(["amazonico", "caatinga", "cerrado", "mata_atlantica", "pampa", "pantanal"] as const).map((biome) => (
                  <PSAChart
                    key={biome}
                    biome={biome}
                    modoPSA={modoPSA}
                    precoCarbono={precoCarbono}
                    valorTerra={valorTerra}
                    custoTransacao={inputs.custoTransacaoPSA}
                    bufferPSA={inputs.bufferPSA}
                    excluirPequenos={excluirPequenos}
                    taxaDesconto={inputs.taxaDesconto}
                    compactView
                    showNumericResults={showPSANumericResults}
                    showNumericToggle={false}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6" data-chart="psa-results">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{t.page.aggregatedResults}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 font-medium mb-1">
                  {modoPSA === "precoCarbono" ? t.page.carbonPrice : t.page.landValue}
                </div>
                {modoPSA === "valorTerra" ? (
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {`R$ ${valorTerra.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{t.page.perHectare}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-700 font-medium mb-1">{t.page.annualizedLandValue}</div>
                      <div className="text-lg font-semibold text-gray-900">
                        R$ {valorTerraAnualizado.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">{t.page.perHectarePerYear}</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {`R$ ${precoCarbono.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{t.page.perTco2}</div>
                  </>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 font-medium mb-1">{t.page.totalAreaQstar}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {resultadosPSA.totalQstar.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-gray-600 mt-1">{t.page.hectaresUnit}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 font-medium mb-1 flex items-center gap-1.5">
                  <span>{t.page.potentialPsaRevenue30Years}</span>
                  <span className="relative group inline-flex items-center">
                    <button
                      type="button"
                      aria-label={t.page.psaRevenue30YearsInfoAria}
                      className="w-4 h-4 rounded-full border border-gray-400 text-gray-500 text-[10px] leading-none font-semibold hover:bg-gray-100"
                    >
                      i
                    </button>
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 rounded-md bg-gray-900 text-white text-xs font-normal leading-relaxed p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg">
                      {t.page.psaRevenue30YearsTooltip}
                    </span>
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  R$ {(resultadosPSA.receitaTotal30anos / 1000000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M
                </div>
                <div className="text-xs text-gray-600 mt-1">{t.page.millionReais}</div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 font-medium mb-1">{t.page.potentialPsaRevenueAnnualized}</div>
                <div className="text-2xl font-bold text-gray-900">
                  R$ {(resultadosPSA.receitaAnual / 1000000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M
                </div>
                <div className="text-xs text-gray-600 mt-1">{t.page.millionReaisPerYear}</div>
              </div>
            </div>
          </div>

          <PSAPriceSensitivityChart
            modoPSA={modoPSA}
            precoCarbono={precoCarbono}
            valorTerra={valorTerra}
            custoTransacao={inputs.custoTransacaoPSA}
            bufferPSA={inputs.bufferPSA}
            excluirPequenos={excluirPequenos}
          />
        </div>
      </div>
    </div>
  );
}
