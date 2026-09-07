# Źródła danych

Stan weryfikacji usług: 7 września 2026 r.

| Dane | Źródło / usługa | Sposób użycia | CRS |
|---|---|---|---|
| Lokalizacje inwestycji | adresy i działki przekazane w opisie zadania; geokodowanie OpenStreetMap / Nominatim | statyczne punkty w aplikacji | EPSG:4326 |
| Mapa ulic | OpenStreetMap | kafelki XYZ | EPSG:3857 |
| Ortofotomapa standardowa | GUGiK / Geoportal, WMS `https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution`, warstwa `Raster` | podkład WMS pobierany na żądanie | EPSG:3857 |
| Działki ewidencyjne | GUGiK, ULDK `https://uldk.gugik.gov.pl/`, operacja `GetParcelByXY` | zapytanie po kliknięciu; atrybuty i geometria WKT | wejście i wynik EPSG:4326 |

Punkt przy ul. Macieja Rataja ma charakter orientacyjny i wskazuje boisko treningowe. Dane działek są pobierane na żywo; ich dostępność zależy od działania usług źródłowych GUGiK i właściwego powiatu.

