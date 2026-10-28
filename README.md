# Mokinių tarybos puslapis


Vėliau `dgtaryba.lt` pridedamas tame pačiame **Domains** lange.

## Kaip veikia moderavimas

- **Idėjos** pasirodo viešai tik tada, kai taryba `/admin` paspaudžia „✓ Rodyti". Tada žmonės gali už jas balsuoti, o įgyvendintas galima pažymėti „✅ Įgyvendinta".
- **Klausimai** viešai rodomi tik kartu su tarybos atsakymu.
- Balsai sekami anonimišku slapuku naršyklėje. Tai mokyklai užtenka, bet kas labai nori, gali prabalsuoti iš kelių naršyklių.

## Dizainas

- Spalvos yra `app/globals.css` viršuje (`--mustard`, `--wine`, `--rose`…).
- Iškarpų raidžių antraštės: `components/Ransom.js` (`<Ransom text="Bet koks tekstas" seed={5} />`, `seed` keičia raidžių išdėstymą).
- Pagrindinio puslapio nuotrauka: `public/koliazas.jpg`. Pakeisk savo failu tuo pačiu pavadinimu.
