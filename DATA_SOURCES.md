# Źródła danych

Stan weryfikacji usług: 7 września 2026 r.

| Dane | Źródło / usługa | Sposób użycia | CRS |
|---|---|---|---|
| Lokalizacje inwestycji | adresy i działki przekazane w opisie zadania; geokodowanie OpenStreetMap / Nominatim | statyczne punkty w aplikacji | EPSG:4326 |
| Mapa ulic | OpenStreetMap | kafelki XYZ | EPSG:3857 |
| Ortofotomapa standardowa | GUGiK / Geoportal, WMS `https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution`, warstwa `Raster` | podkład WMS pobierany na żądanie | EPSG:3857 |
| Działki ewidencyjne | GUGiK, ULDK `https://uldk.gugik.gov.pl/`, operacja `GetParcelByXY` | zapytanie po kliknięciu; atrybuty i geometria WKT | wejście i wynik EPSG:4326 |
| Granice i numery działek | GUGiK, KIEG `https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow`, warstwy `dzialki,numery_dzialek` | przezroczysta warstwa WMS włączana automatycznie od poziomu zbliżenia 16 | EPSG:3857 |
| Bryły 3D budynków | GUGiK, model 3D budynków: LOD2 (nalot 2017) oraz LOD1 (2024) dla powiatu 2478 Zabrze | `docs/modele3d.js` — bryła obiektu we współrzędnych lokalnych, środek budynku w (0,0), oś Y na północ; podgląd rysowany na canvasie | źródło EPSG:2180 |
| Podkład pod modelem 3D | GUGiK / Geoportal, ten sam WMS ortofotomapy; zapasowo zdjęcia Esri (`World_Imagery/MapServer/export`) | pojedynczy `GetMap` na kwadrat wokół budynku, rysowany jako płaszczyzna terenu pod bryłami; usługa odpowiada 404 na nazwy parametrów pisane wielkimi literami, a i przy poprawnych bywa niestabilna (mniej więcej co trzecie żądanie), stąd dwie próby i przejście na Esri | EPSG:3857 |
| Zdjęcia obiektów | nalot dronem, wrzesień 2026 | kadry z nagrania, `docs/obiekty/<litera>_<nr>.jpg` plus miniatury `_t.jpg` | — |

Bryły LOD2 mają zamodelowany kształt dachu i pochodzą z nalotu z 2017 r. Dwa obiekty —
**c** (Powiatowy Urząd Pracy) i **g** (Centrum Usług Społecznych) — pokazywane są z modelu
LOD1 2024: pierwszy został po 2017 r. przebudowany, drugiego w LOD2 brak. LOD1 nie modeluje
połaci, więc te dwie bryły to prostopadłościany, co sygnalizuje plakietka przy podglądzie.
Bryły rysowane są bez ścian odwróconych tyłem do kamery, więc są pełne i nie widać ich
wnętrza. Strony zewnętrznej nie da się wziąć z kolejności wierzchołków — w danych LOD2
ściany bywają nawinięte niekonsekwentnie — więc wyznaczana jest geometrycznie, względem
środka każdej bryły osobno. Dlatego zabudowa sąsiednia jest zapisana budynek po budynku
(pole `o`), a nie jednym zlepkiem.

Podgląd startuje z północą do góry, obraca się sam do pierwszego dotknięcia, przybliża
kółkiem lub dwoma palcami, a podwójne kliknięcie wraca do ustawienia wyjściowego.
Przycisk w prawym górnym rogu rozwija podgląd na cały ekran (Esc zamyka).
Ortofoto pod bryłami jest wpasowane na środek budynku wyliczony z modelu (pole `ll`),
nie na pozycję pinezki na mapie. Płaszczyzna terenu leży na najniższym punkcie całej sceny,
a nie na zerze budynku badanego — sąsiedzi stoją na własnych rzędnych i przy spadku terenu
sięgają nawet 3 m niżej, więc na płaszczyźnie na poziomie zera byliby częściowo wkopani.
Zdjęcie lotnicze i tak pokazuje te same budynki na płasko, więc przy niskim kącie widać
jednocześnie bryłę i jej odbicie w ortofoto — to nie jest błąd wpasowania.

Wysokość podana przy modelu to różnica rzędnych całej bryły — od terenu do najwyższego
punktu — i tak jest opisana pod podglądem. Dla trzech obiektów podano obok pomiar z terenu,
który mierzy co innego: **h** 8,80 m do dolnej krawędzi, **j** 14 m, **f** 9 m bez daszka.

Podgląd pokazuje też sąsiednią zabudowę (szare bryły) w promieniu 100 m, odsianą tak jak na
potrzeby PV*SOL: bez sektora północnego i bez budynków niższych od dachu, które cienia nie
rzucą. Badany obiekt jest wyróżniony kolorem. Bryły są zamknięte, więc wnętrza nie widać,
a oś pionowa podglądu jest ograniczona do zakresu 20–89°, żeby nie dało się obejrzeć
budynku od spodu. Przy górnej granicy patrzy się prawie pionowo, więc dach przykrywa obrys
i widać, czy bryła stoi na właściwym budynku.

Położenie brył sprawdzone przez ULDK: środek każdej z dziewięciu trafia w działkę podaną
w postępowaniu. Dla **g** i **h** oba budynki leżą na tej samej działce 1034/78, więc ten
test nie rozstrzyga, który z nich jest CUS-em, a który ogrzewalnią — to trzeba potwierdzić
wzrokowo. Pinezki tych dwóch obiektów na mapie stoją 33 i 78 m od faktycznych brył; przy
pozostałych rozjazd nie przekracza 4 m.

Punkt przy ul. Macieja Rataja ma charakter orientacyjny i wskazuje boisko treningowe. Dane działek są pobierane na żywo; ich dostępność zależy od działania usług źródłowych GUGiK i właściwego powiatu.
