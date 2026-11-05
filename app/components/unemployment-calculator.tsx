"use client";

import { useMemo, useState } from "react";

type Country = "HR" | "RS";
const DAY = 86_400_000;

function easterSunday(year: number, julian = false) {
  if (!julian) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    return Date.UTC(year, month - 1, ((h + l - 7 * m + 114) % 31) + 1);
  }
  const a = year % 4, b = year % 7, c = year % 19;
  const d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31), day = ((d + e + 114) % 31) + 1;
  const julianDate = Date.UTC(year, month - 1, day);
  return julianDate + (year >= 2100 ? 14 : 13) * DAY;
}

function publicHolidays(year: number, country: Country) {
  const easter = easterSunday(year, country === "RS");
  const fixed = country === "HR"
    ? [[1, 1], [1, 6], [5, 1], [5, 30], [6, 22], [8, 5], [8, 15], [11, 1], [11, 18], [12, 25], [12, 26]]
    : [[1, 1], [1, 2], [1, 7], [2, 15], [2, 16], [5, 1], [5, 2], [11, 11]];
  const dates = new Set(fixed.map(([month, day]) => Date.UTC(year, month - 1, day)));
  if (country === "HR") {
    dates.add(easter + DAY);
    dates.add(easter + 60 * DAY); // Tijelovo, 60 days after Easter Sunday.
  } else {
    for (let offset = -2; offset <= 1; offset++) dates.add(easter + offset * DAY);
    // Serbian state holidays falling on Sunday move to the next working day.
    const original = Array.from(dates);
    for (const date of original) {
      const month = new Date(date).getUTCMonth();
      const isTransferable = month === 0 || month === 1 || month === 4 || month === 10;
      if (isTransferable && new Date(date).getUTCDay() === 0) {
        let observed = date + DAY;
        while (dates.has(observed) || new Date(observed).getUTCDay() === 0 || new Date(observed).getUTCDay() === 6) observed += DAY;
        dates.add(observed);
      }
    }
  }
  return dates;
}

function localToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default function UnemploymentCalculator() {
  const today = localToday();
  const [country, setCountry] = useState<Country>("HR");
  const [start, setStart] = useState(() => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCFullYear(date.getUTCFullYear() - 1);
    return date.toISOString().slice(0, 10);
  });
  const result = useMemo(() => {
    if (!start || start > today) return null;
    const from = Date.parse(`${start}T00:00:00Z`);
    const to = Date.parse(`${today}T00:00:00Z`);
    if (!Number.isFinite(from) || (to - from) / DAY > 36_525) return null;
    let workdays = 0, weekends = 0, weekdayHolidays = 0;
    const holidayCache = new Map<number, Set<number>>();
    for (let date = from; date <= to; date += DAY) {
      const year = new Date(date).getUTCFullYear();
      if (!holidayCache.has(year)) holidayCache.set(year, publicHolidays(year, country));
      const day = new Date(date).getUTCDay();
      if (day === 0 || day === 6) weekends++;
      else if (holidayCache.get(year)!.has(date)) weekdayHolidays++;
      else workdays++;
    }
    return { workdays, weekends, weekdayHolidays, calendarDays: Math.floor((to - from) / DAY) + 1 };
  }, [country, start, today]);

  return <section id="kalkulator-nerada" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7" aria-labelledby="unemployment-calculator-title">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Statistika neradnih dana</p>
    <h2 id="unemployment-calculator-title" className="mt-2 text-2xl font-black tracking-tight text-[#17243A] sm:text-3xl">Kalkulator nerada</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Upiši od kada ne radiš i pogledaj koliko je radnih dana prošlo bez posla.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="text-sm font-bold text-[#17243A]">Država
        <select value={country} onChange={(event) => setCountry(event.target.value as Country)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-medium">
          <option value="HR">Hrvatska</option><option value="RS">Srbija</option>
        </select>
      </label>
      <label className="text-sm font-bold text-[#17243A]">Početak nerada
        <input type="date" value={start} max={today} onChange={(event) => setStart(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-medium" />
      </label>
      <p className="text-xs leading-5 text-slate-500 sm:max-w-44">Računamo od početnog datuma do danas, uključujući današnji dan.</p>
    </div>
    {result ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="col-span-2 rounded-xl bg-[#17243A] p-4 text-white sm:col-span-1"><p className="text-xs font-bold uppercase tracking-wide text-slate-300">Radnih dana prošlo</p><p className="mt-1 text-3xl font-black">{result.workdays.toLocaleString("hr-HR")}</p></div>
      <div className="rounded-xl bg-[#F5F6F7] p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Kalendarskih dana</p><p className="mt-1 text-2xl font-black">{result.calendarDays.toLocaleString("hr-HR")}</p></div>
      <div className="rounded-xl bg-[#F5F6F7] p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Vikend-dana</p><p className="mt-1 text-2xl font-black">{result.weekends.toLocaleString("hr-HR")}</p></div>
      <div className="rounded-xl bg-[#F5F6F7] p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Praznika radnim danom</p><p className="mt-1 text-2xl font-black">{result.weekdayHolidays.toLocaleString("hr-HR")}</p></div>
    </div> : <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Odaberi valjan početni datum, najviše 100 godina unatrag.</p>}
    <p className="mt-4 text-xs leading-5 text-slate-500">Uključeni su opći državni praznici i vikendi. Ne računaju se individualni vjerski neradni dani, godišnji odmor ni bolovanje. Izvori: <a className="underline underline-offset-2" href="https://narodne-novine.nn.hr/clanci/sluzbeni/2019_11_110_2212.html" target="_blank" rel="noopener noreferrer">Hrvatska</a> · <a className="underline underline-offset-2" href="https://www.paragraf.rs/propisi/zakon_o_drzavnim_i_drugim_praznicima_u_republici_srbiji.html" target="_blank" rel="noopener noreferrer">Srbija</a>.</p>
  </section>;
}
