'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { Layers, LocateFixed, MapPinned, Navigation, PanelBottomOpen, X } from 'lucide-react';

type Site = { id:string; title:string; address:string; parcel:string; placement:string; power:string; lat:number; lng:number };
type Parcel = { id:string; number:string; region:string; commune:string; source:string };

const sites: Site[] = [
  { id:'a', title:'Boisko treningowe', address:'ul. Macieja Rataja, Zabrze', parcel:'1684/3, 1682/27', placement:'instalacja przy boisku treningowym', power:'do 50 kWp', lat:50.29503, lng:18.79772 },
  { id:'b', title:'GKS Walka Makoszowy', address:'ul. Jaskółcza 40, Zabrze', parcel:'1215/60 (dach) lub 1222/61, 2395/61 (teren)', placement:'dwie instalacje: na dachu lub na terenie', power:'2 × do 50 kWp', lat:50.28635, lng:18.78535 },
  { id:'c', title:'Powiatowy Urząd Pracy', address:'pl. Krakowski 9, Zabrze', parcel:'870/82', placement:'instalacja na budynku', power:'do 50 kWp', lat:50.30184, lng:18.78814 },
  { id:'d', title:'Budynek wielorodzinny', address:'ul. Legnicka 17, Zabrze', parcel:'1846/86', placement:'instalacja na budynku', power:'do 50 kWp', lat:50.26736, lng:18.76841 },
  { id:'e', title:'Hala Pogoń', address:'ul. Wolności 406, Zabrze', parcel:'4375/64', placement:'instalacja na budynku użyteczności publicznej', power:'do 50 kWp', lat:50.29644, lng:18.80581 },
  { id:'f', title:'Dom Harcerza', address:'ul. Wolności 350a, Zabrze', parcel:'4815/2', placement:'instalacja na budynku użyteczności publicznej', power:'do 50 kWp', lat:50.30149, lng:18.79572 },
  { id:'g', title:'Centrum Usług Społecznych', address:'ul. Stalmacha 7, Zabrze', parcel:'1034/78', placement:'instalacja na budynku użyteczności publicznej', power:'do 50 kWp', lat:50.30708, lng:18.79028 },
  { id:'h', title:'Ogrzewalnia', address:'ul. Stalmacha 7, Zabrze', parcel:'1034/78', placement:'instalacja na budynku użyteczności publicznej', power:'do 50 kWp', lat:50.30696, lng:18.79051 },
  { id:'i', title:'Punkt Obsługi Mieszkańców nr 1', address:'ul. 3 Maja 84, Zabrze', parcel:'875/35', placement:'instalacja na budynku wielorodzinnym', power:'do 50 kWp', lat:50.29114, lng:18.79193 },
  { id:'j', title:'Budynek użyteczności publicznej', address:'ul. Karola Miarki 5, Zabrze', parcel:'1741/107', placement:'instalacja na budynku', power:'do 50 kWp', lat:50.30863, lng:18.78460 },
];

declare global { interface Window { L:any } }

