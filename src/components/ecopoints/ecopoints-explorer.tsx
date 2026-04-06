"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  buildOpenStreetMapEmbedUrl,
  buildSchematicPoints,
  filterEcopoints,
  materialLabelMap
} from "@/lib/ecopoints";
import type { Ecopoint, MaterialCatalogItem } from "@/lib/types";

type EcopointsExplorerProps = {
  points: Ecopoint[];
  materials: MaterialCatalogItem[];
};

function getMapCardTitle(point: Ecopoint) {
  if (point.type === "pev") {
    return "Secretaria de Meio Ambiente";
  }

  return point.name.replace(/^Ecoponto\s+/u, "");
}

function EcopointMap({
  points,
  activeIndex,
  onSelect
}: {
  points: Ecopoint[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const activePoint = points[activeIndex];

  const schematicPoints = useMemo(() => buildSchematicPoints(points), [points]);

  if (!activePoint) {
    return (
      <div className="card-surface p-6 text-sm leading-7 text-slate-600">
        Nenhum ponto corresponde aos filtros atuais.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MapFrame
        key={activePoint.id}
        activeIndex={activeIndex}
        activePoint={activePoint}
        points={schematicPoints}
        onSelect={onSelect}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {points.map((point, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={point.id}
              type="button"
              className={`rounded-[24px] border px-4 py-4 text-left shadow-[0_16px_36px_rgba(15,23,42,0.05)] transition md:rounded-[28px] md:px-5 md:py-5 ${
                isActive
                  ? "border-emerald-300 bg-[linear-gradient(180deg,rgba(240,253,244,0.95),rgba(255,255,255,0.98))] ring-1 ring-emerald-200/70"
                  : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80"
              }`}
              onClick={() => onSelect(index)}
            >
              <div className="grid grid-cols-[2.75rem_1fr] items-start gap-3 md:grid-cols-[3rem_1fr] md:gap-4">
                <span
                  className={`inline-flex h-12 w-10 items-center justify-center rounded-[16px] text-base font-extrabold tracking-tight shadow-sm md:h-14 md:w-11 md:rounded-[18px] md:text-lg ${
                    isActive
                      ? "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="space-y-2">
                  <p className="font-display text-xl font-semibold leading-[1.12] text-balance text-slate-950 md:text-2xl md:leading-[1.15]">
                    <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500 md:text-[0.7rem]">
                      Ponto {index + 1}
                    </span>
                    <span>{getMapCardTitle(point)}</span>
                  </p>
                  <p className="text-base leading-7 text-pretty text-slate-600 md:text-[1.08rem] md:leading-8">{point.address}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MapFrame({
  activeIndex,
  activePoint,
  points,
  onSelect
}: {
  activeIndex: number;
  activePoint: Ecopoint;
  points: Array<Ecopoint & { markerX: number; markerY: number }>;
  onSelect: (index: number) => void;
}) {
  const [showFallback, setShowFallback] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setShowFallback(true);
    }, 4500);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!showFallback) {
    return (
      <div className="card-surface overflow-hidden">
        <iframe
          src={buildOpenStreetMapEmbedUrl(activePoint)}
          title={`Mapa real de ${activePoint.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[280px] w-full border-0 md:h-[380px]"
          onLoad={() => {
            if (timerRef.current) {
              window.clearTimeout(timerRef.current);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="card-surface map-grid relative h-[280px] overflow-hidden p-5 md:h-[380px] md:p-6">
      {points.map((point, index) => (
        <button
          key={point.id}
          type="button"
          className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-sm font-extrabold text-white shadow-lg ${
            activeIndex === index ? "bg-emerald-600" : "bg-slate-800"
          }`}
          style={{
            left: `${point.markerX}%`,
            top: `${point.markerY}%`
          }}
          onClick={() => onSelect(index)}
          aria-label={`Selecionar ${point.name}`}
        >
          {index + 1}
        </button>
      ))}

      <div className="absolute inset-x-5 bottom-5 rounded-[24px] bg-white/92 p-4 shadow-lg backdrop-blur md:inset-x-6 md:bottom-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Mapa de reserva</p>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          O mapa real não respondeu a tempo. A visualização esquemática continua mostrando a posição relativa dos
          pontos visíveis.
        </p>
      </div>
    </div>
  );
}

export function EcopointsExplorer({ points, materials }: EcopointsExplorerProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | Ecopoint["type"]>("all");
  const [material, setMaterial] = useState("all");
  const [selectedPointId, setSelectedPointId] = useState(points[0]?.id ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(true);
  const deferredQuery = useDeferredValue(query);
  const materialLookup = useMemo(() => materialLabelMap(materials), [materials]);

  const filteredPoints = useMemo(
    () =>
      filterEcopoints(points, {
        query: deferredQuery,
        type,
        material
      }),
    [deferredQuery, material, points, type]
  );

  const activeMaterialLabel = material === "all" ? "" : materialLookup.get(material) || "";
  const activeIndex = Math.max(
    0,
    filteredPoints.findIndex((point) => point.id === selectedPointId)
  );
  const activeFiltersCount = Number(query.trim().length > 0) + Number(type !== "all") + Number(material !== "all");
  const filterSummary =
    activeFiltersCount > 0
      ? `${activeFiltersCount} filtro${activeFiltersCount > 1 ? "s" : ""} ativo${activeFiltersCount > 1 ? "s" : ""}`
      : "Busca, tipo e material";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="section-panel min-w-0 space-y-5 px-4 py-4 md:space-y-6 md:px-6 md:py-5">
        <div className="md:hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white/92 px-4 py-3 text-left shadow-sm"
            aria-expanded={mobileFiltersOpen}
            aria-controls="ecopoints-mobile-filters"
            onClick={() => setMobileFiltersOpen((current) => !current)}
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-950">Filtros e materiais</p>
              <p className="text-xs font-medium text-slate-500">{filterSummary}</p>
            </div>
            <span className="text-lg font-semibold text-slate-500" aria-hidden="true">
              {mobileFiltersOpen ? "−" : "+"}
            </span>
          </button>
        </div>

        <div id="ecopoints-mobile-filters" className={`${mobileFiltersOpen ? "block" : "hidden"} space-y-5 md:block`}>
          <div className="grid gap-4 md:grid-cols-[1.5fr_0.9fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Buscar por endereço, bairro ou material</span>
              <input
                type="search"
                name="search"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => setQuery(nextValue));
                }}
                placeholder="Ex.: bateria, Fundadores, Aviacao…"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-300"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Tipo de ponto</span>
              <select
                name="pointType"
                value={type}
                onChange={(event) => setType(event.target.value as "all" | Ecopoint["type"])}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-300"
              >
                <option value="all">Todos os pontos</option>
                <option value="ecoponto">Somente ecopontos</option>
                <option value="pev">Somente PEV</option>
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Filtrar por material aceito</p>
            <div className="chip-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              <button
                type="button"
                onClick={() => setMaterial("all")}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                  material === "all"
                    ? "bg-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,0.22)]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Todos os materiais
              </button>
              {materials.map((item) => {
                const active = material === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMaterial(item.key)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                      active
                        ? "bg-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,0.22)]"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="px-1 text-xs font-medium text-slate-500 md:hidden">Deslize para ver mais materiais.</p>
          </div>
        </div>

        <p className="rounded-[24px] bg-slate-950 px-4 py-3 text-sm font-medium text-white">
          {filteredPoints.length === 0
            ? activeMaterialLabel
              ? `Nenhum ponto corresponde aos filtros atuais para ${activeMaterialLabel.toLowerCase()}.`
              : "Nenhum ponto corresponde aos filtros atuais. Tente outro termo ou escolha outro tipo."
            : filteredPoints.length === points.length
              ? activeMaterialLabel
                ? `${filteredPoints.length} pontos aceitam ${activeMaterialLabel.toLowerCase()} em Araçatuba-SP.`
                : `${filteredPoints.length} pontos disponíveis para descarte em Araçatuba-SP.`
              : activeMaterialLabel
                ? `${filteredPoints.length} de ${points.length} pontos correspondem aos filtros para ${activeMaterialLabel.toLowerCase()}.`
                : `${filteredPoints.length} de ${points.length} pontos correspondem aos filtros atuais.`}
        </p>
      </div>

      <aside className="min-w-0 space-y-5 xl:row-span-2">
        <div className="section-panel space-y-3 px-5 py-5 md:px-6">
          <p className="section-label">Mapa interativo</p>
          <h3 className="font-display text-[1.8rem] font-semibold leading-[1.05] text-balance text-slate-950 md:text-3xl">Mapa real com reserva esquemática</h3>
          <p className="text-sm leading-7 text-pretty text-slate-600">
            O painel abre um mapa real do ponto selecionado. Se a visualização externa falhar, o site mostra um mapa
            simplificado para manter a apresentação funcionando.
          </p>
        </div>

        <EcopointMap
          points={filteredPoints}
          activeIndex={Math.min(activeIndex, Math.max(filteredPoints.length - 1, 0))}
          onSelect={(index) => {
            const nextPoint = filteredPoints[index];

            if (nextPoint) {
              setSelectedPointId(nextPoint.id);
            }
          }}
        />
      </aside>

      <div className="min-w-0 grid gap-4 xl:col-start-1">
        {filteredPoints.map((point) => {
          const labels = point.materialKeys.map((key) => materialLookup.get(key) || key);

          return (
            <article key={point.id} className="card-surface content-auto min-w-0 p-5 md:p-6">
              <div className="flex min-w-0 flex-col gap-5 md:flex-row md:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                      {point.type === "pev" ? "PEV" : "Ecoponto"}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
                      Araçatuba-SP
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold leading-[1.08] text-balance text-slate-950 md:text-2xl">{point.name}</h3>
                  <p className="text-sm leading-7 text-pretty text-slate-600">{point.address}</p>
                  <p className="text-sm font-semibold text-emerald-700">{point.hours}</p>
                </div>

                <div className="min-w-0 flex flex-wrap items-start gap-2 md:max-w-sm md:justify-end">
                  {labels.map((label) => (
                    <span
                      key={`${point.id}-${label}`}
                      className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 min-w-0 flex flex-wrap gap-3">
                <a
                  href={point.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary w-full sm:w-auto"
                >
                  Abrir localização
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
