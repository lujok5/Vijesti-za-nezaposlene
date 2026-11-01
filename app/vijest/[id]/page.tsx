import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Comments from "./comments";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: { id: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) notFound();
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: story } = await db.from("news").select("id,influencer,title,body,category,image_url,source_name,source_url,created_at").eq("id", params.id).eq("published", true).maybeSingle();
  if (!story) notFound();
  return <main className="min-h-screen bg-white font-sans text-[#36454F]"><header className="flex justify-center border-b-4 border-[#FF8C00] bg-[#001F3F] px-4 py-2"><a href="/" aria-label="Vijesti za nezaposlene — naslovnica"><img src="/logo-vijesti.png" alt="Vijesti za nezaposlene" className="h-24 w-24 object-contain sm:h-32 sm:w-32" /></a></header><article className="mx-auto max-w-4xl px-5 py-8 md:px-8"><a href="/" className="text-sm font-bold text-[#FF8C00]">← Natrag na naslovnicu</a><p className="mt-6 text-sm font-bold uppercase text-[#FF8C00]">{story.category} · {story.influencer}</p><h1 className="mt-3 text-3xl font-black leading-tight text-[#001F3F] md:text-5xl">{story.title}</h1>{story.image_url && <div className="mt-7 overflow-hidden rounded-xl bg-gray-100"><img src={story.image_url} alt={story.title} className="mx-auto block h-auto max-h-[75vh] w-full object-contain" /></div>}<p className="mt-7 whitespace-pre-line text-lg leading-8">{story.body}</p>{story.source_url && <a href={story.source_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block font-bold text-[#FF8C00]">Izvor: {story.source_name ?? "otvori članak"} ↗</a>}<Comments storyId={story.id} /></article></main>;
}
