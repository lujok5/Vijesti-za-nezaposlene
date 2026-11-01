import time
import json
import random

INFLUENCERI = [
    "Marko Jack", 
    "Mihajlo Madić", 
    "Vanjorek obitelj", 
    "Goldenito", 
    "Marko Filipović", 
    "Baka Prase",
    "Choda",
    "Mudja",
    "Barbi Afrika"
]

TEME = [
    "objavio novi TikTok iz auta i oprao sve koji rade za minimalac",
    "kupio novi auto na leasing pa snimio 44 storija o motivaciji",
    "posvađao se s drugim influencerom oko dijeljenja besplatnih ljetovanja",
    "izbacio novu merč kolekciju 'Nemoj raditi, budi gazda'",
    "plakao na storiju jer mu je algoritam smanjio preglednost"
]

def generiraj_vijesti():
    broj_vijesti = random.randint(3, 5)
    vijesti = []
    
    odabrani_influenceri = random.sample(INFLUENCERI, min(broj_vijesti, len(INFLUENCERI)))
    
    for influencer in odabrani_influenceri:
        tema = random.choice(TEME)
        naslov = f"{influencer} ponovno šokira javnost: {tema.capitalize()}!"
        tekst = f"U novom valu digitalnog očaja, {influencer} je odlučio obogatiti naš feed. Dok nezaposleni u regiji čekaju burzu, naš junak je izjavio da 'sve se može kad se hoće', naravno dok mu mama kuha ručak. Naša redakcija donosi duboku analizu ovog apsurda."
        
        vijesti.append({
            "influencer": influencer,
            "naslov": naslov,
            "tekst": tekst,
            "kategorija": random.choice(["TikTok Drama", "Uhljeb Kutak", "Financije & Život"])
        })
        
    return vijesti

if __name__ == "__main__":
    print("🤖 Bot skuplja najnovije gluposti s mreža...")
    vijesti = generiraj_vijesti()
    
    # Spremamo u JSON koji web stranica čita (u korijenu projekta)
    putanja = "C:\\Users\\Lujo\\Desktop\\vijesti-za-nezaposlene\\vijesti.json"
    with open(putanja, "w", encoding="utf-8") as f:
        json.dump(vijesti, f, ensure_ascii=False, indent=4)
        
    print(f"✅ Uspješno generirano {len(vijesti)} vijesti!")