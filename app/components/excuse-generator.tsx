"use client";

import { useState } from "react";

const excuses = [
  "Jutros sam otvorio/la oči, ali nisam osjetio/la poziv tržišta rada. Poštujem svoje osjećaje.",
  "Moj unutarnji HR odjel odobrio mi je još jedan dan bez sastanaka, rokova i hlača za posao.",
  "Danas ne mogu doći: kauč je zakazao hitan razgovor o ravnoteži između života i nerada.",
  "Laptop se upalio, ja nisam. Tehnički problem je na mojoj strani kreveta.",
  "Planirao/la sam krenuti, ali onda sam se sjetio/la da je sloboda moj omiljeni benefit.",
  "Ne dolazim danas. Moj osobni odbor za očuvanje nerada jednoglasno je glasao protiv.",
  "Imam neodgodivu obvezu: ne raditi ništa i odraditi to kvalitetno.",
  "Jutarnji alarm i ja smo se dogovorili da više ne surađujemo.",
];

export default function ExcuseGenerator() {
  const [excuse, setExcuse] = useState(excuses[0]);
  const [lastIndex, setLastIndex] = useState(0);

  function generate() {
    const next = Math.floor(Math.random() * (excuses.length - 1));
    const index = next >= lastIndex ? next + 1 : next;
    setLastIndex(index);
    setExcuse(excuses[index]);
  }

  return <section id="generator-izgovora" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-[#F5F6F7] p-4 sm:p-7" aria-labelledby="excuse-generator-title">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Alat za očuvanje slobodnog vremena</p>
    <h2 id="excuse-generator-title" className="mt-2 text-2xl font-black tracking-tight text-[#17243A] sm:text-3xl">Generator izgovora</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Nezaposlenost nije faza nego lifestyle. Generiraj uvjerljiv razlog zašto danas čuvaš svoju najdražu poziciju: izvan ureda.</p>
    <div aria-live="polite" className="mt-5 rounded-xl border border-slate-200 bg-white p-5 text-base font-semibold leading-7 text-[#17243A] sm:p-6 sm:text-lg">„{excuse}”</div>
    <button type="button" onClick={generate} className="mt-4 min-h-11 rounded-lg bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Daj mi novi izgovor</button>
  </section>;
}
