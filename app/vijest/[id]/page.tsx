import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Comments from "./comments";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return "Vrijeme objave nije dostupno";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Vrijeme objave nije dostupno" : date.toLocaleString("hr-HR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getTikTokVideoId(sourceName?: string | null, sourceUrl?: string | null) {
  if (sourceName?.toLowerCase() !== "tiktok" || !sourceUrl) return null;
  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "https:" || !["tiktok.com", "www.tiktok.com"].includes(url.hostname.toLowerCase())) return null;
    return url.pathname.match(/\/video\/(\d+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) notFound();
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: story } = await db.from("news").select("id,influencer,title,body,category,image_url,source_name,source_url,created_at,published_at").eq("id", params.id).eq("published", true).maybeSingle();
  if (!story) notFound();
  const { data: sourceRows } = await db.from("news_sources").select("source_name,source_url,source_title,published_at").eq("news_id", story.id).order("published_at", { ascending: false });
  const sources = sourceRows?.length ? sourceRows : story.source_url ? [{ source_name: story.source_name ?? "Izvorni članak", source_url: story.source_url, source_title: story.title, published_at: story.published_at }] : [];
  const tiktokVideoId = getTikTokVideoId(story.source_name, story.source_url);
  return <main className="min-h-screen bg-white font-sans text-[#17243A]"><header className="border-b border-[#17243A] bg-[#17243A] px-4 py-3 text-white sm:px-8"><div className="mx-auto flex max-w-[1440px] items-center gap-3"><a href="/" aria-label="Naslovnica" className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white sm:h-14 sm:w-14"><img src="/logo-vijesti.png" alt="" className="h-full w-full object-cover" /></a><a href="/" className="text-xl font-black tracking-tight sm:text-3xl">VIJESTI ZA NEZAPOSLENE</a></div></header><article className="mx-auto max-w-4xl px-5 py-8 md:px-8"><a href="/" className="text-sm font-bold text-red-700 hover:text-red-600">← Natrag na naslovnicu</a><div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wider"><span className="rounded bg-red-600 px-3 py-1.5 text-white">{story.category}</span><span className="text-slate-600">{story.influencer}</span><time className="text-slate-500">{formatDate(story.published_at ?? story.created_at)}</time></div><h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-[#17243A] md:text-6xl">{story.title}</h1>{tiktokVideoId && <section className="mt-8" aria-label="TikTok video"><h2 className="mb-3 text-sm font-black uppercase tracking-wider text-slate-600">Video uz vijest</h2><div className="mx-auto aspect-[9/16] w-full max-w-[405px] overflow-hidden rounded-2xl bg-black shadow-sm"><iframe src={`https://www.tiktok.com/player/v1/${tiktokVideoId}?music_info=1&description=1`} title={`TikTok video: ${story.title}`} className="h-full w-full border-0" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" /></div></section>}{story.image_url ? <div className="mt-8 flex max-h-[78vh] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white"><img src={story.image_url} alt={story.title} className="block h-auto max-h-[78vh] max-w-full object-contain" /></div> : !tiktokVideoId ? <div className="mt-8 flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-[#F5F6F7]"><span className="text-lg font-black uppercase tracking-[0.25em] text-[#17243A]/35">{story.category}</span></div> : null}<p className="mt-8 whitespace-pre-line text-lg leading-8 text-slate-700 md:text-xl md:leading-9">{story.body}</p>{sources.length > 0 && <section className="mt-8 rounded-2xl border border-slate-200 bg-[#F5F6F7] p-5" aria-label="Izvori vijesti"><h2 className="text-lg font-black text-[#17243A]">Izvori koji izvještavaju o događaju</h2><ul className="mt-3 space-y-3">{sources.map((source) => <li key={source.source_url} className="border-t border-slate-200 pt-3"><a href={source.source_url} target="_blank" rel="noopener noreferrer" className="font-bold text-red-700 hover:text-red-800">{source.source_name} ↗</a><p className="mt-1 text-sm text-slate-600">{source.source_title}</p>{source.published_at && <time className="mt-1 block text-xs text-slate-500">{formatDate(source.published_at)}</time>}</li>)}</ul></section>}<Comments storyId={story.id} /></article></main>;
}
