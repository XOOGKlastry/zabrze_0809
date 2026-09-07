'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPinned, Navigation, PanelBottomOpen, X } from 'lucide-react';

type Site = { id:string; title:string; address:string; parcel:string; placement:string; power:string; lat:number; lng:number };

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
  const [ready,setReady]=useState(false); const [selected,setSelected]=useState<Site|null>(null);
  const [listOpen,setListOpen]=useState(false); const [locationStatus,setLocationStatus]=useState('');

  useEffect(()=>{
    if(!ready||!window.L||mapRef.current)return;
    const L=window.L; const map=L.map('map',{zoomControl:false,attributionControl:true,tap:true}); mapRef.current=map;
    L.control.zoom({position:'topright'}).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    const bounds:[number,number][]=[];
    sites.forEach(site=>{
      const icon=L.divIcon({className:'pv-marker-wrap',html:`<span class="pv-marker"><b>${site.id.toUpperCase()}</b></span>`,iconSize:[38,46],iconAnchor:[19,43],popupAnchor:[0,-39]});
      const marker=L.marker([site.lat,site.lng],{icon,title:`${site.id}) ${site.title}`}).addTo(map);
      marker.on('click',()=>setSelected(site)); markerRef.current[site.id]=marker; bounds.push([site.lat,site.lng]);
    });
    map.fitBounds(bounds,{paddingTopLeft:[22,100],paddingBottomRight:[22,125],maxZoom:14});
    return()=>{map.remove();mapRef.current=null;markerRef.current={}};
  },[ready]);

  const focusSite=(site:Site)=>{setSelected(site);setListOpen(false);mapRef.current?.flyTo([site.lat,site.lng],17,{duration:.8})};
  const showAll=()=>{mapRef.current?.fitBounds(sites.map(s=>[s.lat,s.lng]),{paddingTopLeft:[22,100],paddingBottomRight:[22,125],maxZoom:14});setSelected(null)};
  const locate=()=>{
    if(!navigator.geolocation){setLocationStatus('Lokalizacja jest niedostępna');return} setLocationStatus('Szukam…');
    navigator.geolocation.getCurrentPosition(({coords})=>{const L=window.L;L.circleMarker([coords.latitude,coords.longitude],{radius:8,color:'#fff',weight:3,fillColor:'#166534',fillOpacity:1}).addTo(mapRef.current).bindTooltip('Twoja lokalizacja').openTooltip();mapRef.current.flyTo([coords.latitude,coords.longitude],15);setLocationStatus('')},()=>setLocationStatus('Nie udało się pobrać lokalizacji'),{enableHighAccuracy:true,timeout:10000});
  };

  return <main className="app-shell">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
    <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossOrigin="" strategy="afterInteractive" onLoad={()=>setReady(true)} />
    <header className="topbar"><div className="brand-mark" aria-hidden="true"><span /></div><div><p className="eyebrow">Zabrze · 10 punktów</p><h1>Planowane instalacje PV</h1></div><button className="icon-button" onClick={()=>setListOpen(true)} aria-label="Otwórz listę obiektów"><PanelBottomOpen size={22}/></button></header>
    <section id="map" aria-label="Mapa lokalizacji planowanych instalacji fotowoltaicznych" />
    <div className="map-actions"><button onClick={showAll}><MapPinned size={18}/>Wszystkie</button><button onClick={locate}><LocateFixed size={18}/>Moja pozycja</button></div>
    {locationStatus&&<div className="status" role="status">{locationStatus}</div>}
    {!selected&&!listOpen&&<button className="hint-card" onClick={()=>setListOpen(true)}><span className="hint-icon"><MapPinned size={21}/></span><span><strong>Wybierz punkt na mapie</strong><small>Zobacz obiekt, działkę i planowaną moc</small></span><span className="count">10</span></button>}
    {selected&&<article className="detail-card" aria-live="polite"><button className="close" onClick={()=>setSelected(null)} aria-label="Zamknij szczegóły"><X size={20}/></button><div className="detail-heading"><span className="letter">{selected.id}</span><div><p>{selected.address}</p><h2>{selected.title}</h2></div></div><div className="facts"><div><span>Zakres</span><strong>{selected.placement}</strong></div><div><span>Moc</span><strong>{selected.power}</strong></div><div><span>Działka</span><strong>{selected.parcel}</strong></div></div><a className="directions" href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer"><Navigation size={18}/>Wyznacz trasę</a></article>}
    {listOpen&&<section className="sheet" aria-label="Lista obiektów"><div className="sheet-head"><div><p className="eyebrow">11 instalacji · 10 pozycji</p><h2>Obiekty</h2></div><button className="icon-button" onClick={()=>setListOpen(false)} aria-label="Zamknij listę"><X size={22}/></button></div><div className="site-list">{sites.map(site=><button key={site.id} onClick={()=>focusSite(site)}><span className="letter">{site.id}</span><span><strong>{site.title}</strong><small>{site.address}</small><em>{site.power}</em></span></button>)}</div><p className="source-note">Położenie punktów ustalono na podstawie podanych adresów i danych OpenStreetMap. Punkt przy ul. Rataja ma charakter orientacyjny — wskazuje boisko treningowe.</p></section>}
  </main>;
}
