"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

type Story = { id: string; title: string; category: string; image_path: string | null };
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
  const [image, setImage] = useState<File | null>(null);
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
      const { data } = await db.from("news").select("id,title,category,image_path").eq("published", true).order("created_at", { ascending: false });
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

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !user || !editor) return;
    setBusy(true); setMessage("");
    let path: string | null = null;
    try {
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
      const saved = await db.from("news").insert({
        created_by: user.id, influencer: source.trim(), title: title.trim(),
        category: category.trim(), body: body.trim(), image_url: imageUrl, image_path: path, published: true,
      });
      if (saved.error) throw saved.error;
      setSource(""); setTitle(""); setCategory(""); setBody(""); setImage(null);
      const input = document.getElementById("story-image") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage("Vijest je objavljena.");
      const { data } = await db.from("news").select("id,title,category,image_path").eq("published", true).order("created_at", { ascending: false });
      setStories((data ?? []) as Story[]);
    } catch (error) {
      if (path) await db.storage.from("news-images").remove([path]);
      setMessage(error instanceof Error ? error.message : "Vijest nije spremljena.");
    } finally { setBusy(false); }
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
          <label className="block text-sm">Slika (JPG, PNG, WebP ili GIF; do 5 MB)<input id="story-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" /></label>
          <button disabled={busy} className="rounded bg-[#FF8C00] px-5 py-3 font-bold text-white">{busy ? "Spremam..." : "Objavi vijest"}</button>
        </form>
        <section><h2 className="mb-4 text-lg font-bold text-[#001F3F]">Objavljene vijesti</h2>
          {stories.length === 0 ? <p className="text-sm text-gray-500">Još nema vijesti.</p> : <ul className="space-y-3">{stories.map((story) => <li key={story.id} className="flex justify-between gap-3 rounded border p-3"><div><p className="text-xs font-bold uppercase text-[#FF8C00]">{story.category}</p><p className="mt-1 font-semibold text-[#001F3F]">{story.title}</p></div><button onClick={() => void remove(story)} className="text-sm text-red-700">Obriši</button></li>)}</ul>}
        </section>
      </div> : user ? <p className="text-sm text-gray-600">Prijavljen si, ali račun nema uredničke ovlasti.</p> : null}
    </section>
  </div></main>;
}