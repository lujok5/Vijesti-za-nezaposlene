import fs from "fs";
import path from "path";

function ucitajVijesti() {
  try {
    const filePath = path.join(process.cwd(), "vijesti.json");
    if (!fs.existsSync(filePath)) return [];
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    return [];
  }
}

export default function Page() {
  const vijesti = ucitajVijesti();
  const glavnaVijest = vijesti[0] || {
    influencer: "Marko Jack",
    naslov: "Marko Jack opet probio dno?",
    tekst: "Analiza najnovijeg TikTok gafa koji je obilježio 2026. godinu.",
    kategorija: "TikTok Drama"
  };
  const sporedneVijesti = vijesti.slice(1);

  // Rang lista digitalaca
  const rangLista = [
    { ime: "Marko Jack", score: "99.8% šuplje", status: "Snima iz auta" },
    { ime: "Baka Prase", score: "95.2% dramatično", status: "Kupuje novi sat" },
    { ime: "Mihajlo Madić", score: "91.0% motivacija", status: "Dijeli savjete o uspjehu" },
    { ime: "Vanjorek obitelj", score: "88.5% obiteljski kaos", status: "Live uključivanje" },
    { ime: "Goldenito", score: "85.0% fleksanje", status: "Gleda u kameru" }
  ];

  return (
    <main className="min-h-screen bg-white text-[#36454F] font-sans">
      <header className="bg-[#001F3F] p-6 text-white text-center font-bold text-3xl tracking-tight border-b-4 border-[#FF8C00]">
        VIJESTI ZA NEZAPOSLENE
      </header>
      
      <nav className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-[1280px] mx-auto px-8 flex gap-8 text-sm font-bold text-[#001F3F] uppercase tracking-widest">
          <span className="border-b-2 border-[#FF8C00] cursor-pointer">Naslovnica</span>
          <span className="hover:text-[#FF8C00] cursor-pointer transition">TikTok Drama</span>
          <span className="hover:text-[#FF8C00] cursor-pointer transition">Digitalac Rang Lista</span>
          <span className="hover:text-[#FF8C00] cursor-pointer transition">Analize</span>
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto p-8 mt-12">
        {/* Glavna vijest */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-b pb-16">
          <div>
            <span className="bg-[#CC0000] text-white text-xs font-bold px-2 py-1 uppercase mb-4 inline-block">{glavnaVijest.kategorija}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#001F3F] leading-tight mb-6">{glavnaVijest.naslov}</h1>
            <p className="text-xl leading-relaxed mb-8">{glavnaVijest.tekst}</p>
            <div className="flex gap-4">
              <button className="bg-[#FF8C00] text-white px-8 py-4 rounded-sm font-bold shadow-lg hover:brightness-110 transition">PROČITAJ ANALIZU</button>
            </div>
          </div>
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 h-[400px] flex flex-col items-center justify-center relative overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-[#001F3F]/10 to-transparent"></div>
            <p className="text-gray-400 font-bold uppercase tracking-tighter text-3xl opacity-20">{glavnaVijest.influencer}</p>
            <div className="z-10 text-center p-6">
              <div className="w-20 h-1 bg-[#FF8C00] mx-auto mb-4"></div>
              <p className="text-[#001F3F] font-medium italic">"Uživo sa TikToka – dok ti tražiš posao."</p>
            </div>
          </div>
        </section>

        {/* Digitalac Rang Lista i Ostale vijesti */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-[#001F3F] border-l-8 border-[#FF8C00] pl-4 mb-8">NAJNOVIJE VIJESTI S MREŽA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sporedneVijesti.map((v, index) => (
                <div key={index} className="border border-gray-200 shadow-sm hover:shadow-xl transition p-6 rounded-md bg-white">
                  <span className="text-[#FF8C00] text-xs font-bold uppercase">{v.kategorija}</span>
                  <h3 className="text-lg font-bold text-[#001F3F] mt-2 mb-3">{v.naslov}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.tekst}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Digitalac Rang Lista */}
          <aside className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-[#001F3F] mb-6 border-b pb-3 flex items-center justify-between">
              <span>Digitalac Rang Lista</span>
              <span className="text-xs bg-[#CC0000] text-white px-2 py-1 rounded">TOP LISTA</span>
            </h3>
            <div className="space-y-4">
              {rangLista.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded border border-gray-200 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                    <h4 className="font-bold text-[#001F3F]">{item.ime}</h4>
                    <p className="text-xs text-gray-500">{item.status}</p>
                  </div>
                  <span className="text-sm font-bold text-[#FF8C00]">{item.score}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#001F3F] text-white mt-32 p-12 text-center text-sm opacity-90">
        <p>&copy; 2026 VIJESTI ZA NEZAPOSLENE - Sva prava pridržana onima koji nemaju pametnijeg posla.</p>
      </footer>
    </main>
  );
}