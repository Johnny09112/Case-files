# Archiv obsahu v2 (kostkový model) — LEGACY

Tyto soubory patří k **v2 resolučnímu modelu** (d6 + tagy Násilí/Lest/Úplatek/Útěk
+ ridery + afinity uzlů + zranění/prokleté/zoufalé karty). Pivotem na **v3 slotovou
resoluci** (2026-07-23, rozhodnutí D14–D19) tato **mechanika padla**.

**Mechanika je mrtvá — TÓN a NÁPADY zůstávají referencí.** Suchý dobový humor,
kontrast úřední řeči a absurdní situace (loňská tlačenka, zlaté hodinky, „bratr od
cirkulárky"), reálie trasy Buffalo → New York a jména pronásledovatelů (Malone,
Brody) jsou pořád nejlepší kalibrace tónu pro v3 obsah.

**Nepoužívat mechanicky, neoživovat:** tagy, síla 1–3, afinity −2/0/+2, tvrdost
uzlu, prokleté/zoufalé karty, zranění. V3 ekvivalenty:
- `karty.yaml` → `obsah/veci.yaml` (5 statů místo tag+síla)
- `uzly.yaml` → `obsah/situace.yaml` (4 sloty + kotvy místo afinit)
- `cile.yaml` → `obsah/cile.yaml` (v3, přepíše se nad slotovým event-logem — zatím nevzniklo)
- `pronasledovatele.yaml` → `obsah/pronasledovatele.yaml` (v3, ruší stat/štítek + slotové léčka/konfrontace)

Nemazat bez pokynu designéra.
