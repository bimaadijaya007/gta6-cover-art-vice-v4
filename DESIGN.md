# DESIGN.md — Vice Cover Studio (gta6-cover-art-01, v4)

Konsep: web app offline yang mengubah foto + caption menjadi cover art gaya
poster GTA 6: komposisi multi-panel ala poster klasik, palet sunset/neon
Vice City, judul besar tebal miring dengan outline hitam.

## Komposisi
- Layout "Vice Trio" (default): panel hero besar di kiri (2/3 lebar) + dua
  vignette bertumpuk di kanan. Layout "Duo": dua panel berdampingan.
  Layout "Full-bleed": satu foto penuh.
- Setiap panel memakai foto dari slot A/B/C. Slot kosong memakai foto
  sampel bawaan supaya app langsung jalan satu klik.

## Foto
- Upload sampai 3 foto (input file, dibaca sebagai data URL, disimpan di
  memori). Atau 1 foto dipakai ulang di semua panel.
- 2 foto sampel bawaan di app/samples/: boulevard.jpg, pier.jpg.
- Per panel: slider zoom (1–2.5x) dan drag langsung di canvas untuk pan.
  Gambar di-crop cover-fit ke dalam panel (tidak distorsi).

## Caption
- Judul besar: huruf tebal (system sans-serif, weight 900), putih dengan
  outline hitam tebal, sedikit miring (-3 derajat), huruf kapital.
- Tagline kecil di bawah judul, putih dengan bayangan hitam.
- Edit live dari dua input teks; judul default "VICE CITY".

## Grade warna (di atas canvas, sebelum caption)
- Sunset: gradien pink→oranye, mode screen di bagian atas + multiply bawah.
- Neon Nights: overlay magenta di kiri, cyan di kanan, alpha rendah.
- Vice Pink: wash pink merata + kontras naik.
- Golden Hour: wash kuning hangat + vignette gelap di tepi.
- Implementasi: gambar foto, lalu overlay gradien dengan
  globalCompositeOperation, lalu vignette radial, lalu caption.

## Export
- Canvas offscreen sesuai ukuran: 1080x1080, 1080x1350, 1920x1080.
- Tombol Export mengunduh PNG (toBlob + a[download]).

## Mode screenshot (?shot=)
- ?shot=cover → layout Trio, foto pier, caption default, 1080x1080.
- ?shot=duo → layout Duo, caption + grade beda.
- ?shot=portrait → layout Trio, 1080x1350.
- ?shot=editor → tampilkan UI editor lengkap dengan foto sampel termuat.
- Setelah gambar selesai, set window.__shotReady = true.

## Struktur file
- app/index.html — shell: toolbar (layout, grade, caption, export), stage
  canvas, kontrol per panel (pilih foto, zoom).
- app/style.css — tema gelap neon, panel kontrol di samping canvas.
- app/src/cover.js — murni menggambar: layout rect, grade, caption.
- app/src/main.js — state, upload, drag pan, wiring UI, export.
- app/src/shots.js — baca ?shot=, preset, __shotReady.
- main.ts — salin app/ + screenshots/ ke $MAKEFUN_OUTPUT_DIR, tulis
  dossier.json via buildDossier dari vendor/makefun-app.ts.
- Tanpa library, tanpa network, tanpa font file, tanpa logo Rockstar.

## Aturan tulis
- Semua file custom ditulis di sesi ini dari design note ini.
- vendor/makefun-app.ts dan LICENSE milik kit: jangan diubah.
