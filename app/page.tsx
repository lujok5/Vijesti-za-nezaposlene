import CityWeather from "./components/city-weather";
import UnemploymentHistoryChart from "./components/unemployment-history-chart";
import SatiricalClassifieds from "./components/satirical-classifieds";
import UnemployedHoroscope from "./components/unemployed-horoscope";
import HolidayCalendar from "./components/holiday-calendar";
import { Article, categorySlug, formatDate, loadNews } from "./lib/news";

function excerpt(text: string | undefined, limit: number) {
  const compact = (text ?? "").replace(/\s+/g, " ").trim();
  return compact.length > limit ? `${compact.slice(0, limit).trimEnd()}…` : compact;
}


export const dynamic = "force-dynamic";

export default async function Page() {
  const items = (await loadNews()).map((item) => ({
    ...item,
    title: item.title ?? item.naslov ?? "",
    body: item.body ?? item.tekst ?? "",
    category: item.category ?? item.kategorija ?? "",
  }));
  const mediaItems = items.filter((item) => item.is_automated === true);
  const editorialItems = items.filter((item) => item.is_automated !== true);
  const featured: Article = editorialItems.find((item) => item.is_featured) ?? editorialItems[0] ?? {
    influencer: "Vijesti za nezaposlene",
    title: "Čekamo prve provjerene vijesti",
    body: "Ovdje će se prikazivati stvarne vijesti iz medija s poveznicom na izvor.",
    category: "Automatsko praćenje",
  };
  const secondaryItems = editorialItems.filter((item) => item.id !== featured.id).slice(0, 3);
  const homepageLeadKeys = new Set([featured, ...secondaryItems].map((item) => item.id ?? item.title));
  const categories = Array.from(new Set(editorialItems.map((item) => item.category).filter(Boolean)));
  const navLinks: { label: string; href: string; active?: boolean }[] = [
    { label: "Naslovnica", href: "#naslovnica", active: true },
    { label: "Breaking News", href: "/rubrika/breaking-news" },
    { label: "Najnovije", href: "#najnovije" },
    { label: "Lifestyle", href: "/rubrika/lifestyle" },
    { label: "Digitalci", href: "#digitalci" },
    { label: "Ekskluzivno", href: "/rubrika/ekskluzivno" },
    { label: "Crna kronika", href: "/rubrika/crna-kronika" },
    { label: "Ekonomija", href: "#statistika" },
    { label: "Burza", href: "/rubrika/burza" },
    { label: "Statistika", href: "#statistika" },
    { label: "Kalkulator nerada", href: "/nerad#kalkulator-nerada" },
    { label: "Generator izgovora", href: "/nerad#generator-izgovora" },
    { label: "Prognoza", href: "#prognoza" },
    { label: "Oglasnik", href: "#oglasnik" },
    { label: "Horoskop", href: "#horoskop" },
    { label: "Kalendar", href: "#kalendar" },
    { label: "Arhiva", href: "/arhiva" },
  ];
  const fixedCategorySlugs = new Set(navLinks.map((link) => categorySlug(link.label)));
  for (const category of categories) {
    if (!fixedCategorySlugs.has(categorySlug(category))) navLinks.splice(3, 0, { label: category, href: `#rubrika-${categorySlug(category)}` });
  }
  const primaryNavLabels = new Set(["Naslovnica", "Breaking News", "Najnovije", "Digitalci", "Statistika", "Kalkulator nerada", "Generator izgovora"]);
  const primaryNavLinks = navLinks.filter((link) => primaryNavLabels.has(link.label));
  const creators = Array.from(new Set(items.map((item) => item.influencer).filter((name) => name && name !== "Uredništvo")));
  const firstByCategory = new Map<string, string>();
  for (const item of editorialItems) if (item.id && item.category && !firstByCategory.has(item.category)) firstByCategory.set(item.category, item.id);
  const tickerItems = editorialItems.slice(0, 8);
  const mondayUtc = new Date();
  mondayUtc.setUTCHours(0, 0, 0, 0);
  const daysSinceMonday = (mondayUtc.getUTCDay() + 6) % 7;
  mondayUtc.setUTCDate(mondayUtc.getUTCDate() - daysSinceMonday);
  const weekCount = items.filter((item) => new Date(item.created_at ?? item.published_at ?? 0) >= mondayUtc).length;

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-white font-sans text-[#17243A]">
      <header className="border-b border-[#17243A] bg-[#17243A] px-3 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <a href="/" aria-label="Naslovnica" className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white sm:h-14 sm:w-14"><img src="/logo-vijesti.png" alt="" className="h-full w-full object-cover" /></a>
          <a href="/" className="min-w-0 flex-1 truncate text-base font-black tracking-tight text-white sm:text-3xl">VIJESTI ZA NEZAPOSLENE</a>
          <span className="ml-auto hidden items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />Uživo iz redakcije</span>
        </div>
      </header>

      <section aria-label="Najnovije vijesti" className="overflow-hidden border-b border-slate-200 bg-[#F5F6F7]">
        <div className="mx-auto flex max-w-[1440px] items-stretch">
          <span className="z-10 flex shrink-0 items-center gap-2 bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />Uživo</span>
          <div className="ticker-window min-w-0 flex-1 py-3">
            {tickerItems.length > 0 ? <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap">{[...tickerItems, ...tickerItems].map((item, index) => <a key={`${item.id ?? item.title}-${index}`} href={item.id ? `/vijest/${item.id}` : "#najnovije"} className="text-sm font-semibold text-[#17243A] hover:text-red-600"><span className="mr-3 text-red-500">●</span>{item.title}</a>)}</div> : <p className="px-5 text-sm text-slate-500">Najnovije vijesti uskoro stižu.</p>}
          </div>
        </div>
      </section>

      <nav aria-label="Rubrike" className="z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:sticky lg:top-0">
        <details className="mobile-rubric-menu px-4 py-2 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-wide text-[#17243A]">Rubrike <span className="text-red-600">＋</span></summary>
          <div className="grid grid-cols-2 gap-2 pb-2 pt-3">
            {navLinks.map((link) => <a key={link.label} className={`rounded-lg border px-3 py-3 text-center text-xs font-bold uppercase tracking-wide ${link.active ? "border-red-600 bg-red-600 text-white" : "border-slate-200 bg-white text-[#17243A] hover:border-red-500"}`} href={link.href}>{link.label}</a>)}
          </div>
        </details>
        <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-2 px-6 py-2 lg:flex">
          {primaryNavLinks.map((link) => <a key={link.label} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${link.active ? "border-red-600 bg-red-600 text-white" : "border-slate-300 bg-white text-[#17243A] hover:border-red-500 hover:text-red-700"}`} href={link.href}>{link.label}</a>)}
          <details className="desktop-sections-menu relative shrink-0">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#17243A] transition-colors hover:border-red-500 hover:text-red-700">Sve sekcije <span className="text-red-600">⌄</span></summary>
            <div className="absolute right-0 top-full z-30 mt-2 w-[min(90vw,420px)] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">Odaberite rubriku</p>
              <div className="grid grid-cols-2 gap-2">{navLinks.map((link) => <a key={link.label} className="rounded-lg border border-slate-100 px-3 py-2.5 text-xs font-bold text-[#17243A] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700" href={link.href}>{link.label}</a>)}</div>
            </div>
          </details>
        </div>
      </nav>

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 py-7 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.8fr)]">
        <div className="min-w-0">
          {editorialItems.length > 0 ? <section id="naslovnica" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {featured.id && firstByCategory.get(featured.category) === featured.id && <span id={`rubrika-${categorySlug(featured.category)}`} className="block scroll-mt-28" aria-hidden="true" />}
            <div className="p-5 sm:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider"><span className="rounded bg-red-600 px-3 py-1.5 text-white">{featured.category}</span><time className="text-slate-600">{formatDate(featured.published_at ?? featured.created_at)}</time>{featured.source_name && <span className="text-slate-600">{(featured.source_count ?? 1) > 1 ? `Izvještava ${featured.source_count} izvora` : `Izvor: ${featured.source_name}`}</span>}</div>
              {featured.id ? <a href={`/vijest/${featured.id}`}><h1 className="mb-5 max-w-5xl break-words text-4xl font-black leading-[1.05] tracking-tight text-[#17243A] hover:text-red-600 sm:text-5xl md:text-6xl">{featured.title}</h1></a> : <h1 className="mb-5 max-w-5xl break-words text-4xl font-black leading-[1.05] tracking-tight text-[#17243A] sm:text-5xl md:text-6xl">{featured.title}</h1>}
            </div>
            <div className="relative flex min-h-48 w-full items-center justify-center overflow-hidden bg-slate-100 sm:min-h-72">
              {featured.image_url ? (featured.id ? <a href={`/vijest/${featured.id}`} className="flex max-h-[70vh] w-full items-center justify-center"><img src={featured.image_url} alt={featured.title} className="max-h-[70vh] w-full object-contain" /></a> : <img src={featured.image_url} alt={featured.title} className="max-h-[70vh] w-full object-contain" />) : <div className="flex min-h-48 w-full items-center justify-center bg-[#F5F6F7] p-8 text-center sm:min-h-72"><span className="text-xl font-black uppercase tracking-[0.25em] text-[#17243A]/25">{featured.category}</span></div>}
            </div>
            <div className="p-5 sm:p-8">
              <p className="mb-5 max-w-4xl text-base leading-7 text-slate-600 sm:text-lg">{excerpt(featured.body, 260)}</p>
              <div className="flex flex-wrap items-center gap-3">{featured.id && <a href={`/vijest/${featured.id}`} className="rounded bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500">PROČITAJ CIJELU VIJEST →</a>}{featured.source_url && <a href={featured.source_url} target="_blank" rel="noopener noreferrer" className="rounded border border-slate-300 px-5 py-3 text-sm font-bold text-[#17243A] hover:border-red-500">IZVOR ↗</a>}</div>
            </div>
          </section> : <section id="naslovnica" className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><h1 className="text-3xl font-black text-[#17243A]">Vijesti za nezaposlene</h1><p className="mt-3 text-slate-600">Nove urednički pripremljene vijesti uskoro stižu.</p></section>}

          {secondaryItems.length > 0 && <section aria-label="Još važne vijesti" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {secondaryItems.map((item) => <article id={firstByCategory.get(item.category) === item.id ? `rubrika-${categorySlug(item.category)}` : undefined} key={item.id ?? item.title} className="scroll-mt-28 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-red-500/60 hover:bg-slate-50">
              <a href={item.id ? `/vijest/${item.id}` : "#najnovije"} className="block bg-slate-100">{item.image_url ? <img src={item.image_url} alt={item.title} className="block h-40 w-full object-cover" /> : <div className="flex h-40 items-center justify-center bg-[#F5F6F7]"><span className="px-4 text-center text-sm font-black uppercase tracking-widest text-[#17243A]/40">{item.category}</span></div>}</a>
              <div className="p-4"><p className="text-[10px] font-black uppercase tracking-wider text-red-600">{item.category}</p><a href={item.id ? `/vijest/${item.id}` : "#najnovije"}><h2 className="mt-2 line-clamp-3 text-lg font-extrabold leading-snug text-[#17243A] hover:text-red-600">{item.title}</h2></a><time className="mt-3 block text-xs text-slate-500">{formatDate(item.published_at ?? item.created_at)}</time></div>
            </article>)}
          </section>}

          <section id="najnovije" className="mt-12 scroll-mt-24">
            <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-4"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">Iz minute u minutu</p><h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#17243A] sm:text-4xl">Najnovije vijesti</h2></div><span className="text-xs font-bold uppercase tracking-widest text-slate-500">Ažurirano uživo</span></div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {editorialItems.filter((item) => !homepageLeadKeys.has(item.id ?? item.title)).map((item) => <article id={firstByCategory.get(item.category) === item.id ? `rubrika-${categorySlug(item.category)}` : undefined} key={item.id ?? item.title} className="scroll-mt-28 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-red-500/60 hover:bg-slate-50">
                <a href={item.id ? `/vijest/${item.id}` : "#najnovije"} className="block w-full bg-slate-100">{item.image_url ? <img src={item.image_url} alt={item.title} className="block max-h-[360px] w-full object-contain" /> : <div className="flex h-48 items-center justify-center bg-[#F5F6F7]"><span className="px-6 text-center text-lg font-black uppercase tracking-[0.2em] text-[#17243A]/35">{item.category}</span></div>}</a>
              <div className="p-5"><div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-wider"><span className="rounded bg-red-600/15 px-2.5 py-1 text-red-700">{item.category}</span><time className="text-slate-500">{formatDate(item.published_at ?? item.created_at)}</time></div><a href={item.id ? `/vijest/${item.id}` : "#najnovije"} className="block"><h3 className="mb-3 text-xl font-extrabold leading-snug text-[#17243A] hover:text-red-600">{item.title}</h3></a><p className="text-sm leading-6 text-slate-600">{excerpt(item.body, 180)}</p>{item.source_name && <p className="mt-4 text-xs font-semibold text-slate-500">{(item.source_count ?? 1) > 1 ? `${item.source_count} izvora izvještava o događaju` : `Izvor: ${item.source_name}`}</p>}<a href={item.id ? `/vijest/${item.id}` : "#najnovije"} className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-red-700 hover:text-red-800">Otvori vijest <span aria-hidden="true">→</span></a></div>
              </article>)}
              {editorialItems.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Urednički pripremljene vijesti prikazat će se ovdje.</p>}
              {editorialItems.length > 0 && editorialItems.length <= homepageLeadKeys.size && <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Prikazane su sve urednički pripremljene vijesti.</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <section aria-label="VZN indeks" className="overflow-hidden rounded-2xl border border-red-500/30 bg-[#F5F6F7]">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4"><span className="flex items-center gap-2 rounded bg-red-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />LIVE</span><span className="text-xs font-bold uppercase tracking-widest text-red-700">VZN indeks</span></div>
            <div className="p-5"><h2 className="text-2xl font-black uppercase leading-tight text-[#17243A]">Tržište nezaposlenih</h2><p className="mt-2 text-xs leading-5 text-slate-600">Tjedni pregled aktivnosti i tema koje su obilježile portal.</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Objave ovaj tjedan</p><p className="mt-2 text-3xl font-black text-[#17243A]">{weekCount}</p></div><div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">U fokusu</p><p className="mt-2 line-clamp-2 text-sm font-extrabold text-red-700">{featured.influencer}</p></div></div><p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Izvor: objave na portalu</p></div>
          </section>
          <section id="rang-lista" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-5 border-b border-slate-200 pb-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Tko dominira mrežama</p><h2 className="mt-2 text-2xl font-black text-[#17243A]">Digitalac Rang Lista</h2></div><ol className="space-y-2">{["Marko Jack", "Mihajlo Madić", "Ellen Vanjorek", "Vanjorek obitelj", "Marko Filipović", "Goldenito", "Barbi Afrika", "Choda", "Mudja", "Baka Prase"].map((name, index) => <li key={name} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3"><span className="w-8 text-lg font-black text-red-500">#{index + 1}</span><span className="font-bold text-[#17243A]">{name}</span></li>)}</ol></section>
        </aside>
      </div>
      {mediaItems.length > 0 && <details className="mx-auto mt-8 max-w-[1440px] px-4 sm:px-6 md:px-8">
        <summary className="cursor-pointer list-none rounded-xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-black uppercase tracking-wide text-[#17243A] shadow-sm transition hover:border-red-500 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600">Prikaži vijesti iz medija <span className="ml-2 text-red-600">({mediaItems.length}) ↓</span></summary>
        <section aria-label="Vijesti iz medija" className="mt-5 grid gap-5 md:grid-cols-2">
          {mediaItems.map((item) => <article key={item.id ?? item.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {item.id && <a href={`/vijest/${item.id}`} className="block bg-slate-100">{item.image_url ? <img src={item.image_url} alt={item.title} className="block max-h-[360px] w-full object-contain" /> : <div className="flex h-40 items-center justify-center bg-[#F5F6F7]"><span className="px-4 text-center text-sm font-black uppercase text-[#17243A]/40">{item.category}</span></div>}</a>}
            <div className="p-5"><p className="mb-2 text-xs font-black uppercase tracking-wide text-red-700">{item.category} · {item.source_name ?? "Mediji"}</p>{item.id ? <a href={`/vijest/${item.id}`}><h2 className="text-xl font-extrabold leading-snug text-[#17243A] hover:text-red-700">{item.title}</h2></a> : <h2 className="text-xl font-extrabold leading-snug text-[#17243A]">{item.title}</h2>}<p className="mt-3 text-sm leading-6 text-slate-600">{excerpt(item.body, 180)}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3">{item.source_url && <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-sm font-black uppercase text-red-700 hover:text-red-800">Otvori izvor ↗</a>}<time className="text-xs text-slate-500">{formatDate(item.published_at ?? item.created_at)}</time></div></div>
          </article>)}
        </section>
      </details>}
      <div className="mx-auto mt-8 grid w-full min-w-0 max-w-[1440px] gap-6 px-3 sm:px-6 md:px-8 [&>*]:min-w-0">
        <section id="digitalci" className="min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7" aria-labelledby="creators-title">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Imena o kojima pišemo</p><h2 id="creators-title" className="mt-2 text-2xl font-black text-[#17243A] sm:text-3xl">Digitalci</h2>
          {creators.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{creators.map((name) => { const story = items.find((item) => item.influencer === name); return <article key={name} className="rounded-xl border border-slate-200 bg-[#F5F6F7] p-4"><h3 className="font-extrabold text-[#17243A]">{name}</h3>{story && <><p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{story.title}</p>{story.id && <a href={`/vijest/${story.id}`} className="mt-3 inline-block text-xs font-black uppercase text-red-700">Posljednja vijest →</a>}</>}</article>; })}</div> : <p className="mt-4 text-sm text-slate-600">Profili će se pojaviti uz prve objavljene vijesti.</p>}
          <p className="mt-4 text-xs text-slate-500">Pregled digitalaca povezanih s objavljenim pričama.</p>
        </section>
        <div id="statistika" className="min-w-0 scroll-mt-24"><UnemploymentHistoryChart /></div>
        <div id="prognoza" className="scroll-mt-24"><CityWeather /></div>
        <SatiricalClassifieds />
        <UnemployedHoroscope />
        <HolidayCalendar />
      </div>
      <footer className="mt-20 border-t border-slate-200 bg-[#F5F6F7] px-6 py-10 text-center text-xs text-slate-600"><p>© 2026 VIJESTI ZA NEZAPOSLENE · Vijesti, digitalna kultura i tržište rada.</p><a href="/admin" className="mt-3 inline-block text-slate-600 hover:text-[#17243A]">Uredništvo</a></footer>
    </main>
  );
}