export default function Home() {
  const mapRef=useRef<any>(null); const markerRef=useRef<Record<string,any>>({});
  const osmRef=useRef<any>(null); const orthoRef=useRef<any>(null); const parcelLayerRef=useRef<any>(null);
  const [ready,setReady]=useState(false); const [selected,setSelected]=useState<Site|null>(null);
  const [listOpen,setListOpen]=useState(false); const [locationStatus,setLocationStatus]=useState('');
  const [baseMap,setBaseMap]=useState<'map'|'ortho'>('map'); const [parcel,setParcel]=useState<Parcel|null>(null); const [parcelStatus,setParcelStatus]=useState('');

  useEffect(()=>{
    if(!ready||!window.L||mapRef.current)return;
    const L=window.L; const map=L.map('map',{zoomControl:false,attributionControl:true,tap:true}); mapRef.current=map;
    L.control.zoom({position:'topright'}).addTo(map);
    const osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    const ortho=L.tileLayer.wms('https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution',{layers:'Raster',format:'image/jpeg',version:'1.3.0',transparent:false,maxZoom:21,attribution:'Ortofotomapa &copy; GUGiK / Geoportal'});
    map.createPane('cadastre');map.getPane('cadastre').style.zIndex='420';map.getPane('cadastre').style.pointerEvents='none';
    const cadastre=L.tileLayer.wms('https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow',{layers:'dzialki,numery_dzialek',format:'image/png',version:'1.1.1',transparent:true,maxZoom:21,pane:'cadastre',attribution:'Ewidencja gruntów &copy; GUGiK / KIEG'});
    const updateCadastre=()=>{if(map.getZoom()>=16){if(!map.hasLayer(cadastre))cadastre.addTo(map)}else if(map.hasLayer(cadastre))map.removeLayer(cadastre)};
    map.on('zoomend',updateCadastre);
    osmRef.current=osm; orthoRef.current=ortho;
    const bounds:[number,number][]=[];
    sites.forEach(site=>{
      const icon=L.divIcon({className:'pv-marker-wrap',html:`<span class="pv-marker"><b>${site.id.toUpperCase()}</b></span>`,iconSize:[38,46],iconAnchor:[19,43],popupAnchor:[0,-39]});
      const marker=L.marker([site.lat,site.lng],{icon,title:`${site.id}) ${site.title}`,bubblingMouseEvents:false}).addTo(map);
      marker.on('click',()=>setSelected(site)); markerRef.current[site.id]=marker; bounds.push([site.lat,site.lng]);
    });
    map.on('click',async(event:any)=>{
      setSelected(null); setParcel(null); setParcelStatus('Sprawdzam działkę…');
      const {lat,lng}=event.latlng;
      const url=`https://uldk.gugik.gov.pl/?request=GetParcelByXY&xy=${lng},${lat},4326&result=id,parcel,region,commune,county,voivodeship,datasource,geom_wkt&srid=4326`;
      try{
        const response=await fetch(url); if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const lines=(await response.text()).trim().split(/\r?\n/); if(lines[0]!=='0'||!lines[1])throw new Error('Brak działki');
        const values=lines.slice(1).join('\n').split('|');
        const wkt=values.slice(7).join('|'); const pairs=[...wkt.matchAll(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)].map(match=>[Number(match[2]),Number(match[1])]);
        if(parcelLayerRef.current)map.removeLayer(parcelLayerRef.current);
        if(pairs.length>2)parcelLayerRef.current=L.polygon(pairs,{color:'#facc15',weight:4,fillColor:'#facc15',fillOpacity:.18}).addTo(map);
        setParcel({id:values[0],number:values[1],region:values[2],commune:values[3],source:values[6]}); setParcelStatus('');
      }catch{setParcelStatus('Nie udało się ustalić działki w tym miejscu')}
    });
    map.fitBounds(bounds,{paddingTopLeft:[22,100],paddingBottomRight:[22,125],maxZoom:14});
    updateCadastre();
    return()=>{map.remove();mapRef.current=null;markerRef.current={}};
  },[ready]);

  const focusSite=(site:Site)=>{setSelected(site);setListOpen(false);mapRef.current?.flyTo([site.lat,site.lng],17,{duration:.8})};
  const showAll=()=>{mapRef.current?.fitBounds(sites.map(s=>[s.lat,s.lng]),{paddingTopLeft:[22,100],paddingBottomRight:[22,125],maxZoom:14});setSelected(null)};
  const toggleBaseMap=()=>{
    const map=mapRef.current;if(!map)return;
    if(baseMap==='map'){map.removeLayer(osmRef.current);orthoRef.current.addTo(map);setBaseMap('ortho')}else{map.removeLayer(orthoRef.current);osmRef.current.addTo(map);setBaseMap('map')}
  };
  const locate=()=>{
    if(!navigator.geolocation){setLocationStatus('Lokalizacja jest niedostępna');return} setLocationStatus('Szukam…');
    navigator.geolocation.getCurrentPosition(({coords})=>{const L=window.L;L.circleMarker([coords.latitude,coords.longitude],{radius:8,color:'#fff',weight:3,fillColor:'#166534',fillOpacity:1}).addTo(mapRef.current).bindTooltip('Twoja lokalizacja').openTooltip();mapRef.current.flyTo([coords.latitude,coords.longitude],15);setLocationStatus('')},()=>setLocationStatus('Nie udało się pobrać lokalizacji'),{enableHighAccuracy:true,timeout:10000});
  };

  return <main className="app-shell">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
    <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossOrigin="" strategy="afterInteractive" onLoad={()=>setReady(true)} />
    <header className="topbar"><div className="brand-mark" aria-hidden="true"><span /></div><div><p className="eyebrow">Zabrze · 10 punktów</p><h1>Planowane instalacje PV</h1></div><button className="icon-button" onClick={()=>setListOpen(true)} aria-label="Otwórz listę obiektów"><PanelBottomOpen size={22}/></button></header>
    <section id="map" aria-label="Mapa lokalizacji planowanych instalacji fotowoltaicznych" />
    <div className="map-actions"><button onClick={showAll}><MapPinned size={18}/>Wszystkie</button><button onClick={toggleBaseMap} aria-pressed={baseMap==='ortho'}><Layers size={18}/>{baseMap==='ortho'?'Mapa':'Ortofoto'}</button><button className="locate-action" onClick={locate}><LocateFixed size={18}/><span>Moja pozycja</span></button></div>
    {(locationStatus||parcelStatus)&&<div className="status" role="status">{locationStatus||parcelStatus}</div>}
    {!selected&&!parcel&&!listOpen&&!parcelStatus&&<button className="hint-card" onClick={()=>setListOpen(true)}><span className="hint-icon"><MapPinned size={21}/></span><span><strong>Dotknij mapy, aby sprawdzić działkę</strong><small>Albo wybierz jeden z 10 punktów inwestycji</small></span><span className="count">10</span></button>}
    {selected&&<article className="detail-card" aria-live="polite"><button className="close" onClick={()=>setSelected(null)} aria-label="Zamknij szczegóły"><X size={20}/></button><div className="detail-heading"><span className="letter">{selected.id}</span><div><p>{selected.address}</p><h2>{selected.title}</h2></div></div><div className="facts"><div><span>Zakres</span><strong>{selected.placement}</strong></div><div><span>Moc</span><strong>{selected.power}</strong></div><div><span>Działka</span><strong>{selected.parcel}</strong></div></div><a className="directions" href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer"><Navigation size={18}/>Wyznacz trasę</a></article>}
    {parcel&&<article className="parcel-card" aria-live="polite"><button className="close" onClick={()=>{setParcel(null);if(parcelLayerRef.current)mapRef.current?.removeLayer(parcelLayerRef.current)}} aria-label="Zamknij informację o działce"><X size={20}/></button><p className="eyebrow">Działka wskazana na mapie</p><h2>{parcel.number}</h2><dl><div><dt>Identyfikator</dt><dd>{parcel.id}</dd></div><div><dt>Obręb</dt><dd>{parcel.region}</dd></div><div><dt>Gmina</dt><dd>{parcel.commune}</dd></div></dl><p className="parcel-source">Źródło: ULDK GUGiK · {parcel.source}</p></article>}
    {listOpen&&<section className="sheet" aria-label="Lista obiektów"><div className="sheet-head"><div><p className="eyebrow">11 instalacji · 10 pozycji</p><h2>Obiekty</h2></div><button className="icon-button" onClick={()=>setListOpen(false)} aria-label="Zamknij listę"><X size={22}/></button></div><div className="site-list">{sites.map(site=><button key={site.id} onClick={()=>focusSite(site)}><span className="letter">{site.id}</span><span><strong>{site.title}</strong><small>{site.address}</small><em>{site.power}</em></span></button>)}</div><p className="source-note">Mapa ulic: OpenStreetMap. Ortofotomapa i działki: GUGiK / Geoportal (ULDK). Punkt przy ul. Rataja ma charakter orientacyjny — wskazuje boisko treningowe.</p></section>}
  </main>;
}
