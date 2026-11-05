import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);

  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return respond({ error: "Prijavi se kao urednik." }, 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")
    ? JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")!)?.default
    : Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return respond({ error: "Prijava je istekla. Ponovno se prijavi." }, 401);
  const { data: editor, error: editorError } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (editorError || !editor) return respond({ error: "Ovaj račun nema uredničke ovlasti." }, 403);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return respond({ error: "Na Supabaseu nedostaje OPENAI_API_KEY." }, 500);
  let input: { person?: string; tiktokUrl?: string; context?: string; satire?: boolean };
  try { input = await request.json(); } catch { return respond({ error: "Neispravan zahtjev." }, 400); }
  const person = String(input.person ?? "").trim().slice(0, 120);
  const tiktokUrl = String(input.tiktokUrl ?? "").trim().slice(0, 2000);
  const context = String(input.context ?? "").trim().slice(0, 6000);
  if (!person) return respond({ error: "Upiši osobu ili digitalca." }, 400);
  if (!context && !tiktokUrl) return respond({ error: "Dodaj TikTok poveznicu ili kratak opis/transkript videa." }, 400);
  if (tiktokUrl) {
    try {
      const parsed = new URL(tiktokUrl);
      if (parsed.protocol !== "https:" || !["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"].includes(parsed.hostname.toLowerCase())) throw new Error();
    } catch { return respond({ error: "Unesi valjanu HTTPS poveznicu na TikTok." }, 400); }
  }

  const instructions = "Napiši urednički nacrt na hrvatskoj latinici prirodnim, razgovornim Gen Z tonom; duhovito i aktualno, ali bez forsiranog slenga, meme fraza i clickbaita. Vrati samo JSON objekt s poljima title, category, body. Odaberi category iz: Breaking News, Digitalci, Crna kronika, Ekonomija, Burza, Lifestyle, Ekskluzivno, Satira. Ako je satire=true, category mora biti 'Satira'; jasno označi priču kao izmišljenu i ne izmišljaj stvarne citate, optužbe ni događaje. Ako je satire=false, koristi samo činjenice iz predanog opisa/transkripta; poveznica sama nije dokaz sadržaja videa. Kad nema dovoljno podataka, predloži uredniku da zatraži dodatni opis. Predloži privlačan, ali činjeničan naslov do 180 znakova. Piši 2–4 sažeta odlomka i ne predstavljaj neprovjerene navode kao činjenice.";
  const userInput = "Return a json object with title, category, and body for this draft: " + JSON.stringify({ person, tiktokUrl: tiktokUrl || null, context: context || null, satire: Boolean(input.satire) });
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      instructions,
      input: userInput,
      max_output_tokens: 900,
      text: { format: { type: "json_object" } },
    }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const apiMessage = typeof errorBody?.error?.message === "string" ? errorBody.error.message : "Nepoznata OpenAI API greška.";
    console.error("OpenAI Responses API error", response.status, errorBody?.error?.type ?? "unknown", errorBody?.error?.code ?? "unknown");
    return respond({ error: `OpenAI API (${response.status}): ${apiMessage}` }, 502);
  }
  const result = await response.json();
  const output = (result.output ?? []).flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? []).find((item: { type?: string }) => item.type === "output_text")?.text;
  if (!output) return respond({ error: "AI nije vratio tekst nacrta." }, 502);
  try {
    const draft = JSON.parse(output.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    if (typeof draft.title !== "string" || typeof draft.category !== "string" || typeof draft.body !== "string") throw new Error();
    if (!new Set(["Breaking News", "Digitalci", "Crna kronika", "Ekonomija", "Burza", "Lifestyle", "Ekskluzivno", "Satira"]).has(draft.category)) draft.category = input.satire ? "Satira" : "Digitalci";
    return respond({ draft });
  } catch { return respond({ error: "AI je vratio neispravan nacrt. Pokušaj ponovno." }, 502); }
});
