import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export type Article = {
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
  created_by?: string | null;
  is_automated?: boolean;
  created_at?: string;
  source_count?: number;
};

export type ArticleSource = { news_id: string; source_name: string; source_url: string; source_title: string; published_at?: string | null };

export function categorySlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function formatDate(value?: string | null) {
  if (!value) return "Vrijeme objave nije dostupno";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Vrijeme objave nije dostupno" : date.toLocaleString("hr-HR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function loadLocalNews(): Article[] {
  try {
    const file = path.join(process.cwd(), "vijesti.json");
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) as Article[] : [];
  } catch {
    return [];
  }
}

export async function loadNews(): Promise<Article[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    try {
      const supabase = createClient(url, key, { auth: { persistSession: false } });
      const { data, error } = await supabase.from("news")
        .select("id,influencer,title,body,category,image_url,source_name,source_url,published_at,is_featured,created_by,is_automated,created_at")
        .eq("published", true);
      if (!error) {
        let articles = (data ?? []) as Article[];
        articles = articles.map((article) => article.category === "Satira" ? { ...article, category: "Ekskluzivno" } : article);
        const ids = articles.flatMap((article) => article.id ? [article.id] : []);
        if (ids.length) {
          const { data: sources, error: sourcesError } = await supabase.from("news_sources")
            .select("news_id,source_name,source_url,source_title,published_at")
            .in("news_id", ids);
          if (!sourcesError && sources) {
            const counts = new Map<string, number>();
            for (const source of sources as ArticleSource[]) counts.set(source.news_id, (counts.get(source.news_id) ?? 0) + 1);
            articles = articles.map((article) => ({ ...article, source_count: Math.max(counts.get(article.id!) ?? 0, 1) }));
          }
        }
        return articles.sort((a, b) => {
          const priorityA = a.created_by ? 0 : a.is_automated ? 1 : 0;
          const priorityB = b.created_by ? 0 : b.is_automated ? 1 : 0;
          if (priorityA !== priorityB) return priorityA - priorityB;
          return new Date(b.created_at ?? b.published_at ?? 0).getTime() - new Date(a.created_at ?? a.published_at ?? 0).getTime();
        });
      }
    } catch {
      // Keep the site available with the bundled news if Supabase is unavailable.
    }
  }
  return url && key ? [] : loadLocalNews().map((article) => article.category === "Satira" ? { ...article, category: "Ekskluzivno" } : article);
}
