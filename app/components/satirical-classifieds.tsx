const listings = [
  { role: "Tester algoritama", detail: "Gledanje istog videa 47 puta i zaključak: algoritam je kriv.", hours: "8 h dnevno" },
  { role: "Direktor pauze", detail: "Tražimo osobu s iskustvom u odgađanju obaveza.", hours: "Fleksibilno" },
  { role: "Stručnjak za ‘krećem od ponedjeljka’", detail: "Napredno poznavanje ponedjeljaka svih godišnjih doba.", hours: "Od ponedjeljka" },
];

export default function SatiricalClassifieds() {
  return <section id="oglasnik" className="min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7" aria-labelledby="classifieds-title">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Oglasi i prilike</p>
    <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><h2 id="classifieds-title" className="text-2xl font-black tracking-tight text-[#17243A] sm:text-3xl">Oglasnik za nezaposlene</h2></div>
    <div className="mt-5 grid gap-3 md:grid-cols-3">{listings.map((listing) => <article key={listing.role} className="rounded-xl border border-slate-200 bg-[#F5F6F7] p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{listing.hours}</p><h3 className="mt-2 text-lg font-extrabold text-[#17243A]">{listing.role}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{listing.detail}</p><p className="mt-4 text-xs font-black uppercase tracking-wider text-red-600">Plaća: iskustvo i vidljivost</p></article>)}</div>
  </section>;
}
