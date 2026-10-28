# Mokinių tarybos puslapis

Next.js + Neon (Postgres) + Vercel.

| Adresas | Kas ten |
|---|---|
| `/` | Pagrindinis: koliažas, kitas renginys, top idėjos, apklausa |
| `/idejos` | Idėjų dėžutė su ♥ balsavimu |
| `/apklausos` | Apklausos (1 balsas iš naršyklės) |
| `/renginiai` | Renginių kalendorius |
| `/klausimai` | Anoniminiai klausimai ir tarybos atsakymai |
| `/admin` | Tarybos pultas (slaptažodis) |

## 1. Neon duomenų bazė

1. [console.neon.tech](https://console.neon.tech) → savo projektas → **Connect**.
2. Nukopijuok **connection string** (pažymėk *Pooled connection*).
3. Projekto aplanke nukopijuok `.env.example` į `.env.local` ir įrašyk `DATABASE_URL` bei `ADMIN_PASSWORD`.
4. Terminale:

```bash
npm install
npm run db:setup   # sukuria lenteles + pavyzdinius duomenis
npm run dev        # http://localhost:3000
```

## 2. Vercel

1. Įkelk projektą į GitHub (naują repo).
2. [vercel.com/new](https://vercel.com/new) → importuok repo.
3. **Environment Variables** pridėk:
   - `DATABASE_URL`: tas pats Neon adresas
   - `ADMIN_PASSWORD`: ilgas slaptažodis tarybai
   - `NEXT_PUBLIC_SCHOOL_NAME`: pvz. `Mokinių taryba`
4. **Deploy**.

> Galima ir be rankinio kopijavimo: Vercel → projektas → **Storage** → **Neon** sujungia ir pats prideda `DATABASE_URL`. Tada `npm run db:setup` paleisk vieną kartą su tuo adresu `.env.local` faile.

## 3. Domenas `taryba.arnas.media`

1. Vercel → projektas → **Settings → Domains** → `taryba.arnas.media` → **Add**.
2. Hostinger hPanel → **Domains → arnas.media → DNS / Nameservers → DNS records**:
   - Type `CNAME`, Name `taryba`, Target: reikšmė, kurią rodo Vercel (dažniausiai `cname.vercel-dns.com`).
   - Jei jau yra įrašas pavadinimu `taryba`, pirmiausia jį ištrink.
3. Palauk 5–30 min., kol Vercel'yje atsiras žalia varnelė. HTTPS susikurs pats.

Vėliau `dgtaryba.lt` pridedamas tame pačiame **Domains** lange.

## Kaip veikia moderavimas

- **Idėjos** pasirodo viešai tik tada, kai taryba `/admin` paspaudžia „✓ Rodyti". Tada žmonės gali už jas balsuoti, o įgyvendintas galima pažymėti „✅ Įgyvendinta".
- **Klausimai** viešai rodomi tik kartu su tarybos atsakymu.
- Balsai sekami anonimišku slapuku naršyklėje. Tai mokyklai užtenka, bet kas labai nori, gali prabalsuoti iš kelių naršyklių.

## Dizainas

- Spalvos yra `app/globals.css` viršuje (`--mustard`, `--wine`, `--rose`…).
- Iškarpų raidžių antraštės: `components/Ransom.js` (`<Ransom text="Bet koks tekstas" seed={5} />`, `seed` keičia raidžių išdėstymą).
- Pagrindinio puslapio nuotrauka: `public/koliazas.jpg`. Pakeisk savo failu tuo pačiu pavadinimu.
