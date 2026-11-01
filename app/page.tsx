import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

type Article = {
  id?: string;
  influencer: string;
  title?: string;
  naslov?: string;
  body?: string;
  tekst?: string;
  category?: string;
  kategorija?: string;
  image_url?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  published_at?: string | null;
  is_featured?: boolean;
};

function loadLocalNews(): Article[] {
  try {
    const file = path.join(process.cwd(), "vijesti.json");
    return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf-8")) as Article[]) : [];
  } catch {
    return [];
  }
}

async function loadNews(): Promise<Article[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    try {
      const supabase = createClient(url, key, { auth: { persistSession: false } });
      const { data, error } = await supabase.from("news")
        .select("id,influencer,title,body,category,image_url,source_name,source_url,published_at,is_featured")
        .eq("published", true).order("created_at", { ascending: false });
      if (!error) return (data ?? []) as Article[];
    } catch {
      // Keep the site available using the bundled news if Supabase is unavailable.
    }
  }
  return url && key ? [] : loadLocalNews();
}

export const dynamic = "force-dynamic";

export default async function Page() {
  const items = (await loadNews()).map((item) => ({
    ...item,
    title: item.title ?? item.naslov ?? "",
    body: item.body ?? item.tekst ?? "",
    category: item.category ?? item.kategorija ?? "",
  }));
  const featured = items.find((item) => item.is_featured) ?? items[0] ?? {
    influencer: "Vijesti za nezaposlene",
    title: "Čekamo prve provjerene vijesti",
    body: "Ovdje će se prikazivati stvarne vijesti iz medija s poveznicom na izvor. Bot provjerava nove objave svakih šest sati.",
    category: "Automatsko praćenje",
  };

  return (
    <main className="min-h-screen bg-white font-sans text-[#36454F]">
      <header className="border-b-4 border-[#FF8C00] bg-[#001F3F] px-3 py-3 sm:px-8"><div className="mx-auto flex max-w-[1440px] items-center gap-2 sm:gap-3"><a href="/" aria-label="Naslovnica" className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white sm:h-14 sm:w-14"><img src="/logo-vijesti.png" alt="" className="h-full w-full object-cover" /></a><a href="/" className="text-[1.35rem] font-extrabold tracking-tight text-white sm:text-3xl">VIJESTI ZA NEZAPOSLENE</a></div></header>
      <nav className="border-b border-gray-200 bg-white py-3">
        <div className="mx-auto flex max-w-[1280px] snap-x snap-mandatory items-center justify-start gap-7 overflow-x-auto overscroll-x-contain whitespace-nowrap px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#001F3F] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center sm:gap-8 sm:px-8 sm:text-sm sm:tracking-widest">
          <a className="shrink-0 snap-start py-2" href="/">Naslovnica</a><a className="shrink-0 snap-start py-2" href="#najnovije">Najnovije vijesti</a><a className="shrink-0 snap-start py-2" href="#rang-lista">Digitalac Rang Lista</a><a className="shrink-0 snap-start py-2" href="#najnovije">Analize</a>
        </div>
      </nav>
      <div className="mx-auto mt-6 grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 sm:mt-8 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.85fr)]">
        <div className="min-w-0">
        <section className="border-b pb-10">
          <div>
            <span className="mb-4 inline-block bg-[#CC0000] px-2 py-1 text-xs font-bold uppercase text-white">{featured.category}</span>
            {featured.id ? <a href={`/vijest/${featured.id}`} className="block"><h1 className="mb-5 max-w-5xl break-words text-3xl font-bold leading-tight text-[#001F3F] hover:text-[#FF8C00] sm:text-4xl md:mb-6 md:text-5xl">{featured.title}</h1></a> : <h1 className="mb-5 max-w-5xl break-words text-3xl font-bold leading-tight text-[#001F3F] sm:text-4xl md:mb-6 md:text-5xl">{featured.title}</h1>}
          </div>
          <div className="relative mb-5 flex min-h-0 w-full max-w-4xl items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 sm:mb-6 md:min-h-[420px]">
            {featured.image_url ? (featured.id ? <a href={`/vijest/${featured.id}`} className="flex w-full items-center justify-center"><img src={featured.image_url} alt={featured.title} className="max-h-[58vh] w-full object-contain sm:max-h-[70vh]" /></a> : <img src={featured.image_url} alt={featured.title} className="max-h-[58vh] w-full object-contain sm:max-h-[70vh]" />) : <p className="px-6 py-16 text-center text-lg font-bold uppercase text-gray-400 sm:px-8 sm:py-24 sm:text-xl">{featured.source_name ? `Izvor: ${featured.source_name}` : "Vijesti s provjerenim izvorom"}</p>}
          </div>
          <p className="mb-3 max-w-5xl text-base leading-7 sm:text-lg sm:leading-relaxed">{featured.body}</p>
          {featured.source_url && <a href={featured.source_url} target="_blank" rel="noopener noreferrer" className="mb-5 inline-block text-sm font-semibold text-[#FF8C00]">Izvor: {featured.source_name ?? "otvori članak"} ↗</a>}
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">{featured.id && <a href={`/vijest/${featured.id}`} className="inline-block px-5 py-3 text-center text-sm font-bold text-white shadow-lg sm:px-8 sm:py-4 sm:text-base bg-[#FF8C00]">OTVORI VIJEST I KOMENTIRAJ →</a>}{featured.source_url && <a href={featured.source_url} target="_blank" rel="noopener noreferrer" className="inline-block border border-[#FF8C00] px-5 py-3 text-center text-sm font-bold text-[#FF8C00] sm:px-8 sm:py-4 sm:text-base">OTVORI IZVOR ↗</a>}{!featured.id && <a href="#najnovije" className="inline-block bg-[#FF8C00] px-5 py-3 text-center text-sm font-bold text-white shadow-lg sm:px-8 sm:py-4 sm:text-base">POGLEDAJ VIJESTI</a>}</div>
        </section>
        <div className="mt-10">
          <section id="najnovije">
            <h2 className="mb-8 border-l-8 border-[#FF8C00] pl-4 text-2xl font-bold text-[#001F3F]">NAJNOVIJE VIJESTI S MREŽA</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {items.filter((item) => item.id !== featured.id).map((item, index) => <article key={item.id ?? `featured-${index}`} className="overflow-hidden rounded border border-gray-200 shadow-sm">
                {item.image_url && <a href={`/vijest/${item.id}`} className="block w-full bg-gray-100"><img src={item.image_url} alt={item.title} className="block h-auto max-h-[420px] w-full object-contain" /></a>}
                <div className="p-6"><span className="text-xs font-bold uppercase text-[#FF8C00]">{item.category}</span><a href={`/vijest/${item.id}`} className="block"><h3 className="mb-3 mt-2 text-lg font-bold text-[#001F3F]">{item.title}</h3></a><p className="text-sm leading-relaxed text-gray-600">{item.body}</p><a href={`/vijest/${item.id}`} className="mt-4 inline-block text-sm font-bold text-[#FF8C00]">Pročitaj vijest i komentiraj →</a></div>
              </article>)}
              {items.length <= 1 && <p className="rounded border border-gray-200 bg-gray-50 p-6 text-gray-600">Još nema novih vijesti iz pouzdanih izvora. Ne prikazujemo izmišljene ni probne članke.</p>}
            </div>
          </section>
        </div>
        </div>
        <aside id="rang-lista" className="h-fit rounded-lg border border-gray-200 bg-gray-50 p-6 lg:sticky lg:top-6">
            <h3 className="mb-2 text-xl font-bold text-[#001F3F]">Digitalac Rang Lista</h3>
            <p className="mb-5 text-sm text-gray-600">Početni poredak</p>
            <ol className="space-y-3">
              {["Marko Jack", "Mihajlo Madić", "Ellen Vanjorek", "Vanjorek obitelj", "Marko Filipović", "Goldenito", "Barbi Afrika", "Choda", "Mudja", "Baka Prase"].map((name, index) => <li key={name} className="flex items-center gap-4 rounded border bg-white p-4"><span className="w-8 text-xl font-black text-[#FF8C00]">#{index + 1}</span><span className="font-bold text-[#001F3F]">{name}</span></li>)}
            </ol>
        </aside>
      </div>
      <footer className="mt-32 bg-[#001F3F] p-12 text-center text-sm text-white">
        <p>© 2026 VIJESTI ZA NEZAPOSLENE - Sva prava pridržana onima koji nemaju pametnijeg posla.</p>
        <a href="/admin" className="mt-3 inline-block text-white/60 hover:text-white">Uredništvo</a>
      </footer>
    </main>
  );
}
