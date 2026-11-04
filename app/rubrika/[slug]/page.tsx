import { notFound } from "next/navigation";
import CityWeather from "../../components/city-weather";
import UnemploymentHistoryChart from "../../components/unemployment-history-chart";
import { Article, formatDate, loadNews } from "../../lib/news";

const rubrics: Record<string, { title: string; description: string; select: (article: Article) => boolean }> = {
  "breaking-news": { title: "Breaking News", description: "Najnovije urednički izdvojene vijesti.", select: (article) => Boolean(article.is_featured) || /breaking|hitno|najnovije/i.test(article.category ?? "") },
  digitalci: { title: "Digitalci", description: "Influenceri, TikTokeri i YouTuberi o kojima portal izvještava.", select: () => true },
  "crna-kronika": { title: "Crna kronika", description: "Vijesti iz crne kronike digitalnog svijeta.", select: (article) => /crna kronika|incident|sud|policija/i.test(article.category ?? "") },
  ekonomija: { title: "Ekonomija", description: "Tržište rada, zapošljavanje i statistika nezaposlenosti.", select: (article) => /ekonom|zapošlj|nezaposl|tržište rada/i.test(article.category ?? "") },
  burza: { title: "VZN Market Watch", description: "Statistika rada i satirični tržišni pokazatelji.", select: (article) => /burza|market|tržište|ekonom/i.test(article.category ?? "") },
  lifestyle: { title: "Lifestyle", description: "Ideje za kvalitetno provedene neradne dane.", select: (article) => /lifestyle|životni stil|slobodno vrijeme/i.test(article.category ?? "") },
  ekskluzivno: { title: "Ekskluzivno", description: "Autorske i urednički pripremljene priče.", select: (article) => /ekskluzivno|autorski/i.test(article.category ?? "") },
};

export const dynamic = "force-dynamic";

export default async function RubricPage({ params }: { params: { slug: string } }) {
  const rubric = rubrics[params.slug];
  if (!rubric) notFound();
  const rows = (await loadNews()).map((item) => ({ ...item, title: item.title ?? item.naslov ?? "", body: item.body ?? item.tekst ?? "", category: item.category ?? item.kategorija ?? "" }));
  const stories = rows.filter(rubric.select);
  const creators = Array.from(new Set(stories.map((story) => story.influencer).filter((name) => name && name !== "Uredništvo")));
  return <main className="min-h-screen bg-white font-sans text-[#17243A]"><header className="bg-[#17243A] px-4 py-4 text-white sm:px-8"><div className="mx-auto flex max-w-6xl items-center gap-3"><a href="/" className="h-11 w-11 overflow-hidden rounded-full border-2 border-white"><img src="/logo-vijesti.png" alt="" className="h-full w-full object-cover" /></a><a href="/" className="text-xl font-black sm:text-2xl">VIJESTI ZA NEZAPOSLENE</a></div></header>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><a href="/" className="text-sm font-bold text-red-700 hover:text-red-600">← Naslovnica</a><div className="mt-6 border-b border-slate-200 pb-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Rubrika</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{rubric.title}</h1><p className="mt-3 max-w-2xl text-slate-600">{rubric.description}</p></div>
      {params.slug === "digitalci" && creators.length > 0 && <section className="mt-7"><h2 className="text-xl font-black">Digitalci u vijestima</h2><div className="mt-3 flex flex-wrap gap-2">{creators.map((name) => <span key={name} className="rounded-full bg-[#F5F6F7] px-3 py-2 text-sm font-semibold">{name}</span>)}</div></section>}
      {(params.slug === "ekonomija" || params.slug === "burza") && <div className="mt-7 grid gap-5"><UnemploymentHistoryChart />{params.slug === "burza" && <CityWeather />}</div>}
      {stories.length ? <div className="mt-7 grid gap-4 md:grid-cols-2">{stories.map((story) => <article key={story.id ?? story.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-red-600">{story.category} · {story.influencer}</p><a href={story.id ? `/vijest/${story.id}` : "#"}><h2 className="mt-2 text-xl font-extrabold leading-snug hover:text-red-700">{story.title}</h2></a><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{story.body}</p>{(story.source_count ?? 1) > 1 && <p className="mt-3 text-xs font-semibold text-slate-500">Izvještava {story.source_count} izvora</p>}<time className="mt-4 block text-xs text-slate-500">{formatDate(story.published_at ?? story.created_at)}</time></article>)}</div> : <p className="mt-7 rounded-xl border border-slate-200 bg-[#F5F6F7] p-6 text-slate-600">U ovoj rubrici trenutačno nema članaka. Prve će priče stići kroz redakciju i automatizirani pregled izvora.</p>}
    </div><footer className="mt-16 border-t border-slate-200 bg-[#F5F6F7] px-5 py-8 text-center text-xs text-slate-500">Satirični portal · Provjerite izvor prije dijeljenja.</footer></main>;
}
