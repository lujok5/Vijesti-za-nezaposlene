"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Comment = { id: string; display_name: string; body: string; created_at: string };
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export default function Comments({ storyId }: { storyId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const db = createClient(url, key);
    const { data, error } = await db.from("comments").select("id,display_name,body,created_at").eq("news_id", storyId).order("created_at", { ascending: false }).limit(100);
    if (!error) setComments((data ?? []) as Comment[]);
  }
  useEffect(() => { void refresh(); }, [storyId]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanBody = body.trim(); const cleanName = name.trim() || "Anonimno";
    if (!cleanBody || cleanBody.length > 1000 || cleanName.length > 40) { setMessage("Ime može imati do 40, a komentar do 1.000 znakova."); return; }
    setBusy(true); setMessage("");
    const db = createClient(url, key);
    const { error } = await db.from("comments").insert({ news_id: storyId, display_name: cleanName, body: cleanBody });
    if (error) setMessage("Komentar nije objavljen. Pokušaj ponovno.");
    else { setBody(""); setMessage("Komentar je objavljen."); await refresh(); }
    setBusy(false);
  }
  return <section className="mt-14 border-t border-slate-200 pt-8"><h2 className="text-2xl font-black text-[#17243A]">Komentari</h2><form onSubmit={submit} className="mt-5 space-y-3"><label className="block text-sm font-semibold text-[#17243A]">Ime za prikaz (neobavezno)<input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Anonimno" className="mt-1 block w-full rounded border border-slate-300 bg-white p-3 text-[#17243A] placeholder:text-slate-500" /></label><label className="block text-sm font-semibold text-[#17243A]">Tvoj komentar<textarea required value={body} maxLength={1000} rows={4} onChange={(e) => setBody(e.target.value)} className="mt-1 block w-full rounded border border-slate-300 bg-white p-3 text-[#17243A] placeholder:text-slate-500" placeholder="Napiši komentar…" /></label><p className="text-xs text-slate-500">Komentirati možeš bez prijave. Nemoj objavljivati osobne podatke ili uvredljiv sadržaj.</p><button disabled={busy} className="rounded bg-red-600 px-5 py-3 font-bold text-white">{busy ? "Objavljujem…" : "Objavi komentar"}</button>{message && <p role="status" className="text-sm text-slate-600">{message}</p>}</form><div className="mt-8 space-y-4">{comments.map((comment) => <article key={comment.id} className="rounded-lg border border-slate-200 bg-[#F5F6F7] p-4"><div className="flex justify-between gap-4"><strong className="text-[#17243A]">{comment.display_name}</strong><time className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString("hr-HR")}</time></div><p className="mt-2 whitespace-pre-wrap text-slate-700">{comment.body}</p></article>)}{comments.length === 0 && <p className="text-slate-500">Još nema komentara. Budi prvi!</p>}</div></section>;
}
