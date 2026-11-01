"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

type Story = { id: string; influencer: string; title: string; category: string; body: string; image_path: string | null; source_url: string | null; source_name: string | null };
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export default function AdminPage() {
  const [db, setDb] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [editor, setEditor] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [context, setContext] = useState("");
  const [satire, setSatire] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!url || !key) return;
    const client = createClient(url, key);
    setDb(client);
    void client.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !user) { setEditor(false); setStories([]); return; }
    let cancelled = false;
    void (async () => {
      const { data: access } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      setEditor(Boolean(access));
      if (!access) { setMessage("Ovaj račun nema uredničke ovlasti."); return; }
      const { data } = await db.from("news").select("id,influencer,title,category,body,image_path,source_url,source_name").eq("published", true).order("created_at", { ascending: false });
      if (!cancelled) setStories((data ?? []) as Story[]);
    })();
    return () => { cancelled = true; };
  }, [db, user]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db) return;
    setBusy(true); setMessage("");
    const { error } = await db.auth.signInWithPassword({ email, password });
    setMessage(error ? "Prijava nije uspjela. Provjeri e-mail i lozinku." : "");
    setBusy(false);
  }

  async function makeDraft() {
    if (!db || !user || !editor) return;
    setBusy(true); setMessage("");
    const { data, error } = await db.functions.invoke("draft-news", {
      body: { person: source, tiktokUrl, context, satire },
    });
    if (error) {
      let detail = error.message;
      const response = (error as Error & { context?: Response }).context;
      if (response) {
        try {
          const payload = await response.clone().json();
          if (typeof payload?.error === "string") detail = payload.error;
        } catch { /* Keep the SDK error message when the response has no JSON body. */ }
      }
      setMessage("Nacrt nije napravljen: " + detail);
    }
    else if (data?.draft) {
      setTitle(data.draft.title); setCategory(data.draft.category); setBody(data.draft.body);
      setMessage("Nacrt je spreman — pregledaj ga pa klikni Objavi vijest.");
    } else setMessage(data?.error ?? "Nacrt nije napravljen.");
    setBusy(false);
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !user || !editor) return;
    setBusy(true); setMessage("");
    let path: string | null = null;
    try {
      let validatedTikTokUrl: string | null = null;
      if (tiktokUrl.trim()) {
        const parsedUrl = new URL(tiktokUrl.trim());
        if (parsedUrl.protocol !== "https:" || !["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"].includes(parsedUrl.hostname.toLowerCase())) {
          throw new Error("Unesi valjanu HTTPS poveznicu na TikTok video.");
        }
        validatedTikTokUrl = parsedUrl.toString();
      }
      let imageUrl: string | null = null;
      if (image) {
        const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
        const ext = types[image.type];
        if (!ext) throw new Error("Odaberi JPG, PNG, WebP ili GIF sliku.");
        if (image.size > 5 * 1024 * 1024) throw new Error("Slika smije imati najviše 5 MB.");
        path = user.id + "/" + crypto.randomUUID() + "." + ext;
        const uploaded = await db.storage.from("news-images").upload(path, image, { contentType: image.type });
        if (uploaded.error) throw uploaded.error;
        imageUrl = db.storage.from("news-images").getPublicUrl(path).data.publicUrl;
      }
      const article = { influencer: source.trim(), title: title.trim(),
        category: category.trim(), body: body.trim(), image_url: imageUrl, image_path: path,
        source_name: validatedTikTokUrl ? "TikTok" : null, source_url: validatedTikTokUrl, published: true,
      };
      const saved = editingId
        ? await db.from("news").update({ ...article, ...(imageUrl ? {} : { image_url: undefined, image_path: undefined }) }).eq("id", editingId)
        : await db.from("news").insert({ ...article, created_by: user.id });
      if (saved.error) throw saved.error;
      setSource(""); setTitle(""); setCategory(""); setBody(""); setImage(null); setTiktokUrl(""); setEditingId(null);
      const input = document.getElementById("story-image") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage(editingId ? "Vijest je ažurirana." : "Vijest je objavljena.");
      const { data } = await db.from("news").select("id,influencer,title,category,body,image_path,source_url,source_name").eq("published", true).order("created_at", { ascending: false });
      setStories((data ?? []) as Story[]);
    } catch (error) {
      if (path) await db.storage.from("news-images").remove([path]);
      setMessage(error instanceof Error ? error.message : "Vijest nije spremljena.");
    } finally { setBusy(false); }
  }

  function edit(story: Story) {
    setEditingId(story.id); setSource(story.influencer); setTitle(story.title); setCategory(story.category);
    setBody(story.body); setTiktokUrl(story.source_name === "TikTok" ? story.source_url ?? "" : "");
    setImage(null); setMessage("Uređuješ postojeću vijest. Dodaj sliku ili izmijeni tekst pa spremi promjene.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null); setSource(""); setTitle(""); setCategory(""); setBody(""); setTiktokUrl(""); setImage(null);
    const input = document.getElementById("story-image") as HTMLInputElement | null;
    if (input) input.value = "";
    setMessage("");
  }

  async function remove(story: Story) {
    if (!db || !window.confirm("Obrisati ovu vijest?")) return;
    const { error } = await db.from("news").delete().eq("id", story.id);
    if (error) { setMessage(error.message); return; }
    if (story.image_path) await db.storage.from("news-images").remove([story.image_path]);
    setStories((items) => items.filter((item) => item.id !== story.id));
    setMessage("Vijest je obrisana.");
  }

  if (!url || !key) return <main className="mx-auto max-w-xl p-8"><h1 className="text-3xl font-bold text-[#001F3F]">Uredništvo</h1><p className="mt-4">Nedostaje Supabase URL ili publishable key. Dodaj ih u Vercel Environment Variables.</p></main>;

  return <main className="min-h-screen bg-gray-50 px-4 py-10 text-[#36454F]"><div className="mx-auto max-w-4xl">
    <a href="/" className="font-bold text-[#FF8C00]">← Natrag na naslovnicu</a>
    <section className="mt-4 rounded-xl border bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-3xl font-bold text-[#001F3F]">Uredništvo</h1>
      <p className="mb-6 mt-2 text-sm text-gray-600">Dodaj vijest i fotografiju; objava se odmah prikazuje na naslovnici.</p>
      {message && <p role="status" className="mb-4 rounded bg-amber-50 p-3 text-sm">{message}</p>}
      {user && <button className="mb-5 rounded border px-3 py-2 text-sm" onClick={() => void db?.auth.signOut()}>Odjava</button>}
      {!user ? <form onSubmit={login} className="max-w-md space-y-4">
        <label className="block text-sm">E-mail<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
        <label className="block text-sm">Lozinka<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
        <button disabled={busy} className="rounded bg-[#001F3F] px-5 py-3 font-bold text-white">{busy ? "Prijava..." : "Prijavi se"}</button>
      </form> : editor ? <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={publish} className="space-y-4">
          <label className="block text-sm">Osoba / izvor<input required maxLength={120} value={source} onChange={(e) => setSource(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm">Naslov<input required maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm">Kategorija<input required maxLength={80} value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm">Tekst vijesti<textarea required maxLength={10000} rows={7} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm">TikTok poveznica (opcionalno)<input type="url" maxLength={2000} placeholder="https://www.tiktok.com/@korisnik/video/..." value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} className="mt-1 w-full rounded border p-2" /><span className="mt-1 block text-xs text-gray-500">Zalijepi poveznicu na video. Prepričaj događaj u tekstu vijesti; bot ne može automatski pročitati svaki TikTok video.</span></label>
          <label className="block text-sm">Opis ili transkript videa<textarea maxLength={6000} rows={4} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Ako AI ne može otvoriti TikTok, ukratko napiši što se događa u videu." className="mt-1 w-full rounded border p-2" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={satire} onChange={(e) => setSatire(e.target.checked)} />Satira (AI će jasno označiti da je priča izmišljena)</label>
          <button type="button" disabled={busy || (!tiktokUrl.trim() && !context.trim())} onClick={() => void makeDraft()} className="rounded border border-[#001F3F] px-5 py-3 font-bold text-[#001F3F]">{busy ? "Radim nacrt..." : "Napiši nacrt pomoću AI-ja"}</button>
          <label className="block text-sm">Slika (JPG, PNG, WebP ili GIF; do 5 MB)<input id="story-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" /></label>
          <button disabled={busy} className="rounded bg-[#FF8C00] px-5 py-3 font-bold text-white">{busy ? "Spremam..." : editingId ? "Spremi promjene" : "Objavi vijest"}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="ml-2 rounded border px-5 py-3">Odustani</button>}
        </form>
        <section><h2 className="mb-4 text-lg font-bold text-[#001F3F]">Objavljene vijesti</h2>
          {stories.length === 0 ? <p className="text-sm text-gray-500">Još nema vijesti.</p> : <ul className="space-y-3">{stories.map((story) => <li key={story.id} className="flex justify-between gap-3 rounded border p-3"><div><p className="text-xs font-bold uppercase text-[#FF8C00]">{story.category}</p><p className="mt-1 font-semibold text-[#001F3F]">{story.title}</p></div><div className="flex gap-3"><button onClick={() => edit(story)} className="text-sm font-semibold text-[#001F3F]">Uredi</button><button onClick={() => void remove(story)} className="text-sm text-red-700">Obriši</button></div></li>)}</ul>}
        </section>
      </div> : user ? <p className="text-sm text-gray-600">Prijavljen si, ali račun nema uredničke ovlasti.</p> : null}
    </section>
  </div></main>;
}
