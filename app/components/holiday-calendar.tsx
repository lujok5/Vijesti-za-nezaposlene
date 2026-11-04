type Holiday = { date: string; name: string };
const calendars: Record<string, { city: string; country: string; source: string; holidays: Holiday[] }> = {
  HR: { city: "Zagreb", country: "Hrvatska", source: "https://narodne-novine.nn.hr/clanci/sluzbeni/2019_11_110_2212.html", holidays: [
    { date: "2026-11-18", name: "Dan sjećanja na žrtve Domovinskog rata" }, { date: "2026-12-25", name: "Božić" }, { date: "2026-12-26", name: "Sveti Stjepan" },
    { date: "2027-01-01", name: "Nova godina" }, { date: "2027-01-06", name: "Sveta tri kralja" }, { date: "2027-03-28", name: "Uskrs" }, { date: "2027-03-29", name: "Uskrsni ponedjeljak" },
    { date: "2027-05-01", name: "Praznik rada" }, { date: "2027-05-27", name: "Tijelovo" }, { date: "2027-05-30", name: "Dan državnosti" }, { date: "2027-06-22", name: "Dan antifašističke borbe" },
    { date: "2027-08-05", name: "Dan pobjede i domovinske zahvalnosti" }, { date: "2027-08-15", name: "Velika Gospa" }, { date: "2027-11-01", name: "Svi sveti" }, { date: "2027-11-18", name: "Dan sjećanja" },
    { date: "2027-12-25", name: "Božić" }, { date: "2027-12-26", name: "Sveti Stjepan" },
  ] },
  RS: { city: "Beograd", country: "Srbija", source: "https://nbs.rs/sr/o_nbs/radno-vreme-i-neradni-dani/", holidays: [
    { date: "2026-11-11", name: "Dan primirja u Prvom svetskom ratu" }, { date: "2027-01-01", name: "Nova godina" }, { date: "2027-01-02", name: "Drugi dan Nove godine" },
    { date: "2027-01-07", name: "Prvi dan Božića" }, { date: "2027-02-15", name: "Sretenje – Dan državnosti" }, { date: "2027-02-16", name: "Drugi dan Sretenja" },
    { date: "2027-04-30", name: "Veliki petak" }, { date: "2027-05-01", name: "Vaskršnji praznici i Praznik rada" }, { date: "2027-05-02", name: "Vaskrs i Praznik rada" },
    { date: "2027-05-03", name: "Drugi dan Vaskrsa" }, { date: "2027-05-04", name: "Preneti neradni dan za Praznik rada" }, { date: "2027-11-11", name: "Dan primirja u Prvom svetskom ratu" },
  ] },
};

function todayUtc() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  return Date.UTC(Number(get("year")), Number(get("month")) - 1, Number(get("day")));
}

function daysUntil(date: string) {
  return Math.max(0, Math.round((Date.parse(`${date}T00:00:00Z`) - todayUtc()) / 86400000));
}

function formattedDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("hr-HR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function HolidayCalendar() {
  const today = todayUtc();
  return <section id="kalendar" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="holiday-calendar-title">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Planiranje sljedeće pauze</p>
    <h2 id="holiday-calendar-title" className="mt-2 text-2xl font-black tracking-tight text-[#17243A] sm:text-3xl">Kalendar neradnih dana</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{Object.entries(calendars).map(([code, calendar]) => {
      const upcoming = calendar.holidays.filter((holiday) => Date.parse(`${holiday.date}T00:00:00Z`) >= today).slice(0, 4);
      return <article key={code} className="rounded-xl border border-slate-200 bg-[#F5F6F7] p-5"><h3 className="text-lg font-extrabold text-[#17243A]">{calendar.city} · {calendar.country}</h3>
        {upcoming.length ? <ol className="mt-3 space-y-3">{upcoming.map((holiday) => <li key={holiday.date} className="flex items-start justify-between gap-3 border-t border-slate-200 pt-3"><span><span className="block text-sm font-bold text-[#17243A]">{holiday.name}</span><time className="mt-1 block text-xs text-slate-500">{formattedDate(holiday.date)}</time></span><span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-red-700">{daysUntil(holiday.date)} d</span></li>)}</ol> : <p className="mt-3 text-sm text-slate-600">Nema upisanih budućih datuma.</p>}
        <a href={calendar.source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-[#17243A]">Službeni izvor ↗</a>
      </article>;
    })}</div>
    <p className="mt-4 text-xs leading-5 text-slate-500">Hrvatski datumi prema Zakonu o blagdanima. Za Srbiju je izvorni raspored za 2026. službeno objavila Narodna banka Srbije; datumi za 2027. izračunati su prema zakonskim pravilima i mogu dobiti službenu potvrdu godišnjim rasporedom.</p>
  </section>;
}
