import history from "../data/unemployment-history.json";

const width = 760;
const height = 300;
const padding = { top: 18, right: 18, bottom: 38, left: 70 };
const min = 0;
const max = 360000;
const plotWidth = width - padding.left - padding.right;
const plotHeight = height - padding.top - padding.bottom;
const x = (index: number) => padding.left + (index / (history.length - 1)) * plotWidth;
const y = (value: number) => padding.top + ((max - value) / (max - min)) * plotHeight;
const points = history.map((point, index) => `${x(index)},${y(point.total)}`).join(" ");
const formatNumber = (value: number) => new Intl.NumberFormat("hr-HR").format(value);
const yearsToLabel = new Set([2004, 2008, 2012, 2016, 2020, 2024, 2026]);

export default function UnemploymentHistoryChart() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="employment-chart-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Ekonomija · statistika</p>
          <h2 id="employment-chart-title" className="mt-2 text-2xl font-black tracking-tight text-[#17243A] sm:text-3xl">Nezaposlenost kroz godine</h2>
          <p className="mt-1 text-sm text-slate-500">Prosječan broj registriranih nezaposlenih · 2004.–2026.</p>
        </div>
        <p className="text-right text-sm font-bold text-[#17243A]">2026. <span className="text-xl">{formatNumber(history.at(-1)!.total)}</span></p>
      </div>
      <div className="mt-5 overflow-x-auto">
        <svg className="h-auto min-w-[600px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="employment-chart-title employment-chart-description">
          <desc id="employment-chart-description">Linijski graf prosječnog broja nezaposlenih u Hrvatskoj od 2004. do 2026. godine.</desc>
          {[0, 100000, 200000, 300000].map((tick) => (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" strokeDasharray="4 5" />
              <text x={padding.left - 10} y={y(tick) + 4} textAnchor="end" className="fill-slate-500" fontSize="11">{tick === 0 ? "0" : `${tick / 1000}k`}</text>
            </g>
          ))}
          <polyline points={points} fill="none" stroke="#E63946" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          {history.map((point, index) => (
            <g key={point.year}>
              <circle cx={x(index)} cy={y(point.total)} r="4" fill="#fff" stroke="#E63946" strokeWidth="2.5">
                <title>{`${point.year}: ${formatNumber(point.total)}`}</title>
              </circle>
              {yearsToLabel.has(point.year) && <text x={x(index)} y={height - 12} textAnchor="middle" className="fill-slate-500" fontSize="11">{point.year}</text>}
            </g>
          ))}
        </svg>
      </div>
      <details className="mt-3 text-sm text-slate-600">
        <summary className="cursor-pointer font-semibold text-[#17243A]">Prikaži godišnje vrijednosti</summary>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
          {history.map((point) => <p key={point.year}>{point.year}: <span className="font-semibold">{formatNumber(point.total)}</span></p>)}
        </div>
      </details>
      <p className="mt-4 text-xs leading-5 text-slate-500">Izvor: red „Ukupno” u priloženoj datoteci statistika.xls. Odgovarajuća serija HZZ-a prikazuje godišnji prosjek registriranih nezaposlenih; vrijednost za 2026. je dosad ostvareni prosjek. <a className="font-semibold underline decoration-slate-300 underline-offset-2 hover:text-[#17243A]" href="https://statistika.hzz.hr/Statistika.aspx?tipIzvjestaja=3%2C" target="_blank" rel="noopener noreferrer">HZZ Statistika On‑Line ↗</a></p>
    </section>
  );
}
