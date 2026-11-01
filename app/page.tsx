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
        .select("id,influencer,title,body,category,image_url")
        .eq("published", true).order("created_at", { ascending: false });
      if (!error && data?.length) return data as Article[];
    } catch {
      // Keep the site available using the bundled news if Supabase is unavailable.
    }
  }
  return loadLocalNews();
}

export const dynamic = "force-dynamic";

export default async function Page() {
  const items = (await loadNews()).map((item) => ({
    ...item,
    title: item.title ?? item.naslov ?? "",
    body: item.body ?? item.tekst ?? "",
    category: item.category ?? item.kategorija ?? "",
  }));
  const featured = items[0] ?? {
    influencer: "Vijesti za nezaposlene",
    title: "Dobro došli na portal",
    body: "Najnovije vijesti i analize iz digitalnog svijeta.",
    category: "Naslovnica",
  };
  const ranking = [
    { name: "Marko Jack", score: "99.8% šuplje", status: "Snima iz auta" },
    { name: "Baka Prase", score: "95.2% dramatično", status: "Kupuje novi sat" },
    { name: "Mihajlo Madić", score: "91.0% motivacija", status: "Dijeli savjete o uspjehu" },
    { name: "Vanjorek obitelj", score: "88.5% obiteljski kaos", status: "Live uključivanje" },
    { name: "Goldenito", score: "85.0% fleksanje", status: "Gleda u kameru" },
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-[#36454F]">
      <header className="border-b-4 border-[#FF8C00] bg-[#001F3F] p-6 text-center text-3xl font-bold tracking-tight text-white">VIJESTI ZA NEZAPOSLENE</header>
      <nav className="border-b border-gray-200 bg-white py-3">
        <div className="mx-auto flex max-w-[1280px] gap-8 px-8 text-sm font-bold uppercase tracking-widest text-[#001F3F]">
          <a href="/">Naslovnica</a><a href="#najnovije">TikTok Drama</a><a href="#rang-lista">Digitalac Rang Lista</a><a href="#najnovije">Analize</a>
        </div>
      </nav>
      <div className="mx-auto mt-12 max-w-[1280px] p-8">
        <section className="grid grid-cols-1 items-center gap-16 border-b pb-16 md:grid-cols-2">
          <div>
            <span className="mb-4 inline-block bg-[#CC0000] px-2 py-1 text-xs font-bold uppercase text-white">{featured.category}</span>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-[#001F3F] md:text-5xl">{featured.title}</h1>
            <p className="mb-8 text-xl leading-relaxed">{featured.body}</p>
            <a href="#najnovije" className="inline-block bg-[#FF8C00] px-8 py-4 font-bold text-white shadow-lg">PROČITAJ ANALIZU</a>
          </div>
          <div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-100">
            {featured.image_url ? <img src={featured.image_url} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" /> : <p className="text-3xl font-bold uppercase text-gray-400">{featured.influencer}</p>}
            <div className="z-10 bg-white/85 p-6 text-center"><div className="mx-auto mb-4 h-1 w-20 bg-[#FF8C00]" /><p className="italic text-[#001F3F]">"Uživo sa TikToka – dok ti tražiš posao."</p></div>
          </div>
        </section>
        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <section id="najnovije" className="lg:col-span-2">
            <h2 className="mb-8 border-l-8 border-[#FF8C00] pl-4 text-2xl font-bold text-[#001F3F]">NAJNOVIJE VIJESTI S MREŽA</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {items.slice(1).map((item, index) => <article key={item.id ?? index} className="overflow-hidden rounded border border-gray-200 shadow-sm">
                {item.image_url && <img src={item.image_url} alt={item.title} className="h-48 w-full object-cover" />}
                <div className="p-6"><span className="text-xs font-bold uppercase text-[#FF8C00]">{item.category}</span><h3 className="mb-3 mt-2 text-lg font-bold text-[#001F3F]">{item.title}</h3><p className="text-sm leading-relaxed text-gray-600">{item.body}</p></div>
              </article>)}
            </div>
          </section>
          <aside id="rang-lista" className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-6 border-b pb-3 text-xl font-bold text-[#001F3F]">Digitalac Rang Lista</h3>
            <div className="space-y-4">{ranking.map((item, index) => <div key={item.name} className="flex items-center justify-between rounded border bg-white p-4">
              <div><span className="text-xs text-gray-400">#{index + 1}</span><h4 className="font-bold text-[#001F3F]">{item.name}</h4><p className="text-xs text-gray-500">{item.status}</p></div><span className="text-sm font-bold text-[#FF8C00]">{item.score}</span>
            </div>)}</div>
          </aside>
        </div>
      </div>
      <footer className="mt-32 bg-[#001F3F] p-12 text-center text-sm text-white">
        <p>© 2026 VIJESTI ZA NEZAPOSLENE - Sva prava pridržana onima koji nemaju pametnijeg posla.</p>
        <a href="/admin" className="mt-3 inline-block text-white/60 hover:text-white">Uredništvo</a>
      </footer>
    </main>
  );
}