import UnemploymentCalculator from "../components/unemployment-calculator";
import ExcuseGenerator from "../components/excuse-generator";

export const metadata = { title: "Nerad | Vijesti za nezaposlene", description: "Kalkulator nerada i generator izgovora za ljubitelje slobodnog vremena." };

export default function NeradPage() {
  return <main className="min-h-screen w-full overflow-x-clip bg-white font-sans text-[#17243A]">
    <header className="border-b border-[#17243A] bg-[#17243A] px-3 py-4 text-white sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <a href="/" aria-label="Naslovnica" className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white"><img src="/logo-vijesti.png" alt="" className="h-full w-full object-cover" /></a>
        <a href="/" className="min-w-0 truncate text-base font-black tracking-tight sm:text-2xl">VIJESTI ZA NEZAPOSLENE</a>
      </div>
    </header>
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <a href="/" className="text-sm font-bold text-red-700 hover:text-red-800">← Naslovnica</a>
      <div className="mb-6 mt-5 border-b border-slate-200 pb-5 sm:mb-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Rubrika</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Nerad</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Naš mali kutak za one koji vjeruju da je najbolji work-life balance onaj u kojem work dio ne postoji.</p>
        <nav aria-label="Alati za nerad" className="mt-5 flex flex-wrap gap-2">
          <a href="#kalkulator-nerada" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-[#17243A] hover:border-red-500">Kalkulator nerada</a>
          <a href="#generator-izgovora" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-[#17243A] hover:border-red-500">Generator izgovora</a>
        </nav>
      </div>
      <div className="grid min-w-0 gap-5 sm:gap-7">
        <UnemploymentCalculator />
        <ExcuseGenerator />
      </div>
    </div>
    <footer className="mt-8 border-t border-slate-200 bg-[#F5F6F7] px-5 py-6 text-center text-xs text-slate-500">Vijesti za nezaposlene · Nerad, ali s planom.</footer>
  </main>;
}
