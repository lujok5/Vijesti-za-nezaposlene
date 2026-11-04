type City = { name: string; latitude: number; longitude: number; timezone: string };
type Forecast = {
  current?: { temperature_2m: number; apparent_temperature: number; weather_code: number };
  daily?: { temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; weather_code: number[] };
};
type WeatherResult = { city: string; current: Forecast["current"]; daily: { high: number; low: number; rainChance: number; code: number } | null; error?: boolean };

const cities: City[] = [
  { name: "Zagreb", latitude: 45.815, longitude: 15.982, timezone: "Europe/Zagreb" },
  { name: "Beograd", latitude: 44.787, longitude: 20.449, timezone: "Europe/Belgrade" },
];

function weatherDescription(code: number) {
  if (code === 0) return "Vedro";
  if (code <= 3) return "Djelomice oblačno";
  if (code <= 48) return "Magla";
  if (code <= 57) return "Rosulja";
  if (code <= 67) return "Kiša";
  if (code <= 77) return "Snijeg";
  if (code <= 82) return "Pljuskovi";
  if (code <= 86) return "Snježni pljuskovi";
  return "Grmljavinsko nevrijeme";
}

async function getForecast(city: City): Promise<WeatherResult> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "temperature_2m,apparent_temperature,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
    forecast_days: "1",
    timezone: city.timezone,
  }).toString();
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Weather API returned ${response.status}`);
    const data = await response.json() as Forecast;
    const daily = data.daily;
    return {
      city: city.name,
      current: data.current,
      daily: daily?.temperature_2m_max?.[0] == null ? null : {
        high: daily.temperature_2m_max[0],
        low: daily.temperature_2m_min[0],
        rainChance: daily.precipitation_probability_max[0],
        code: daily.weather_code[0],
      },
    };
  } catch {
    return { city: city.name, current: undefined, daily: null, error: true };
  }
}

export default async function CityWeather() {
  const forecasts = await Promise.all(cities.map(getForecast));
  return (
    <section className="rounded-2xl border border-slate-200 bg-[#F5F6F7] p-5 sm:p-7" aria-labelledby="weather-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Meteo za tražitelje posla</p>
          <h2 id="weather-title" className="mt-2 text-2xl font-black tracking-tight text-[#17243A] sm:text-3xl">Prognoza neradnog dana</h2>
        </div>
        <span className="text-xs font-semibold text-slate-500">Ažurira se svaki sat</span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {forecasts.map((forecast) => (
          <article key={forecast.city} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#17243A]">{forecast.city}</h3>
                {forecast.current && <p className="mt-1 text-sm font-medium text-slate-600">{weatherDescription(forecast.current.weather_code)}</p>}
              </div>
              {forecast.current && <p className="text-4xl font-black tracking-tight text-[#17243A]">{Math.round(forecast.current.temperature_2m)}°</p>}
            </div>
            {forecast.current && forecast.daily ? <>
              <p className="mt-4 text-sm text-slate-600">Danas {Math.round(forecast.current.temperature_2m)} °C, idealno vrijeme za neodlazak na posao.</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
                <span>Osjećaj {Math.round(forecast.current.apparent_temperature)} °C</span>
                <span>Min. {Math.round(forecast.daily.low)}° · maks. {Math.round(forecast.daily.high)}°</span>
                <span>Kiša {Math.round(forecast.daily.rainChance)}%</span>
              </div>
            </> : <p className="mt-4 text-sm text-slate-500">Prognoza trenutačno nije dostupna.</p>}
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Podaci o vremenu: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-slate-300 underline-offset-2 hover:text-[#17243A]">Open‑Meteo</a>.</p>
    </section>
  );
}
