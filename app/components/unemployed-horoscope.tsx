const signs = ["Ovan", "Bik", "Blizanci", "Rak", "Lav", "Djevica", "Vaga", "Škorpion", "Strijelac", "Jarac", "Vodenjak", "Ribe"];
const forecasts = [
  "Merkur je u retrogradnom, a vi u pidžami. Danas ništa ne potpisujte prije druge kave.",
  "Zvijezde savjetuju da osvježite životopis. Ako se ne javi nitko, barem ste osvježili stranicu.",
  "Moguća je neočekivana poslovna prilika: netko će vas pitati možete li pomoći s printerom.",
  "Vaša produktivnost raste čim zatvorite karticu s oglasom za posao. Iskoristite taj kratki trenutak.",
  "Povoljan dan za razgovor. Posebno onaj u kojem sami sebi objasnite da se prijava računa kao rad.",
];

function dayKey() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zagreb", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default function UnemployedHoroscope() {
  const today = dayKey();
  return <section id="horoskop" className="min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-[#F5F6F7] p-4 sm:p-7" aria-labelledby="horoscope-title">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Dnevni pregled</p>
    <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><h2 id="horoscope-title" className="text-2xl font-black tracking-tight text-[#17243A] sm:text-3xl">Horoskop nezaposlenih</h2><time className="text-sm font-semibold text-slate-500">{today}</time></div>
    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{signs.map((sign) => {
      const seed = Array.from(`${today}:${sign}`).reduce((sum, character) => sum + character.charCodeAt(0), 0);
      return <article key={sign} className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="font-extrabold text-[#17243A]">{sign}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{forecasts[seed % forecasts.length]}</p></article>;
    })}</div>
  </section>;
}
