import { useState, useEffect, useMemo } from "react";

// ============================================================
// DATA
// ============================================================
const INIT_ENGINES = [
  {id:"en1",name:"CatÃƒÂ©gorie",icon:"\u25C9",color:"#b026ff",description:"Classe par catÃƒÂ©gorie thÃƒÂ©matique.",mode:"select",extractRaw:false,values:[{v:"RÃƒÂ©glementation",on:true},{v:"Politique",on:true},{v:"Innovation",on:true},{v:"AAP",on:true},{v:"Dispositif",on:true},{v:"Acquisition",on:true}],active:true,isDefault:true},
  {id:"en2",name:"Montant",icon:"\u20AC",color:"#ffb800",description:"Extrait montants et budgets.",mode:"range",extractRaw:false,values:[{v:"< 10K",on:true},{v:"10K-100K",on:true},{v:"100K-1M",on:true},{v:"1M-10M",on:true},{v:"10M-100M",on:true},{v:"> 100M",on:true}],active:true,isDefault:true},
  {id:"en3",name:"GÃƒÂ©ographie",icon:"\u25C7",color:"#3b82f6",description:"PortÃƒÂ©e gÃƒÂ©ographique.",mode:"scale",extractRaw:false,values:[{v:"Local",on:true},{v:"RÃƒÂ©gional",on:true},{v:"National",on:true},{v:"EuropÃƒÂ©en",on:true},{v:"International",on:true}],active:true,isDefault:true},
  {id:"en4",name:"Sentiment",icon:"\u25C6",color:"#22c55e",description:"Ton gÃƒÂ©nÃƒÂ©ral.",mode:"scale",extractRaw:false,values:[{v:"Positif",on:true},{v:"Neutre",on:true},{v:"NÃƒÂ©gatif",on:true}],active:true,isDefault:true},
  {id:"en5",name:"Secteur",icon:"\u2B21",color:"#f97316",description:"Secteurs d'activitÃƒÂ©.",mode:"select",extractRaw:false,values:[{v:"Industrie",on:true},{v:"Ãƒâ€°nergie",on:true},{v:"NumÃƒÂ©rique",on:true},{v:"SantÃƒÂ©",on:true},{v:"Finance",on:true}],active:true,isDefault:true},
  {id:"en6",name:"TemporalitÃƒÂ©",icon:"\u23F1",color:"#ef4444",description:"Urgence et horizon.",mode:"scale",extractRaw:false,values:[{v:"ImmÃƒÂ©diat",on:true},{v:"Court terme",on:true},{v:"Moyen terme",on:true},{v:"Long terme",on:true}],active:true,isDefault:true},
];

const INIT_SRC=[
  {id:"sf1",name:"Concurrence",color:"#ffb800",exp:true,sources:[{id:"s1",name:"TechCrunch",type:"rss",ok:true,withStatic:false},{id:"s2",name:"Reuters",type:"rss",ok:true,withStatic:false}]},
  {id:"sf2",name:"RÃƒÂ©glementaire",color:"#b026ff",exp:true,sources:[{id:"s3",name:"EUR-Lex",type:"scrape",ok:true,withStatic:true},{id:"s4",name:"LÃƒÂ©gifrance",type:"rss",ok:true,withStatic:true}]},
  {id:"sf3",name:"Politique",color:"#ff003c",exp:false,sources:[{id:"s5",name:"Le Monde",type:"rss",ok:true,withStatic:false}]},
  {id:"sf4",name:"Tech",color:"#00f0ff",exp:false,sources:[{id:"s6",name:"Hacker News",type:"rss",ok:true,withStatic:false}]},
];

const INIT_ARTS=[
  {id:"a1",sf:["sf2"],sn:"DREETS",sc:"#b026ff",st:"DREETS",rg:"Hauts-de-France",title:"FTJ : Appel ÃƒÂ  projets industrie et transition ÃƒÂ©cologique",sum:"AAP transition ÃƒÂ©nergÃƒÂ©tique Hauts-de-France. Budget 2.5M euros.",url:"#",date:"Il y a 20h",an:{},ai:null,notes:[],content:"Le FTJ lance un AAP dans les Hauts-de-France. Budget : 2.5M euros.",cluster:null},
  {id:"a2",sf:["sf1","sf4"],sn:"TechCrunch",sc:"#ffb800",title:"L'IA gÃƒÂ©nÃƒÂ©rative bouleverse le SaaS B2B",sum:"78% des ÃƒÂ©diteurs B2B ont intÃƒÂ©grÃƒÂ© l'IA. 45Mds dollars au T1 2026.",url:"#",date:"Il y a 2h",an:{},ai:null,notes:[],content:"L'IA transforme le SaaS B2B. 45Mds dollars T1 2026.",cluster:"c1"},
  {id:"a3",sf:["sf2"],sn:"LÃƒÂ©gifrance",sc:"#b026ff",title:"DÃƒÂ©cret 2026-287 : cybersÃƒÂ©curitÃƒÂ© opÃƒÂ©rateurs essentiels",sum:"SystÃƒÂ¨mes certifiÃƒÂ©s ANSSI. Signalement 24h. Sanctions 4% CA.",url:"#",date:"Il y a 5h",an:{},ai:null,notes:[],content:"DÃƒÂ©cret 2026-287 : certifications ANSSI, signalement 24h.",cluster:null},
  {id:"a4",sf:["sf3"],sn:"Le Monde",sc:"#ff003c",title:"Remaniement : ministre dÃƒÂ©lÃƒÂ©guÃƒÂ© NumÃƒÂ©rique et IA",sum:"CrÃƒÂ©ation ministÃƒÂ¨re NumÃƒÂ©rique et IA. StratÃƒÂ©gie nationale.",url:"#",date:"Il y a 3h",an:{},ai:null,notes:[],content:"L'Ãƒâ€°lysÃƒÂ©e crÃƒÂ©e un ministÃƒÂ¨re dÃƒÂ©lÃƒÂ©guÃƒÂ© NumÃƒÂ©rique et IA.",cluster:"c2"},
  {id:"a5",sf:["sf4"],sn:"Hacker News",sc:"#00f0ff",title:"ScrapeMaster : scraping ÃƒÂ©thique open-source",sum:"Python, robots.txt, rate-limiting. 5000 stars GitHub.",url:"#",date:"Il y a 4h",an:{},ai:null,notes:[],content:"ScrapeMaster : framework Python pour le scraping ÃƒÂ©thique.",cluster:null},
  {id:"a6",sf:["sf2","sf3"],sn:"EUR-Lex",sc:"#b026ff",title:"Directive europÃƒÂ©enne transparence algorithmique",sum:"Documentation algorithmes obligatoire. Audits annuels. 18 mois.",url:"#",date:"Il y a 6h",an:{},ai:null,notes:[],content:"La DTA impose documentation, audits, droit d'explication.",cluster:null},
  {id:"a7",sf:["sf1"],sn:"Reuters",sc:"#ffb800",title:"Datadog rachÃƒÂ¨te ObservIQ pour 3.2 milliards euros",sum:"Plus grande acquisition observabilitÃƒÂ© Europe. 400 clients.",url:"#",date:"Il y a 7h",an:{},ai:null,notes:[],content:"Datadog acquiert ObservIQ pour 3.2Mds euros.",cluster:null},
  // Duplicates for cluster demo
  {id:"a8",sf:["sf1"],sn:"Bloomberg",sc:"#ffb800",title:"L'IA gÃƒÂ©nÃƒÂ©rative : 45 milliards investis dans le SaaS",sum:"Le marchÃƒÂ© du SaaS B2B explose grÃƒÂ¢ce ÃƒÂ  l'IA gÃƒÂ©nÃƒÂ©rative.",url:"#",date:"Il y a 2h30",an:{},ai:null,notes:[],content:"Investissements massifs dans l'IA SaaS B2B.",cluster:"c1"},
  {id:"a9",sf:["sf3"],sn:"France Info",sc:"#ff003c",title:"Nouveau ministre du NumÃƒÂ©rique nommÃƒÂ© aprÃƒÂ¨s remaniement",sum:"Le gouvernement crÃƒÂ©e un poste dÃƒÂ©diÃƒÂ© au NumÃƒÂ©rique et ÃƒÂ  l'IA.",url:"#",date:"Il y a 3h30",an:{},ai:null,notes:[],content:"Nomination du ministre dÃƒÂ©lÃƒÂ©guÃƒÂ© au NumÃƒÂ©rique.",cluster:"c2"},
];

const INIT_ALERTS=[
  {id:"al1",name:"Mentions entreprise",keywords:["ObservIQ","Datadog"],condition:"any",engine:null,engineVal:null,active:true,color:"#ff003c"},
  {id:"al2",name:"RÃƒÂ©glementation urgente",keywords:["dÃƒÂ©cret","directive","obligation"],condition:"any",engine:"en6",engineVal:"ImmÃƒÂ©diat",active:true,color:"#ef4444"},
  {id:"al3",name:"Gros montants",keywords:[],condition:"any",engine:"en2",engineVal:"> 100M",active:false,color:"#ffb800"},
];

const INIT_NOTIFS=[
  {id:"n1",alertId:"al1",articleId:"a7",time:"Il y a 7h",read:false,text:"Datadog rachÃƒÂ¨te ObservIQ Ã¢â‚¬â€ correspond ÃƒÂ  \"Mentions entreprise\""},
  {id:"n2",alertId:"al2",articleId:"a3",time:"Il y a 5h",read:false,text:"DÃƒÂ©cret cybersÃƒÂ©curitÃƒÂ© Ã¢â‚¬â€ correspond ÃƒÂ  \"RÃƒÂ©glementation urgente\""},
];

// ============================================================
// ICONS
// ============================================================
const IC={
  folder:(c)=>(<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c||"#fff"} strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>),
  chev:(o)=>(<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ffffff44" strokeWidth="2" style={{transform:o?"rotate(90deg)":"",transition:"0.15s"}}><path d="M9 18l6-6-6-6"/></svg>),
  rss:(<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ffb800" strokeWidth="2"><path d="M4 11a9 9 0 019 9"/><path d="M4 4a16 16 0 0116 16"/><circle cx="5" cy="19" r="1"/></svg>),
  scrape:(<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5"/></svg>),
  plus:(<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  search:(<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff30" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>),
  back:(<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>),
  sparkle:(<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#b026ff" strokeWidth="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>),
  x:(<svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  dot:(c)=>(<span style={{display:"inline-block",width:4,height:4,borderRadius:"50%",background:c,boxShadow:`0 0 3px ${c}`}}/>),
  check:(<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00ff87" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>),
  loader:(<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#b026ff" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>),
  arrow:(<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff20" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>),
  gear:(<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>),
  bell:(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>),
  mail:(<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
  layers:(<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>),
  link:(<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>),
};

// ============================================================
// COMPONENTS
// ============================================================
function ETag({label,color,onRemove}){return(<span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:4,background:`${color}18`,border:`1px solid ${color}25`,color,fontSize:8,fontFamily:"'JetBrains Mono',monospace",whiteSpace:"nowrap"}}>{label}{onRemove&&<button type="button" onClick={e=>{e.stopPropagation();onRemove();}} style={{background:"none",border:"none",color,cursor:"pointer",padding:0,display:"inline-flex",opacity:0.5}}>{IC.x}</button>}</span>);}

function NoteInput({art,onAdd,onRemove}){
  const[v,setV]=useState("");
  return(<div style={{display:"flex",flexWrap:"wrap",gap:2,alignItems:"center"}} onClick={e=>e.stopPropagation()}>{art.notes.map((n,i)=>(<span key={i} style={{display:"inline-flex",alignItems:"center",gap:2,padding:"2px 6px",borderRadius:3,background:"#ffffff06",border:"1px dashed #ffffff12",color:"#ffffff44",fontSize:8,fontFamily:"'JetBrains Mono',monospace",fontStyle:"italic"}}>{n}<button type="button" onClick={e=>{e.stopPropagation();onRemove(art.id,n);}} style={{background:"none",border:"none",color:"#ffffff33",cursor:"pointer",padding:0,display:"inline-flex"}}>{IC.x}</button></span>))}<input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&v.trim()){e.preventDefault();onAdd(art.id,v.trim());setV("");}}} placeholder={art.notes.length?"+ note":"Note..."} style={{border:"none",background:"transparent",outline:"none",color:"#ffffff25",fontSize:8,fontFamily:"'JetBrains Mono',monospace",width:art.notes.length?50:60,fontStyle:"italic"}}/></div>);
}

// Cluster badge
function ClusterBadge({count}){return(<span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:4,background:"rgba(0,240,255,0.08)",border:"1px solid #00f0ff22",color:"#00f0ff",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>{IC.layers} {count} sources</span>);}

// ============================================================
// ALERTS PANEL
// ============================================================
function AlertsPanel({alerts,setAlerts,notifs,setNotifs,engines,onClose,onGoToArticle}){
  const[tab,setTab]=useState("notifs");const[nn,setNn]=useState("");const[nk,setNk]=useState("");const[ne,setNe]=useState("");const[nev,setNev]=useState("");const[nc,setNc]=useState("#ff003c");
  const unread=notifs.filter(n=>!n.read).length;
  const addAlert=()=>{if(!nn.trim())return;setAlerts(p=>[...p,{id:`al${Date.now()}`,name:nn.trim(),keywords:nk.split(",").map(k=>k.trim()).filter(Boolean),condition:"any",engine:ne||null,engineVal:nev||null,active:true,color:nc}]);setNn("");setNk("");setNe("");setNev("");};
  const markAllRead=()=>setNotifs(p=>p.map(n=>({...n,read:true})));

  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:380,maxWidth:"95vw",background:"#0b0b18",borderLeft:"1px solid #ffffff08",boxShadow:"-20px 0 60px rgba(0,0,0,0.6)",zIndex:900,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 18px 0",borderBottom:"1px solid #ffffff06"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>{IC.bell}<span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,letterSpacing:2}}>ALERTES</span>{unread>0&&<span style={{padding:"1px 6px",borderRadius:8,background:"#ff003c",color:"#fff",fontSize:8,fontWeight:700}}>{unread}</span>}</div>
          <button type="button" onClick={onClose} style={{background:"none",border:"none",color:"#ffffff25",cursor:"pointer",fontSize:14}}>x</button>
        </div>
        <div style={{display:"flex"}}>{[{id:"notifs",l:"Notifications"},{id:"rules",l:"RÃƒÂ¨gles"},{id:"new",l:"CrÃƒÂ©er"}].map(t=>(<button key={t.id} type="button" onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 0",border:"none",borderBottom:`2px solid ${tab===t.id?"#ff003c":"transparent"}`,background:"transparent",color:tab===t.id?"#ff003c":"#ffffff22",fontSize:9,letterSpacing:1,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{t.l}</button>))}</div>
      </div>

      <div style={{flex:1,overflow:"auto",padding:"14px 18px"}}>
        {tab==="notifs"&&(<>
          {unread>0&&<button type="button" onClick={markAllRead} style={{width:"100%",padding:7,borderRadius:5,border:"1px solid #ffffff06",background:"transparent",color:"#ffffff25",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}>Tout marquer comme lu</button>}
          {notifs.length===0&&<div style={{fontSize:10,color:"#ffffff15",textAlign:"center",padding:20}}>Aucune notification</div>}
          {notifs.map(n=>{const al=alerts.find(a=>a.id===n.alertId);return(
            <div key={n.id} onClick={()=>{setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x));onGoToArticle(n.articleId);onClose();}} style={{padding:"10px 12px",borderRadius:6,background:n.read?"transparent":"rgba(255,0,60,0.04)",border:`1px solid ${n.read?"#ffffff04":"#ff003c15"}`,marginBottom:4,cursor:"pointer",borderLeft:`3px solid ${al?.color||"#ff003c"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><span style={{fontSize:8,fontWeight:600,color:al?.color||"#ff003c"}}>{al?.name}</span><span style={{flex:1}}/><span style={{fontSize:7,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace"}}>{n.time}</span>{!n.read&&<span style={{width:6,height:6,borderRadius:3,background:"#ff003c"}}/>}</div>
              <div style={{fontSize:10,color:"#ffffff66",lineHeight:1.4}}>{n.text}</div>
            </div>);})}
        </>)}

        {tab==="rules"&&(<>
          {alerts.map(al=>(<div key={al.id} style={{padding:"10px 12px",borderRadius:6,background:"rgba(255,255,255,0.012)",border:`1px solid ${al.active?al.color+"15":"#ffffff04"}`,marginBottom:4,borderLeft:`3px solid ${al.color}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:600,color:al.active?"#ffffffcc":"#ffffff44"}}>{al.name}</span>
              <span style={{flex:1}}/>
              <button type="button" onClick={()=>setAlerts(p=>p.map(a=>a.id===al.id?{...a,active:!a.active}:a))} style={{width:32,height:16,borderRadius:8,border:"none",background:al.active?al.color:"#ffffff0a",cursor:"pointer",position:"relative"}}><div style={{width:12,height:12,borderRadius:6,background:"#fff",position:"absolute",top:2,left:al.active?18:2,transition:"left 0.2s"}}/></button>
              <button type="button" onClick={()=>setAlerts(p=>p.filter(a=>a.id!==al.id))} style={{background:"none",border:"none",color:"#ffffff10",cursor:"pointer",fontSize:9}} onMouseEnter={e=>{e.target.style.color="#ff003c";}} onMouseLeave={e=>{e.target.style.color="#ffffff10";}}>x</button>
            </div>
            {al.keywords.length>0&&<div style={{fontSize:8,color:"#ffffff33",fontFamily:"'JetBrains Mono',monospace",marginBottom:2}}>Mots-clÃƒÂ©s : {al.keywords.join(", ")}</div>}
            {al.engine&&<div style={{fontSize:8,color:"#ffffff33",fontFamily:"'JetBrains Mono',monospace"}}>Condition : {al.engineVal}</div>}
          </div>))}
        </>)}

        {tab==="new"&&(<>
          <div style={{fontSize:9,letterSpacing:2,color:"#ffffff1a",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>NOUVELLE ALERTE</div>
          <input value={nn} onChange={e=>setNn(e.target.value)} placeholder="Nom de l'alerte..." style={{width:"100%",padding:"8px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:5,color:"#fff",fontSize:11,outline:"none",fontFamily:"'JetBrains Mono',monospace",marginBottom:8}}/>
          <div style={{fontSize:8,letterSpacing:2,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>MOTS-CLÃƒâ€°S (virgules)</div>
          <input value={nk} onChange={e=>setNk(e.target.value)} placeholder="mot1, mot2, mot3..." style={{width:"100%",padding:"8px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:5,color:"#fff",fontSize:10,outline:"none",fontFamily:"'JetBrains Mono',monospace",marginBottom:8}}/>
          <div style={{fontSize:8,letterSpacing:2,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>CONDITION ANALYSE (optionnel)</div>
          <div style={{display:"flex",gap:4,marginBottom:8}}>
            <select value={ne} onChange={e=>{setNe(e.target.value);setNev("");}} style={{flex:1,padding:"7px",background:"#111120",border:"1px solid #ffffff08",borderRadius:5,color:"#ffffff88",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}><option value="">Aucune</option>{engines.map(en=>(<option key={en.id} value={en.id}>{en.name}</option>))}</select>
            {ne&&<select value={nev} onChange={e=>setNev(e.target.value)} style={{flex:1,padding:"7px",background:"#111120",border:"1px solid #ffffff08",borderRadius:5,color:"#ffffff88",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}><option value="">Toute valeur</option>{engines.find(e=>e.id===ne)?.values.filter(v=>v.on).map(v=>(<option key={v.v} value={v.v}>{v.v}</option>))}</select>}
          </div>
          <div style={{fontSize:8,letterSpacing:2,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>COULEUR</div>
          <div style={{display:"flex",gap:3,marginBottom:12}}>{["#ff003c","#ef4444","#ffb800","#22c55e","#3b82f6","#b026ff","#00f0ff"].map(c=>(<button key={c} type="button" onClick={()=>setNc(c)} style={{width:20,height:20,borderRadius:4,background:c,border:nc===c?"2px solid #fff":"2px solid transparent",cursor:"pointer",opacity:nc===c?1:0.3}}/>))}</div>
          <button type="button" onClick={addAlert} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #ff003c30",background:"rgba(255,0,60,0.06)",color:"#ff003c",fontSize:10,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>CRÃƒâ€°ER L'ALERTE</button>
        </>)}
      </div>
    </div>
  );
}

// ============================================================
// NEWSLETTER PANEL
// ============================================================
function NewsletterPanel({articles,engines,selIds,onClose}){
  const[title,setTitle]=useState("Veille de la semaine");const[intro,setIntro]=useState("");const[generating,setGenerating]=useState(false);const[preview,setPreview]=useState(null);
  const selected=articles.filter(a=>selIds.includes(a.id));

  const generate=()=>{
    setGenerating(true);
    setTimeout(()=>{
      const html=`<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
<h1 style="color:#1a1a2e;border-bottom:3px solid #b026ff;padding-bottom:10px;">${title}</h1>
${intro?`<p style="color:#666;font-size:14px;line-height:1.6;">${intro}</p>`:""}
<p style="color:#999;font-size:12px;">${selected.length} articles sÃƒÂ©lectionnÃƒÂ©s</p>
${selected.map(a=>{
  const tags=Object.entries(a.an).map(([eid,vals])=>{const en=engines.find(e=>e.id===eid);return vals.map(v=>`<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:${en?.color||"#666"}22;color:${en?.color||"#666"};font-size:11px;margin-right:4px;">${v}</span>`).join("");}).join("");
  return `<div style="padding:16px 0;border-bottom:1px solid #eee;">
<div style="font-size:11px;color:${a.sc};font-weight:600;margin-bottom:4px;">${a.sn}</div>
<div style="font-size:16px;font-weight:700;color:#1a1a2e;margin-bottom:6px;">${a.title}</div>
<div style="font-size:13px;color:#666;line-height:1.5;margin-bottom:8px;">${a.sum}</div>
${tags?`<div>${tags}</div>`:""}
</div>`;}).join("")}
<div style="margin-top:20px;padding-top:15px;border-top:2px solid #b026ff;font-size:11px;color:#999;text-align:center;">GÃƒÂ©nÃƒÂ©rÃƒÂ© par ONYX Radar</div>
</div>`;
      setPreview(html);setGenerating(false);
    },1500);
  };

  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,maxWidth:"95vw",background:"#0b0b18",borderLeft:"1px solid #ffffff08",boxShadow:"-20px 0 60px rgba(0,0,0,0.6)",zIndex:900,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 18px",borderBottom:"1px solid #ffffff06",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>{IC.mail}<span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,letterSpacing:2}}>NEWSLETTER</span></div>
        <button type="button" onClick={onClose} style={{background:"none",border:"none",color:"#ffffff25",cursor:"pointer",fontSize:14}}>x</button>
      </div>

      <div style={{flex:1,overflow:"auto",padding:"14px 18px"}}>
        {!preview?(<>
          <div style={{fontSize:9,letterSpacing:2,color:"#ffffff1a",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>TITRE</div>
          <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",padding:"9px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:5,color:"#fff",fontSize:12,outline:"none",fontFamily:"'JetBrains Mono',monospace",marginBottom:12}}/>

          <div style={{fontSize:9,letterSpacing:2,color:"#ffffff1a",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>INTRODUCTION (optionnel)</div>
          <textarea value={intro} onChange={e=>setIntro(e.target.value)} rows={2} placeholder="Un mot d'introduction pour vos lecteurs..." style={{width:"100%",padding:"9px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:5,color:"#fff",fontSize:10,outline:"none",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.5,resize:"vertical",marginBottom:12}}/>

          <div style={{fontSize:9,letterSpacing:2,color:"#ffffff1a",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>ARTICLES ({selected.length})</div>
          <div style={{maxHeight:200,overflow:"auto",marginBottom:14}}>
            {selected.length===0&&<div style={{padding:16,textAlign:"center",fontSize:10,color:"#ffffff15"}}>SÃƒÂ©lectionnez des articles dans le feed pour les inclure</div>}
            {selected.map(a=>(<div key={a.id} style={{padding:"7px 10px",borderRadius:5,background:"rgba(255,255,255,0.012)",border:"1px solid #ffffff05",marginBottom:2,display:"flex",alignItems:"center",gap:5,borderLeft:`3px solid ${a.sc}`}}>
              <span style={{fontSize:9,color:"#ffffff55",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</span>
              <span style={{fontSize:7,color:a.sc,fontFamily:"'JetBrains Mono',monospace"}}>{a.sn}</span>
            </div>))}
          </div>

          <button type="button" onClick={generate} disabled={generating||!selected.length} style={{width:"100%",padding:11,borderRadius:7,border:"1px solid #00f0ff30",background:generating?"transparent":"rgba(0,240,255,0.06)",color:"#00f0ff",fontSize:10,letterSpacing:2,cursor:generating?"wait":"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            {generating?<>{IC.loader} GÃƒâ€°NÃƒâ€°RATION...</>:<>{IC.mail} GÃƒâ€°NÃƒâ€°RER LA NEWSLETTER</>}
          </button>
        </>):(
          <>
            <div style={{display:"flex",gap:5,marginBottom:12}}>
              <button type="button" onClick={()=>setPreview(null)} style={{flex:1,padding:8,borderRadius:5,border:"1px solid #ffffff08",background:"transparent",color:"#ffffff33",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>MODIFIER</button>
              <button type="button" onClick={()=>navigator.clipboard?.writeText(preview)} style={{flex:1,padding:8,borderRadius:5,border:"1px solid #00f0ff20",background:"rgba(0,240,255,0.04)",color:"#00f0ff",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>COPIER HTML</button>
              <button type="button" style={{flex:1,padding:8,borderRadius:5,border:"1px solid #00ff8720",background:"rgba(0,255,135,0.04)",color:"#00ff87",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>ENVOYER</button>
            </div>
            <div style={{fontSize:8,letterSpacing:2,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>APERÃƒâ€¡U</div>
            <div style={{background:"#ffffff",borderRadius:8,padding:20,overflow:"auto",maxHeight:"60vh"}} dangerouslySetInnerHTML={{__html:preview}}/>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ADD SOURCE MODAL
// ============================================================
// ============================================================
// AI VEILLE SETUP
// ============================================================

function AISetupPanel({onClose,onApply,engines}) {
  const [step,setStep] = useState(1); // 1=types, 2=context, 3=loading, 4=results
  const [selTypes,setSelTypes] = useState([]);
  const [context,setContext] = useState({});
  const [results,setResults] = useState(null);
  const [editResults,setEditResults] = useState(null);

  const TYPES = [
    {id:"vt1",name:"Concurrentielle",icon:"\u2694",color:"#ffb800",desc:"Suivre vos concurrents et le marchÃƒÂ©",
      questions:[
        {id:"sector",label:"Votre secteur d'activitÃƒÂ©",placeholder:"Ex: SaaS B2B, Ãƒâ€°nergie renouvelable, BTP...",type:"text"},
        {id:"competitors",label:"Concurrents ÃƒÂ  surveiller (optionnel)",placeholder:"Ex: Datadog, Dynatrace, Splunk...",type:"text"},
        {id:"geo",label:"Zone gÃƒÂ©ographique",type:"select",options:["France","Europe","International","Monde entier"]},
      ]},
    {id:"vt2",name:"RÃƒÂ©glementaire",icon:"\u2696",color:"#b026ff",desc:"Lois, dÃƒÂ©crets, directives, obligations",
      questions:[
        {id:"domain",label:"Domaine rÃƒÂ©glementaire",type:"multi",options:["NumÃƒÂ©rique / IA","Environnement","Travail / Social","SantÃƒÂ©","Finance","DonnÃƒÂ©es / RGPD","Ãƒâ€°nergie","Industrie"]},
        {id:"geo",label:"Ãƒâ€°chelle",type:"select",options:["France uniquement","France + Europe","Europe uniquement","International"]},
      ]},
    {id:"vt3",name:"Appels ÃƒÂ  projets",icon:"\u2605",color:"#00ff87",desc:"AAP, dispositifs, financements publics",
      questions:[
        {id:"sector",label:"Secteur visÃƒÂ©",placeholder:"Ex: Transition ÃƒÂ©cologique, Innovation numÃƒÂ©rique...",type:"text"},
        {id:"territory",label:"Territoire",placeholder:"Ex: Hauts-de-France, Auvergne-RhÃƒÂ´ne-Alpes...",type:"text"},
        {id:"funders",label:"Types de financeurs",type:"multi",options:["Ãƒâ€°tat / MinistÃƒÂ¨res","RÃƒÂ©gions","Europe (FEDER, FSE, FTJ)","BPI / ADEME","ANR / Agences"]},
      ]},
    {id:"vt4",name:"Politique",icon:"\u26A0",color:"#ff003c",desc:"ActualitÃƒÂ© politique et institutionnelle",
      questions:[
        {id:"focus",label:"Focus",type:"multi",options:["Gouvernement / MinistÃƒÂ¨res","Parlement","CollectivitÃƒÂ©s","Ãƒâ€°lections","Politique europÃƒÂ©enne"]},
        {id:"geo",label:"Ãƒâ€°chelle",type:"select",options:["France","France + Europe","International"]},
      ]},
    {id:"vt5",name:"Technologique",icon:"\u26A1",color:"#00f0ff",desc:"Innovations, R&D, tendances tech",
      questions:[
        {id:"techDomain",label:"Domaines tech",type:"multi",options:["Intelligence artificielle","CybersÃƒÂ©curitÃƒÂ©","Cloud / SaaS","Blockchain","IoT / Industrie 4.0","Green tech","Quantique","Robotique"]},
        {id:"depth",label:"Profondeur",type:"select",options:["Grand public (presse tech)","Professionnel (analyses)","Recherche (papers, brevets)"]},
      ]},
    {id:"vt6",name:"Sectorielle",icon:"\u2B21",color:"#f97316",desc:"Veille spÃƒÂ©cifique ÃƒÂ  votre industrie",
      questions:[
        {id:"industry",label:"Votre industrie",placeholder:"Ex: Automobile, Pharmaceutique, Agroalimentaire...",type:"text"},
        {id:"topics",label:"Sujets prioritaires",placeholder:"Ex: Supply chain, M&A, Recrutement...",type:"text"},
        {id:"geo",label:"Zone",type:"select",options:["France","Europe","Monde"]},
      ]},
  ];

  const tglType=(id)=>setSelTypes(p=>p.includes(id)?p.filter(i=>i!==id):[...p,id]);

  // Get all questions for selected types
  const allQuestions = selTypes.flatMap(tid=>{
    const t=TYPES.find(x=>x.id===tid);
    return t?t.questions.map(q=>({...q,typeId:tid,typeName:t.name,typeColor:t.color})):[];
  });
  // Dedupe questions with same id
  const uniqueQuestions = allQuestions.filter((q,i,arr)=>arr.findIndex(x=>x.id===q.id)===i);

  const updateCtx=(qid,val)=>setContext(p=>({...p,[qid]:val}));
  const toggleCtxMulti=(qid,val)=>setContext(p=>{const cur=p[qid]||[];return{...p,[qid]:cur.includes(val)?cur.filter(v=>v!==val):[...cur,val]};});

  // Call Claude API
  const runAI = async () => {
    setStep(3);
    const selectedTypeNames = selTypes.map(tid=>TYPES.find(t=>t.id===tid)?.name).join(", ");
    const contextStr = Object.entries(context).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(", "):v}`).join("\n");
    const prompt = `Tu es un expert en veille stratÃƒÂ©gique. L'utilisateur veut configurer une veille de type: ${selectedTypeNames}.

Contexte fourni:
${contextStr}

GÃƒÂ©nÃƒÂ¨re une configuration de veille structurÃƒÂ©e en JSON UNIQUEMENT (pas de markdown, pas de backticks). Le JSON doit contenir:
{
  "folders": [
    {
      "name": "Nom du dossier",
      "sources": [
        {"name": "Nom du site", "url": "url.com", "type": "rss ou scrape"}
      ],
      "suggestedEngines": ["CatÃƒÂ©gorie", "GÃƒÂ©ographie", "Sentiment"]
    }
  ]
}

RÃƒÂ¨gles:
- Maximum 6 dossiers
- Maximum 8 sources par dossier
- PrivilÃƒÂ©gie des sources rÃƒÂ©elles et connues (sites institutionnels, mÃƒÂ©dias reconnus, bases officielles)
- Adapte les sources au contexte gÃƒÂ©ographique et sectoriel
- SuggÃƒÂ¨re les analyses pertinentes parmi: CatÃƒÂ©gorie, Montant, GÃƒÂ©ographie, Sentiment, Secteur, TemporalitÃƒÂ©`;

    try {
      const response = await fetch("/api/ai/radar-setup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ prompt })
      });
      const data = await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error || "Impossible de joindre Claude");
      const text = data.text || "";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);

      const colors = ["#ffb800","#b026ff","#00ff87","#ff003c","#00f0ff","#f97316","#3b82f6","#22c55e"];
      const enriched = parsed.folders.map((f,i)=>({
        ...f,
        id:`rf${i}`,
        color:colors[i%colors.length],
        enabled:true,
        sources:f.sources.map((s,j)=>({...s,id:`rs${i}_${j}`,enabled:true})),
      }));
      setResults(enriched);
      setEditResults(enriched);
      setStep(4);
    } catch(err) {
      // Fallback mock data
      const mock = selTypes.map((tid,i)=>{
        const t=TYPES.find(x=>x.id===tid);
        const colors=["#ffb800","#b026ff","#00ff87","#ff003c","#00f0ff","#f97316"];
        return {
          id:`rf${i}`,name:`Veille ${t?.name||""}`,color:colors[i%6],enabled:true,
          suggestedEngines:["CatÃƒÂ©gorie","GÃƒÂ©ographie"],
          sources:[
            {id:`rs${i}_0`,name:"Source recommandÃƒÂ©e 1",url:"source1.fr",type:"rss",enabled:true},
            {id:`rs${i}_1`,name:"Source recommandÃƒÂ©e 2",url:"source2.eu",type:"scrape",enabled:true},
            {id:`rs${i}_2`,name:"Source recommandÃƒÂ©e 3",url:"source3.gouv.fr",type:"rss",enabled:true},
          ]
        };
      });
      setResults(mock);setEditResults(mock);setStep(4);
    }
  };

  const tglFolder=(fid)=>setEditResults(p=>p.map(f=>f.id===fid?{...f,enabled:!f.enabled}:f));
  const tglSource=(fid,sid)=>setEditResults(p=>p.map(f=>f.id!==fid?f:{...f,sources:f.sources.map(s=>s.id===sid?{...s,enabled:!s.enabled}:s)}));

  const apply = () => {
    editResults.filter(f=>f.enabled).forEach(f=>{
      const src=f.sources.filter(s=>s.enabled).map(s=>({id:s.id,name:s.name,url:s.url,type:s.type,ok:true,withStatic:false}));
      if(src.length) onApply({sources:src,folderName:f.name,color:f.color});
    });
    onClose();
  };

  const totalSrc = editResults ? editResults.filter(f=>f.enabled).reduce((s,f)=>s+f.sources.filter(x=>x.enabled).length,0) : 0;

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:540,maxWidth:"94vw",maxHeight:"90vh",overflow:"auto",background:"#0b0b18",border:"1px solid #b026ff18",borderRadius:16,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg, #b026ff, #00f0ff)",borderRadius:"16px 16px 0 0"}}/>
        <div style={{padding:"24px 22px 20px"}}>

          {/* Header */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            {IC.sparkle}
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,letterSpacing:2}}>CONFIGURATEUR INTELLIGENT</span>
          </div>
          <div style={{fontSize:10,color:"#ffffff33",marginBottom:6}}>
            {step===1&&"Ãƒâ€°tape 1/3 Ã¢â‚¬â€ Choisissez vos types de veille"}
            {step===2&&"Ãƒâ€°tape 2/3 Ã¢â‚¬â€ PrÃƒÂ©cisez votre contexte"}
            {step===3&&"Analyse en cours..."}
            {step===4&&"Ãƒâ€°tape 3/3 Ã¢â‚¬â€ Validez la configuration"}
          </div>
          {/* Progress bar */}
          <div style={{height:2,background:"#ffffff06",borderRadius:1,marginBottom:16}}>
            <div style={{height:2,background:"linear-gradient(90deg, #b026ff, #00f0ff)",borderRadius:1,width:`${step===1?33:step===2?50:step===3?75:100}%`,transition:"width 0.5s"}}/>
          </div>

          {/* STEP 1: Type selection */}
          {step===1&&(<>
            <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:14}}>
              {TYPES.map(tp=>{
                const sel=selTypes.includes(tp.id);
                return (
                  <div key={tp.id} onClick={()=>tglType(tp.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:8,border:`1px solid ${sel?tp.color+"30":"#ffffff06"}`,background:sel?`${tp.color}08`:"rgba(255,255,255,0.006)",cursor:"pointer",transition:"0.15s"}}>
                    <button type="button" style={{width:20,height:20,borderRadius:5,border:`2px solid ${sel?tp.color:"#ffffff10"}`,background:sel?`${tp.color}28`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                      {sel&&<span style={{color:tp.color,fontSize:11,fontWeight:700}}>{"\u2713"}</span>}
                    </button>
                    <span style={{fontSize:20}}>{tp.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:sel?tp.color:"#ffffff44"}}>{tp.name}</div>
                      <div style={{fontSize:9,color:"#ffffff22"}}>{tp.desc}</div>
                    </div>
                    <div style={{fontSize:8,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace"}}>{tp.questions.length} param.</div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:5}}>
              <button type="button" onClick={onClose} style={{flex:1,padding:10,borderRadius:7,border:"1px solid #ffffff06",background:"transparent",color:"#ffffff25",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>ANNULER</button>
              <button type="button" onClick={()=>setStep(2)} disabled={!selTypes.length} style={{flex:2,padding:10,borderRadius:7,border:`1px solid ${selTypes.length?"#b026ff30":"#ffffff06"}`,background:selTypes.length?"rgba(176,38,255,0.06)":"transparent",color:selTypes.length?"#b026ff":"#ffffff15",fontSize:9,letterSpacing:2,cursor:selTypes.length?"pointer":"default",fontFamily:"'JetBrains Mono',monospace"}}>SUIVANT ({selTypes.length})</button>
            </div>
          </>)}

          {/* STEP 2: Context questions */}
          {step===2&&(<>
            <div style={{marginBottom:14}}>
              {uniqueQuestions.map(q=>(
                <div key={q.id} style={{marginBottom:12}}>
                  <div style={{fontSize:9,fontWeight:600,color:q.typeColor||"#ffffff44",marginBottom:5,display:"flex",alignItems:"center",gap:4}}>
                    <span style={{width:6,height:6,borderRadius:2,background:q.typeColor,flexShrink:0}}/>
                    {q.label}
                  </div>
                  {q.type==="text"&&(
                    <input value={context[q.id]||""} onChange={e=>updateCtx(q.id,e.target.value)} placeholder={q.placeholder}
                      style={{width:"100%",padding:"9px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:6,color:"#fff",fontSize:11,outline:"none",fontFamily:"'JetBrains Mono',monospace"}}/>
                  )}
                  {q.type==="select"&&(
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {q.options.map(opt=>{
                        const sel=context[q.id]===opt;
                        return (<button key={opt} type="button" onClick={()=>updateCtx(q.id,opt)} style={{padding:"6px 11px",borderRadius:5,border:`1px solid ${sel?"#00f0ff25":"#ffffff06"}`,background:sel?"rgba(0,240,255,0.06)":"transparent",color:sel?"#00f0ff":"#ffffff30",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{opt}</button>);
                      })}
                    </div>
                  )}
                  {q.type==="multi"&&(
                    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                      {q.options.map(opt=>{
                        const sel=(context[q.id]||[]).includes(opt);
                        return (<button key={opt} type="button" onClick={()=>toggleCtxMulti(q.id,opt)} style={{padding:"5px 10px",borderRadius:5,border:`1px solid ${sel?q.typeColor+"25":"#ffffff06"}`,background:sel?`${q.typeColor}08`:"transparent",color:sel?q.typeColor:"#ffffff25",fontSize:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{opt}</button>);
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:5}}>
              <button type="button" onClick={()=>setStep(1)} style={{flex:1,padding:10,borderRadius:7,border:"1px solid #ffffff06",background:"transparent",color:"#ffffff25",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>RETOUR</button>
              <button type="button" onClick={runAI} style={{flex:2,padding:10,borderRadius:7,border:"1px solid #b026ff30",background:"rgba(176,38,255,0.06)",color:"#b026ff",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>{IC.sparkle} GÃƒâ€°NÃƒâ€°RER MA VEILLE</button>
            </div>
          </>)}

          {/* STEP 3: Loading */}
          {step===3&&(
            <div style={{padding:"40px 20px",textAlign:"center"}}>
              <div style={{marginBottom:16}}>{IC.loader}</div>
              <div style={{fontSize:12,color:"#b026ff88",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>Claude analyse votre contexte...</div>
              <div style={{fontSize:9,color:"#ffffff18",lineHeight:1.5}}>Recherche des sources pertinentes{"\n"}Structuration des dossiers{"\n"}Recommandation des analyses</div>
            </div>
          )}

          {/* STEP 4: Results */}
          {step===4&&editResults&&(<>
            <div style={{marginBottom:14}}>
              {editResults.map(folder=>(
                <div key={folder.id} style={{marginBottom:8,borderRadius:8,border:`1px solid ${folder.enabled?folder.color+"20":"#ffffff06"}`,background:folder.enabled?`${folder.color}04`:"transparent",overflow:"hidden"}}>
                  {/* Folder header */}
                  <div onClick={()=>tglFolder(folder.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",cursor:"pointer"}}>
                    <button type="button" style={{width:18,height:18,borderRadius:4,border:`2px solid ${folder.enabled?folder.color:"#ffffff10"}`,background:folder.enabled?`${folder.color}28`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                      {folder.enabled&&<span style={{color:folder.color,fontSize:10,fontWeight:700}}>{"\u2713"}</span>}
                    </button>
                    {IC.folder(folder.color)}
                    <span style={{flex:1,fontSize:12,fontWeight:600,color:folder.enabled?folder.color:"#ffffff33"}}>{folder.name}</span>
                    <span style={{fontSize:8,color:"#ffffff18",fontFamily:"'JetBrains Mono',monospace"}}>{folder.sources.filter(s=>s.enabled).length} src</span>
                  </div>
                  {/* Sources */}
                  {folder.enabled&&(
                    <div style={{padding:"0 12px 10px",display:"flex",flexDirection:"column",gap:2}}>
                      {folder.sources.map(s=>(
                        <div key={s.id} onClick={()=>tglSource(folder.id,s.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:4,background:s.enabled?"rgba(255,255,255,0.015)":"transparent",cursor:"pointer"}}>
                          <button type="button" style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${s.enabled?folder.color:"#ffffff0a"}`,background:s.enabled?`${folder.color}20`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                            {s.enabled&&<span style={{color:folder.color,fontSize:8,fontWeight:700}}>{"\u2713"}</span>}
                          </button>
                          <span style={{flex:1,fontSize:10,color:s.enabled?"#ffffff88":"#ffffff25"}}>{s.name}</span>
                          <span style={{fontSize:7,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace"}}>{s.url}</span>
                          <span style={{fontSize:7,padding:"1px 4px",borderRadius:2,background:s.type==="rss"?"#ffb80008":"#00f0ff08",color:s.type==="rss"?"#ffb80055":"#00f0ff55",fontFamily:"'JetBrains Mono',monospace"}}>{s.type}</span>
                        </div>
                      ))}
                      {/* Suggested engines */}
                      {folder.suggestedEngines&&(
                        <div style={{display:"flex",gap:3,marginTop:4,paddingLeft:22}}>
                          <span style={{fontSize:7,color:"#ffffff12",fontFamily:"'JetBrains Mono',monospace"}}>Analyses:</span>
                          {folder.suggestedEngines.map(en=>(
                            <span key={en} style={{fontSize:7,padding:"1px 5px",borderRadius:2,background:`${folder.color}08`,color:`${folder.color}66`,fontFamily:"'JetBrains Mono',monospace"}}>{en}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{padding:8,borderRadius:6,background:"rgba(0,255,135,0.03)",border:"1px solid #00ff870d",marginBottom:12,fontSize:9,color:"#00ff8766",fontFamily:"'JetBrains Mono',monospace"}}>
              {editResults.filter(f=>f.enabled).length} dossier{editResults.filter(f=>f.enabled).length>1?"s":""} Ã¢â‚¬â€ {totalSrc} source{totalSrc>1?"s":""} au total
            </div>

            <div style={{display:"flex",gap:5}}>
              <button type="button" onClick={()=>{setStep(2);setResults(null);setEditResults(null);}} style={{flex:1,padding:10,borderRadius:7,border:"1px solid #ffffff06",background:"transparent",color:"#ffffff25",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>MODIFIER</button>
              <button type="button" onClick={apply} disabled={!totalSrc} style={{flex:2,padding:10,borderRadius:7,border:"1px solid #00ff8730",background:"rgba(0,255,135,0.05)",color:"#00ff87",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{IC.check} APPLIQUER ({totalSrc} sources)</button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ENGINE SETTINGS
// ============================================================
function EngineSettings({engine, onSave, onClose}) {
  const [vals, setVals] = useState(engine.values);
  const [nv, setNv] = useState("");
  const [raw, setRaw] = useState(engine.extractRaw||false);

  const toggle = (i) => setVals(p=>p.map((x,idx)=>idx===i?{...x,on:!x.on}:x));
  const add = () => { if(!nv.trim()) return; setVals(p=>[...p,{v:nv.trim(),on:true}]); setNv(""); };
  const rm = (i) => setVals(p=>p.filter((_,idx)=>idx!==i));
  const save = () => { onSave({...engine,values:vals,extractRaw:raw}); onClose(); };
  const showRaw = engine.name==="Montant"||engine.name==="GÃƒÂ©ographie"||!engine.isDefault;

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:460,maxWidth:"94vw",maxHeight:"85vh",overflow:"auto",background:"#0b0b18",border:`1px solid ${engine.color}22`,borderRadius:16,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:engine.color,borderRadius:"16px 16px 0 0"}}/>
        <div style={{padding:"22px 20px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <span style={{fontSize:18}}>{engine.icon}</span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:700,letterSpacing:2,color:engine.color}}>{engine.name}</span>
          </div>
          <div style={{fontSize:10,color:"#ffffff44",marginBottom:16,lineHeight:1.5}}>{engine.description}</div>

          {showRaw&&(<div style={{marginBottom:14}}>
            <div style={{fontSize:8,letterSpacing:2,color:"#ffffff18",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>MODE D'EXTRACTION</div>
            <div style={{display:"flex",gap:5}}>
              <button type="button" onClick={()=>setRaw(true)} style={{flex:1,padding:"10px",borderRadius:6,border:`1px solid ${raw?engine.color+"30":"#ffffff06"}`,background:raw?`${engine.color}08`:"transparent",cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:10,fontWeight:700,color:raw?engine.color:"#ffffff40",marginBottom:2}}>DonnÃƒÂ©e brute</div>
                <div style={{fontSize:8,color:"#ffffff18"}}>{engine.name==="Montant"?"\"2.5M\u20AC\" tel quel":engine.name==="GÃƒÂ©ographie"?"\"Lyon\" tel quel":"Extraction directe"}</div>
              </button>
              <button type="button" onClick={()=>setRaw(false)} style={{flex:1,padding:"10px",borderRadius:6,border:`1px solid ${!raw?engine.color+"30":"#ffffff06"}`,background:!raw?`${engine.color}08`:"transparent",cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:10,fontWeight:700,color:!raw?engine.color:"#ffffff40",marginBottom:2}}>{engine.name==="Montant"?"Fourchettes":engine.name==="GÃƒÂ©ographie"?"\u00C9chelle":"Valeurs"}</div>
                <div style={{fontSize:8,color:"#ffffff18"}}>Classe dans vos catÃƒÂ©gories</div>
              </button>
            </div>
          </div>)}

          {!raw&&(<div style={{marginBottom:14}}>
            <div style={{fontSize:8,letterSpacing:2,color:"#ffffff18",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>VALEURS ({vals.filter(x=>x.on).length}/{vals.length})</div>
            {vals.map((val,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:5,background:val.on?`${engine.color}06`:"transparent",border:`1px solid ${val.on?engine.color+"12":"#ffffff04"}`,marginBottom:2}}>
                <button type="button" onClick={()=>toggle(i)} style={{width:16,height:16,borderRadius:3,border:`1.5px solid ${val.on?engine.color:"#ffffff12"}`,background:val.on?`${engine.color}25`:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {val.on&&<span style={{color:engine.color,fontSize:9,fontWeight:700}}>{"\u2713"}</span>}
                </button>
                <span style={{flex:1,fontSize:11,color:val.on?"#ffffffaa":"#ffffff28"}}>{val.v}</span>
                <button type="button" onClick={()=>rm(i)} style={{background:"none",border:"none",color:"#ffffff0d",cursor:"pointer",fontSize:9}} onMouseEnter={e=>{e.target.style.color="#ff003c";}} onMouseLeave={e=>{e.target.style.color="#ffffff0d";}}>x</button>
              </div>
            ))}
            <div style={{display:"flex",gap:4,marginTop:6}}>
              <input value={nv} onChange={e=>setNv(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Ajouter..." style={{flex:1,padding:"6px 8px",boxSizing:"border-box",background:"rgba(255,255,255,0.02)",border:"1px solid #ffffff06",borderRadius:4,color:"#fff",fontSize:10,outline:"none",fontFamily:"'JetBrains Mono',monospace"}}/>
              <button type="button" onClick={add} style={{padding:"0 10px",borderRadius:4,border:`1px solid ${engine.color}20`,background:`${engine.color}08`,color:engine.color,cursor:"pointer"}}>{IC.plus}</button>
            </div>
          </div>)}

          {raw&&(<div style={{padding:12,borderRadius:6,background:`${engine.color}06`,border:`1px solid ${engine.color}10`,marginBottom:14,fontSize:10,color:`${engine.color}88`,lineHeight:1.5}}>Mode brut : l'IA extraira la donnÃƒÂ©e directement depuis l'article.</div>)}

          <div style={{display:"flex",gap:5}}>
            <button type="button" onClick={onClose} style={{flex:1,padding:10,borderRadius:6,border:"1px solid #ffffff06",background:"transparent",color:"#ffffff25",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>ANNULER</button>
            <button type="button" onClick={save} style={{flex:2,padding:10,borderRadius:6,border:`1px solid ${engine.color}30`,background:`${engine.color}0a`,color:engine.color,fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>SAUVEGARDER</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddSourceModal({onClose,folders,onAddSource}) {
  const [url,setUrl]=useState("");const [scanning,setScan]=useState(false);const [sr,setSr]=useState(null);
  const [selFolder,setSelFolder]=useState(folders[0]?.id||"");const [newFolder,setNewFolder]=useState("");const [useNew,setUseNew]=useState(false);
  const [withStatic,setWithStatic]=useState(false);const [staticDays,setStaticDays]=useState(30);const [autoArchive,setAutoArchive]=useState(false);const [archiveDays,setArchiveDays]=useState(30);
  const scan=()=>{if(!url.trim())return;setScan(true);setSr(null);setTimeout(()=>{const r=Math.random()>0.3;setSr({rss:r,name:url.replace(/https?:\/\/(www\.)?/,"").split("/")[0],n:r?Math.floor(Math.random()*50)+5:Math.floor(Math.random()*20)+3});setScan(false);},1800);};
  const add=()=>{
    const folderId=useNew&&newFolder.trim()?`sf${Date.now()}`:selFolder;
    const folderName=useNew?newFolder.trim():null;
    onAddSource({url,name:sr?.name||url,type:sr?.rss?"rss":"scrape",folderId,folderName,withStatic});
    onClose();
  };
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:440,maxWidth:"92vw",background:"#0b0b18",border:"1px solid #ffffff10",borderRadius:16,position:"relative",maxHeight:"90vh",overflow:"auto"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg, #00f0ff, #b026ff)",borderRadius:"16px 16px 0 0"}}/>
        <div style={{padding:"24px 22px 20px"}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:4,color:"#00f0ff",marginBottom:14}}>+ SOURCE</div>
          <div style={{display:"flex",gap:5,marginBottom:10}}>
            <div style={{flex:1,position:"relative"}}><span style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)"}}>{IC.globe}</span><input value={url} onChange={e=>{setUrl(e.target.value);setSr(null);}} placeholder="https://..." onKeyDown={e=>e.key==="Enter"&&scan()} style={{width:"100%",padding:"9px 8px 9px 24px",boxSizing:"border-box",background:"rgba(0,240,255,0.025)",border:"1px solid #ffffff08",borderRadius:6,color:"#fff",fontSize:11,outline:"none",fontFamily:"'JetBrains Mono',monospace"}}/></div>
            <button type="button" onClick={scan} disabled={scanning} style={{padding:"0 14px",borderRadius:6,border:"1px solid #00f0ff18",background:"rgba(0,240,255,0.04)",color:"#00f0ff",fontSize:9,cursor:scanning?"wait":"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",gap:3}}>{scanning?IC.loader:"SCAN"}</button>
          </div>
          {sr&&(<>
            <div style={{padding:10,borderRadius:6,marginBottom:10,background:sr.rss?"rgba(0,255,135,0.03)":"rgba(0,240,255,0.03)",border:`1px solid ${sr.rss?"#00ff8715":"#00f0ff15"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>{IC.check}<span style={{fontSize:11,fontWeight:600,color:"#ffffffaa"}}>{sr.name}</span></div>
              <div style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:sr.rss?"#00ff87":"#00f0ff"}}>{sr.rss?`RSS Ã¢â‚¬â€ ~${sr.n} articles`:`SCRAPING Ã¢â‚¬â€ ${sr.n} pages`}</div>
            </div>

            {/* Folder selection */}
            <div style={{fontSize:8,letterSpacing:2,color:"#ffffff18",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>DOSSIER</div>
            <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:6}}>
              {folders.map(f=>(<button key={f.id} type="button" onClick={()=>{setSelFolder(f.id);setUseNew(false);}} style={{padding:"5px 10px",borderRadius:5,border:`1px solid ${!useNew&&selFolder===f.id?f.color+"30":"#ffffff06"}`,background:!useNew&&selFolder===f.id?`${f.color}0a`:"transparent",color:!useNew&&selFolder===f.id?f.color:"#ffffff25",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{f.name}</button>))}
              <button type="button" onClick={()=>setUseNew(true)} style={{padding:"5px 10px",borderRadius:5,border:`1px solid ${useNew?"#00f0ff30":"#ffffff06"}`,background:useNew?"rgba(0,240,255,0.06)":"transparent",color:useNew?"#00f0ff":"#ffffff25",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{IC.plus} Nouveau</button>
            </div>
            {useNew&&<input value={newFolder} onChange={e=>setNewFolder(e.target.value)} placeholder="Nom du dossier..." style={{width:"100%",padding:"8px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:5,color:"#fff",fontSize:10,outline:"none",fontFamily:"'JetBrains Mono',monospace",marginBottom:8}}/>}

            {/* Static option with archive reference */}
            <div style={{padding:"10px 12px",borderRadius:6,background:`rgba(255,184,0,${withStatic?"0.05":"0.02"})`,border:`1px solid ${withStatic?"#ffb80025":"#ffffff06"}`,marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setWithStatic(!withStatic)}>
                <button type="button" style={{width:18,height:18,borderRadius:4,border:`2px solid ${withStatic?"#ffb800":"#ffffff12"}`,background:withStatic?"#ffb80030":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                  {withStatic&&<span style={{color:"#ffb800",fontSize:10,fontWeight:700}}>{"\u2713"}</span>}
                </button>
                <div>
                  <div style={{fontSize:10,fontWeight:600,color:withStatic?"#ffb800":"#ffffff44"}}>{"\u25A3"} RÃƒÂ©cupÃƒÂ©rer le contenu existant (Archives)</div>
                  <div style={{fontSize:8,color:"#ffffff20",marginTop:2}}>Le contenu dÃƒÂ©jÃƒÂ  publiÃƒÂ© sera scrapÃƒÂ© et envoyÃƒÂ© dans l'onglet <span style={{color:"#ffb80055"}}>Archives</span> de la sidebar. Ce contenu est figÃƒÂ© et exportable en Excel. Il ne sera pas dupliquÃƒÂ© dans le dossier source dynamique.</div>
                </div>
              </div>
              {withStatic&&(<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #ffb80010"}}>
                <div style={{fontSize:8,color:"#ffb80055",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>Profondeur de rÃƒÂ©cupÃƒÂ©ration :</div>
                <div style={{display:"flex",gap:4,marginBottom:6}}>
                  {[{d:30,l:"30 jours"},{d:90,l:"3 mois"},{d:180,l:"6 mois"},{d:365,l:"1 an"},{d:9999,l:"Tout"}].map(o=>(<button key={o.d} type="button" onClick={()=>setStaticDays(o.d)} style={{padding:"5px 9px",borderRadius:4,border:`1px solid ${staticDays===o.d?"#ffb80030":"#ffffff06"}`,background:staticDays===o.d?"#ffb80010":"transparent",color:staticDays===o.d?"#ffb800":"#ffffff25",fontSize:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{o.l}</button>))}
                </div>
                <div style={{fontSize:7,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace"}}>Le contenu antÃƒÂ©rieur ÃƒÂ  {staticDays>=9999?"toujours":`${staticDays} jours`} ira dans les Archives. Les nouveaux contenus (veille dynamique) resteront dans le dossier source. Aucun doublon.</div>
              </div>)}
            </div>

            {/* Auto-archive option */}
            <div style={{padding:"8px 12px",borderRadius:6,background:"rgba(255,255,255,0.015)",border:`1px solid ${autoArchive?"#ffb80018":"#ffffff04"}`,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setAutoArchive(!autoArchive)}>
                <button type="button" style={{width:16,height:16,borderRadius:3,border:`1.5px solid ${autoArchive?"#ffb800":"#ffffff10"}`,background:autoArchive?"#ffb80025":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                  {autoArchive&&<span style={{color:"#ffb800",fontSize:8,fontWeight:700}}>{"\u2713"}</span>}
                </button>
                <div>
                  <div style={{fontSize:9,fontWeight:600,color:autoArchive?"#ffb800":"#ffffff33"}}>Archiver automatiquement aprÃƒÂ¨s un dÃƒÂ©lai</div>
                  <div style={{fontSize:7,color:"#ffffff18",marginTop:1}}>Les articles dynamiques seront dÃƒÂ©placÃƒÂ©s vers les Archives aprÃƒÂ¨s le dÃƒÂ©lai choisi</div>
                </div>
              </div>
              {autoArchive&&(<div style={{marginTop:6,paddingLeft:26,display:"flex",gap:3}}>
                {[{d:7,l:"7j"},{d:14,l:"14j"},{d:30,l:"30j"},{d:60,l:"60j"},{d:90,l:"90j"}].map(o=>(<button key={o.d} type="button" onClick={()=>setArchiveDays(o.d)} style={{padding:"3px 7px",borderRadius:3,border:`1px solid ${archiveDays===o.d?"#ffb80025":"#ffffff05"}`,background:archiveDays===o.d?"#ffb80008":"transparent",color:archiveDays===o.d?"#ffb800":"#ffffff1a",fontSize:7,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{o.l}</button>))}
              </div>)}
            </div>

            <div style={{display:"flex",gap:5}}>
              <button type="button" onClick={onClose} style={{flex:1,padding:10,borderRadius:6,border:"1px solid #ffffff06",background:"transparent",color:"#ffffff25",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>ANNULER</button>
              <button type="button" onClick={add} style={{flex:2,padding:10,borderRadius:6,border:"1px solid #00f0ff25",background:"rgba(0,240,255,0.05)",color:"#00f0ff",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>AJOUTER</button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// NEW ENGINE MODAL
// ============================================================
function NewEngineModal({onClose, onAdd}) {
  const [name,setName]=useState("");const [prompt,setPrompt]=useState("");const [color,setColor]=useState("#06b6d4");const [valsStr,setValsStr]=useState("");const [raw,setRaw]=useState(false);
  const CS=["#00f0ff","#b026ff","#ff003c","#ffb800","#00ff87","#3b82f6","#06b6d4","#ef4444","#f97316","#8b5cf6","#ec4899","#22c55e"];
  const add=()=>{
    if(!name.trim()||!prompt.trim()) return;
    const vList=raw?[]:valsStr.split(",").map(v=>v.trim()).filter(Boolean).map(v=>({v,on:true}));
    onAdd({id:`en${Date.now()}`,name:name.trim(),icon:"\u2726",color,description:"Analyse personnalisÃƒÂ©e",mode:"select",extractRaw:raw,values:vList,active:true,isDefault:false,customPrompt:prompt.trim()});
    onClose();
  };
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:420,maxWidth:"92vw",background:"#0b0b18",border:"1px solid #ffffff12",borderRadius:16,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg, ${color}, #00f0ff)`,borderRadius:"16px 16px 0 0"}}/>
        <div style={{padding:"24px 22px 20px"}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,letterSpacing:2,marginBottom:18}}>NOUVELLE ANALYSE</div>
          <div style={{fontSize:9,letterSpacing:2,color:"#ffffff22",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>NOM</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Titre de la source, Type de document..." style={{width:"100%",padding:"9px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:6,color:"#fff",fontSize:11,outline:"none",fontFamily:"'JetBrains Mono',monospace",marginBottom:12}}/>
          <div style={{fontSize:9,letterSpacing:2,color:"#ffffff22",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>PROMPT POUR CLAUDE</div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={3} placeholder="Ex: Extrais le titre exact de la source..." style={{width:"100%",padding:"9px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:6,color:"#fff",fontSize:10,outline:"none",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.5,resize:"vertical",marginBottom:12}}/>
          <div style={{fontSize:9,letterSpacing:2,color:"#ffffff22",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>MODE</div>
          <div style={{display:"flex",gap:5,marginBottom:12}}>
            <button type="button" onClick={()=>setRaw(true)} style={{flex:1,padding:"10px",borderRadius:6,border:`1px solid ${raw?color+"35":"#ffffff08"}`,background:raw?`${color}0a`:"transparent",cursor:"pointer",textAlign:"left"}}><div style={{fontSize:10,fontWeight:700,color:raw?color:"#ffffff44",marginBottom:2}}>DonnÃƒÂ©e brute</div><div style={{fontSize:8,color:"#ffffff20"}}>Pas de valeurs prÃƒÂ©dÃƒÂ©finies</div></button>
            <button type="button" onClick={()=>setRaw(false)} style={{flex:1,padding:"10px",borderRadius:6,border:`1px solid ${!raw?color+"35":"#ffffff08"}`,background:!raw?`${color}0a`:"transparent",cursor:"pointer",textAlign:"left"}}><div style={{fontSize:10,fontWeight:700,color:!raw?color:"#ffffff44",marginBottom:2}}>Valeurs dÃƒÂ©finies</div><div style={{fontSize:8,color:"#ffffff20"}}>L'IA choisit parmi votre liste</div></button>
          </div>
          {!raw&&<><div style={{fontSize:9,letterSpacing:2,color:"#ffffff22",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>VALEURS (virgules)</div><input value={valsStr} onChange={e=>setValsStr(e.target.value)} placeholder="Val1, Val2, Val3..." style={{width:"100%",padding:"9px 10px",boxSizing:"border-box",background:"rgba(255,255,255,0.025)",border:"1px solid #ffffff08",borderRadius:6,color:"#fff",fontSize:10,outline:"none",fontFamily:"'JetBrains Mono',monospace",marginBottom:12}}/></>}
          <div style={{fontSize:9,letterSpacing:2,color:"#ffffff22",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>COULEUR</div>
          <div style={{display:"flex",gap:3,marginBottom:16}}>{CS.map(c=>(<button key={c} type="button" onClick={()=>setColor(c)} style={{width:20,height:20,borderRadius:4,background:c,border:color===c?"2px solid #fff":"2px solid transparent",cursor:"pointer",opacity:color===c?1:0.25}}/>))}</div>
          <div style={{display:"flex",gap:6}}>
            <button type="button" onClick={onClose} style={{flex:1,padding:11,borderRadius:8,border:"1px solid #ffffff08",background:"transparent",color:"#ffffff25",fontSize:10,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>ANNULER</button>
            <button type="button" onClick={add} style={{flex:2,padding:11,borderRadius:8,border:`1px solid ${color}30`,background:`${color}0a`,color,fontSize:10,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>CRÃƒâ€°ER</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function ONYXRadar({onBack}){
  const[srcF,setSrcF]=useState(INIT_SRC);const[engines,setEngines]=useState(INIT_ENGINES);const[articles,setArticles]=useState(INIT_ARTS);const[alerts,setAlerts]=useState(INIT_ALERTS);const[notifs,setNotifs]=useState(INIT_NOTIFS);
  const[showAlerts,setShowAlerts]=useState(false);const[showNews,setShowNews]=useState(false);const[showAuto,setShowAuto]=useState(false);const[showNew,setShowNew]=useState(false);const[showAdd,setShowAdd]=useState(false);const[editEng,setEditEng]=useState(null);const[showAISetup,setShowAISetup]=useState(false);
  const[selArtId,setSelArtId]=useState(null);const[filter,setFilter]=useState({t:"all"});const[q,setQ]=useState("");const[col,setCol]=useState(false);const[selIds,setSelIds]=useState([]);
  const[showDupes,setShowDupes]=useState(true);
  const[ctxMenu,setCtxMenu]=useState(null); // {folderId,x,y}
  const[sortBy,setSortBy]=useState("date"); // "date","source","status"

  const selArt=useMemo(()=>selArtId?articles.find(a=>a.id===selArtId):null,[selArtId,articles]);
  const unreadNotifs=notifs.filter(n=>!n.read).length;

  useEffect(()=>{const l=document.createElement("link");l.href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap";l.rel="stylesheet";document.head.appendChild(l);},[]);

  const tSrc=(fid)=>setSrcF(p=>p.map(f=>f.id===fid?{...f,exp:!f.exp}:f));
  const tSel=(aid)=>setSelIds(p=>p.includes(aid)?p.filter(i=>i!==aid):[...p,aid]);
  const addNote=(aid,n)=>setArticles(p=>p.map(a=>a.id!==aid?a:{...a,notes:[...a.notes,n]}));
  const rmNote=(aid,n)=>setArticles(p=>p.map(a=>a.id!==aid?a:{...a,notes:a.notes.filter(t=>t!==n)}));
  const addSource=(data)=>{
    if(data.folderName){
      const nf={id:data.folderId,name:data.folderName,color:["#00f0ff","#b026ff","#ffb800","#00ff87","#ff003c"][Math.floor(Math.random()*5)],exp:true,sources:[{id:`s${Date.now()}`,name:data.name,type:data.type,ok:true,withStatic:data.withStatic}]};
      setSrcF(p=>[...p,nf]);
    } else {
      setSrcF(p=>p.map(f=>f.id===data.folderId?{...f,sources:[...f.sources,{id:`s${Date.now()}`,name:data.name,type:data.type,ok:true,withStatic:data.withStatic}]}:f));
    }
  };
  const applyAISetup=(data)=>{
    const nf={id:`sf${Date.now()}${Math.random()}`,name:data.folderName,color:data.color||["#00f0ff","#b026ff","#ffb800","#00ff87","#ff003c"][Math.floor(Math.random()*5)],exp:true,sources:data.sources.map(s=>({id:s.id||`s${Date.now()}${Math.random()}`,name:s.name,type:s.type||"rss",ok:true,withStatic:false}))};
    setSrcF(p=>[...p,nf]);
  };
  const rmAn=(aid,eid,val)=>setArticles(p=>p.map(a=>{if(a.id!==aid)return a;const na={...a.an};if(na[eid])na[eid]=na[eid].filter(v=>v!==val);if(na[eid]&&!na[eid].length)delete na[eid];return{...a,an:na};}));
  const engCnt=(eid)=>articles.filter(a=>a.an[eid]?.length>0).length;
  const allAn=articles.filter(a=>Object.keys(a.an).length>0).length;

  // Folder reorder
  const moveFolder=(fid,dir)=>{setSrcF(p=>{const i=p.findIndex(f=>f.id===fid);if(i<0)return p;const ni=i+dir;if(ni<0||ni>=p.length)return p;const n=[...p];[n[i],n[ni]]=[n[ni],n[i]];return n;});};
  // Context menu actions
  const ctxRename=(fid)=>{const f=srcF.find(x=>x.id===fid);const nn=prompt("Renommer :",f?.name);if(nn&&nn.trim())setSrcF(p=>p.map(x=>x.id===fid?{...x,name:nn.trim()}:x));setCtxMenu(null);};
  const ctxDuplicate=(fid)=>{const f=srcF.find(x=>x.id===fid);if(f)setSrcF(p=>[...p,{...f,id:`sf${Date.now()}`,name:f.name+" (copie)",sources:f.sources.map(s=>({...s,id:`s${Date.now()}${Math.random()}`}))}]);setCtxMenu(null);};
  const ctxArchiveAll=(fid)=>{setSrcF(p=>p.map(f=>f.id===fid?{...f,sources:f.sources.map(s=>({...s,withStatic:true}))}:f));setCtxMenu(null);};
  const ctxDelete=(fid)=>{setSrcF(p=>p.filter(f=>f.id!==fid));setCtxMenu(null);};
  const ctxColor=(fid,c)=>{setSrcF(p=>p.map(f=>f.id===fid?{...f,color:c}:f));setCtxMenu(null);};
  // Export archive to CSV
  const exportArchive=()=>{
    const rows=[["Source","Titre","RÃƒÂ©sumÃƒÂ©","Date","URL"]];
    articles.filter(a=>a.isStatic).forEach(a=>{rows.push([a.sn,a.title,a.sum,a.date,a.url]);});
    // For demo, also export all articles as sample
    if(rows.length<2) articles.forEach(a=>{rows.push([a.sn,a.title,a.sum,a.date,a.url]);});
    const csv=rows.map(r=>r.map(c=>`"${(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="onyx_archive.csv";a.click();
  };

  // Build deduplicated feed
  const buildFeed=()=>{
    let list=articles.filter(a=>{
      if(filter.t==="src"&&!a.sf.includes(filter.id))return false;
      if(filter.t==="static"&&!a.isStatic)return false;
      if(filter.t==="an"&&(!a.an[filter.id]||!a.an[filter.id].length))return false;
      if(filter.t==="allAn"&&!Object.keys(a.an).length)return false;
      if(q){const ql=q.toLowerCase();return a.title.toLowerCase().includes(ql)||a.sum.toLowerCase().includes(ql);}
      return true;
    });
    if(showDupes){
      // Group by cluster, keep first of each cluster + all non-clustered
      const seen=new Set();const result=[];
      for(const a of list){
        if(!a.cluster){result.push({...a,clusterCount:0});}
        else if(!seen.has(a.cluster)){
          seen.add(a.cluster);
          const siblings=list.filter(x=>x.cluster===a.cluster);
          result.push({...a,clusterCount:siblings.length});
        }
      }
      return result;
    }
    return list.map(a=>({...a,clusterCount:0}));
  };
  const feed=useMemo(()=>{
    const f=buildFeed();
    if(sortBy==="source") return [...f].sort((a,b)=>a.sn.localeCompare(b.sn));
    if(sortBy==="status") return [...f].sort((a,b)=>Object.keys(b.an).length-Object.keys(a.an).length);
    return f; // default: date order (as-is)
  },[articles,filter,q,showDupes,sortBy,srcF]);

  const handleAuto=(res,mode)=>{setArticles(p=>p.map(a=>{const r=res.find(x=>x.aid===a.id);if(!r)return a;const na=mode==="overwrite"?{...r.na}:{...a.an};if(mode==="merge")Object.entries(r.na).forEach(([eid,vals])=>{na[eid]=[...new Set([...(na[eid]||[]),...vals])];});return{...a,an:na,ai:r.sum};}));setSelIds([]);};

  // Simple auto modal
  const AutoModal=()=>{
    const[selE,setSelE]=useState(engines.filter(e=>e.active).map(e=>e.id));const[run,setRun]=useState(false);const[done,setDone]=useState(false);const[res,setRes]=useState([]);const[mode,setMode]=useState("merge");
    const sa=articles.filter(a=>selIds.includes(a.id));const hasEx=sa.some(a=>Object.keys(a.an).length>0);
    const go=()=>{setRun(true);setTimeout(()=>{const r=sa.map(art=>{const na={};selE.forEach(eid=>{const en=engines.find(e=>e.id===eid);if(!en)return;if(en.extractRaw){na[eid]=["DonnÃƒÂ©e brute"];} else{const av=en.values.filter(v=>v.on);if(!av.length)return;na[eid]=av.sort(()=>0.5-Math.random()).slice(0,en.name==="Sentiment"?1:Math.floor(Math.random()*2)+1).map(p=>p.v);}});return{aid:art.id,na,sum:Object.values(na).flat().join(" \u2014 ")};});setRes(r);setRun(false);setDone(true);},2200);};
    const apply=()=>{handleAuto(res,mode);setShowAuto(false);};
    return(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setShowAuto(false)}><div onClick={e=>e.stopPropagation()} style={{width:480,maxWidth:"94vw",maxHeight:"85vh",overflow:"auto",background:"#0b0b18",border:"1px solid #ffffff12",borderRadius:16,position:"relative"}}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg, #b026ff, #00f0ff)",borderRadius:"16px 16px 0 0"}}/><div style={{padding:"22px 20px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>{IC.sparkle}<span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,letterSpacing:2}}>AUTO-ANALYSE</span><span style={{marginLeft:"auto",fontSize:9,color:"#ffffff20",fontFamily:"'JetBrains Mono',monospace"}}>{sa.length} art.</span></div>
      {!done?(<>
        {hasEx&&<div style={{display:"flex",gap:5,marginBottom:12}}>{[{m:"merge",l:"Fusionner",c:"#00ff87"},{m:"overwrite",l:"Ãƒâ€°craser",c:"#ff003c"}].map(o=>(<button key={o.m} type="button" onClick={()=>setMode(o.m)} style={{flex:1,padding:8,borderRadius:6,border:`1px solid ${mode===o.m?o.c+"30":"#ffffff06"}`,background:mode===o.m?`${o.c}08`:"transparent",cursor:"pointer",fontSize:10,fontWeight:600,color:mode===o.m?o.c:"#ffffff40",textAlign:"center"}}>{o.l}</button>))}</div>}
        <div style={{marginBottom:12}}>{engines.filter(e=>e.active).map(en=>{const sel=selE.includes(en.id);return(<button key={en.id} type="button" onClick={()=>setSelE(p=>p.includes(en.id)?p.filter(i=>i!==en.id):[...p,en.id])} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"7px 9px",borderRadius:6,marginBottom:2,border:`1px solid ${sel?en.color+"22":"#ffffff04"}`,background:sel?`${en.color}06`:"transparent",cursor:"pointer"}}><span style={{width:14,height:14,borderRadius:3,border:`2px solid ${sel?en.color:"#ffffff0d"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sel&&<span style={{width:6,height:6,borderRadius:2,background:en.color}}/>}</span><span style={{fontSize:12}}>{en.icon}</span><span style={{flex:1,fontSize:10,fontWeight:600,color:sel?en.color:"#ffffff38"}}>{en.name}</span></button>);})}</div>
        <div style={{display:"flex",gap:5}}><button type="button" onClick={()=>setShowAuto(false)} style={{flex:1,padding:9,borderRadius:6,border:"1px solid #ffffff06",background:"transparent",color:"#ffffff22",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>ANNULER</button><button type="button" onClick={go} disabled={run} style={{flex:2,padding:9,borderRadius:6,border:"1px solid #b026ff30",background:run?"transparent":"rgba(176,38,255,0.06)",color:"#b026ff",fontSize:9,letterSpacing:2,cursor:run?"wait":"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{run?<>{IC.loader} ANALYSE...</>:<>{IC.sparkle} LANCER</>}</button></div>
      </>):(<>
        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:10}}>{IC.check}<span style={{fontSize:11,fontWeight:600,color:"#00ff87"}}>TerminÃƒÂ©</span></div>
        <div style={{maxHeight:180,overflow:"auto",marginBottom:10}}>{res.map(r=>{const art=articles.find(a=>a.id===r.aid);return(<div key={r.aid} style={{padding:8,borderRadius:5,background:"rgba(255,255,255,0.01)",border:"1px solid #ffffff04",marginBottom:2}}><div style={{fontSize:9,color:"#ffffff55",marginBottom:3}}>{art?.title}</div><div style={{display:"flex",flexWrap:"wrap",gap:2}}>{Object.entries(r.na).map(([eid,vals])=>{const en=engines.find(e=>e.id===eid);return vals.map((v,i)=>(<ETag key={`${eid}${i}`} label={v} color={en?.color||"#fff"}/>));})}</div></div>);})}</div>
        <div style={{display:"flex",gap:5}}><button type="button" onClick={()=>setShowAuto(false)} style={{flex:1,padding:9,borderRadius:6,border:"1px solid #ffffff06",background:"transparent",color:"#ffffff22",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>ANNULER</button><button type="button" onClick={apply} style={{flex:2,padding:9,borderRadius:6,border:"1px solid #00ff8730",background:"rgba(0,255,135,0.05)",color:"#00ff87",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>APPLIQUER</button></div>
      </>)}
    </div></div></div>);
  };

  return(
    <div style={{display:"flex",height:"100vh",width:"100%",background:"#07070d",fontFamily:"'Outfit',sans-serif",color:"#fff",overflow:"hidden"}}>
      {/* SIDEBAR */}
      <aside style={{width:col?44:225,minWidth:col?44:225,borderRight:"1px solid #ffffff05",background:"#090912",display:"flex",flexDirection:"column",transition:"0.25s",overflow:"hidden"}}>
        <div style={{padding:col?"10px 5px":"10px 10px",borderBottom:"1px solid #ffffff04",display:"flex",alignItems:"center",justifyContent:col?"center":"space-between"}}>
          {!col&&<div style={{display:"flex",alignItems:"center",gap:6}}>{onBack&&<button type="button" onClick={onBack} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 6px",borderRadius:4,border:"1px solid #00f0ff12",background:"rgba(0,240,255,0.03)",color:"#00f0ff",cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>{IC.back}<span>Accueil</span></button>}<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:20,height:20,borderRadius:4,background:"linear-gradient(135deg, #00f0ff, #b026ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,fontFamily:"'Orbitron',sans-serif",boxShadow:"0 0 8px rgba(0,240,255,0.2)"}}>O</div><div><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,letterSpacing:3,background:"linear-gradient(90deg, #00f0ff, #b026ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ONYX</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,letterSpacing:2,color:"#ffffff15"}}>RADAR</div></div></div></div>}
          <button type="button" onClick={()=>setCol(!col)} style={{background:"none",border:"none",color:"#ffffff15",cursor:"pointer",fontSize:9}}>{col?"\u2192":"\u2190"}</button>
        </div>
        {!col&&<div style={{flex:1,overflow:"auto",padding:"6px 8px"}}>
          <button type="button" onClick={()=>setFilter({t:"all"})} style={{width:"100%",padding:"5px 6px",borderRadius:4,border:"none",background:filter.t==="all"?"rgba(255,255,255,0.03)":"transparent",color:filter.t==="all"?"#ffffff80":"#ffffff20",fontSize:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:5,marginBottom:4}}>{"\u25C9"} Tous <span style={{marginLeft:"auto",fontSize:7,color:"#ffffff10",fontFamily:"'JetBrains Mono',monospace"}}>{articles.length}</span></button>

          <div style={{fontSize:7,letterSpacing:3,color:"#ffffff0d",fontFamily:"'JetBrains Mono',monospace",padding:"8px 4px 3px",display:"flex",alignItems:"center",gap:4}}><span style={{flex:1,height:1,background:"#ffffff05"}}/><span>SOURCES</span><span style={{flex:1,height:1,background:"#ffffff05"}}/></div>
          <div style={{display:"flex",gap:3,marginBottom:4}}>
            <button type="button" onClick={()=>setShowAdd(true)} style={{flex:1,padding:"5px 6px",borderRadius:4,border:"1px solid #00f0ff12",background:"rgba(0,240,255,0.02)",color:"#00f0ff",fontSize:8,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>{IC.plus} SOURCE</button>
            <button type="button" onClick={()=>setShowAISetup(true)} style={{flex:1,padding:"5px 6px",borderRadius:4,border:"1px solid #b026ff12",background:"rgba(176,38,255,0.02)",color:"#b026ff",fontSize:8,letterSpacing:2,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>{IC.sparkle} IA</button>
          </div>

          {/* Dynamic source folders */}
          {srcF.map((f,fi)=>(<div key={f.id}>
            <div style={{display:"flex",alignItems:"center",position:"relative"}}>
              {/* Reorder arrows */}
              <div style={{display:"flex",flexDirection:"column",marginRight:2}}>
                <button type="button" onClick={()=>moveFolder(f.id,-1)} style={{background:"none",border:"none",color:fi===0?"#ffffff05":"#ffffff15",cursor:fi===0?"default":"pointer",padding:0,fontSize:7,lineHeight:1}}>{"\u25B2"}</button>
                <button type="button" onClick={()=>moveFolder(f.id,1)} style={{background:"none",border:"none",color:fi===srcF.length-1?"#ffffff05":"#ffffff15",cursor:fi===srcF.length-1?"default":"pointer",padding:0,fontSize:7,lineHeight:1}}>{"\u25BC"}</button>
              </div>
              <button type="button" onClick={()=>{tSrc(f.id);setFilter({t:"src",id:f.id});}}
                onContextMenu={e=>{e.preventDefault();setCtxMenu({fid:f.id,x:e.clientX,y:e.clientY});}}
                style={{flex:1,padding:"4px 5px",borderRadius:4,border:"none",background:filter.t==="src"&&filter.id===f.id?`${f.color}06`:"transparent",color:filter.t==="src"&&filter.id===f.id?"#ffffff70":"#ffffff22",fontSize:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:4}}>
                {IC.chev(f.exp)}{IC.folder(f.color)}<span style={{flex:1}}>{f.name}</span>
              </button>
            </div>
            {f.exp&&f.sources.map(s=>(<div key={s.id} style={{padding:"2px 5px 2px 32px",display:"flex",alignItems:"center",gap:3,fontSize:8,color:"#ffffff15"}}>
              {s.type==="rss"?IC.rss:IC.scrape}
              <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
              {IC.dot(s.ok?"#00ff87":"#ff003c")}
              <button type="button" onClick={()=>setSrcF(p=>p.map(ff=>ff.id!==f.id?ff:{...ff,sources:ff.sources.filter(x=>x.id!==s.id)}))} style={{background:"none",border:"none",color:"#ffffff06",cursor:"pointer",padding:0,display:"flex",fontSize:7}} onMouseEnter={e=>{e.currentTarget.style.color="#ff003c";}} onMouseLeave={e=>{e.currentTarget.style.color="#ffffff06";}}>x</button>
            </div>))}
          </div>))}

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ ARCHIVES Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div style={{fontSize:7,letterSpacing:3,color:"#ffffff0d",fontFamily:"'JetBrains Mono',monospace",padding:"10px 4px 3px",display:"flex",alignItems:"center",gap:4}}><span style={{flex:1,height:1,background:"#ffb80008"}}/><span style={{color:"#ffb80033"}}>ARCHIVES</span><span style={{flex:1,height:1,background:"#ffb80008"}}/></div>
          {(()=>{
            const staticSources=srcF.flatMap(f=>f.sources.filter(s=>s.withStatic).map(s=>({...s,folderId:f.id,folderName:f.name,folderColor:f.color})));
            return staticSources.length>0?(<>
              {/* All archives */}
              <button type="button" onClick={()=>setFilter({t:"static",id:"all"})} style={{width:"100%",padding:"4px 6px",borderRadius:4,border:"none",background:filter.t==="static"&&filter.id==="all"?"rgba(255,184,0,0.06)":"transparent",color:filter.t==="static"&&filter.id==="all"?"#ffb800":"#ffffff1a",fontSize:9,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:4,marginBottom:1}}>
                <span style={{fontSize:7,color:"#ffb80040"}}>{"\u25A3"}</span>
                <span style={{flex:1}}>Toutes les archives</span>
                <span style={{fontSize:6,color:"#ffb80025",fontFamily:"'JetBrains Mono',monospace"}}>{staticSources.length}</span>
              </button>
              {/* Individual archive sources */}
              {staticSources.map(s=>(<button key={s.id+"_ar"} type="button" onClick={()=>setFilter({t:"static",id:s.id})} style={{width:"100%",padding:"3px 6px 3px 16px",borderRadius:3,border:"none",background:filter.t==="static"&&filter.id===s.id?"rgba(255,184,0,0.05)":"transparent",color:filter.t==="static"&&filter.id===s.id?"#ffb800":"#ffffff15",fontSize:8,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:4,height:4,borderRadius:1,background:s.folderColor,flexShrink:0}}/>
                <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
                <span style={{fontSize:6,color:"#ffb80020",fontFamily:"'JetBrains Mono',monospace"}}>figÃƒÂ©</span>
              </button>))}
            </>):(<div style={{padding:"4px 6px",fontSize:8,color:"#ffffff0d",fontStyle:"italic"}}>Aucune source archivÃƒÂ©e</div>);
          })()}
          <button type="button" onClick={exportArchive} style={{width:"100%",padding:"4px 6px",borderRadius:3,border:"1px dashed #ffb80010",background:"transparent",color:"#ffb80025",fontSize:7,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginTop:3,marginBottom:2}}>EXPORTER TOUTES LES ARCHIVES</button>

          <div style={{fontSize:7,letterSpacing:3,color:"#ffffff0d",fontFamily:"'JetBrains Mono',monospace",padding:"10px 4px 3px",display:"flex",alignItems:"center",gap:4}}><span style={{flex:1,height:1,background:"#ffffff05"}}/><span>ANALYSE</span><span style={{flex:1,height:1,background:"#ffffff05"}}/></div>
          <button type="button" onClick={()=>setFilter({t:"allAn"})} style={{width:"100%",padding:"4px 6px",borderRadius:4,border:"none",background:filter.t==="allAn"?"rgba(176,38,255,0.06)":"transparent",color:filter.t==="allAn"?"#b026ff":"#ffffff22",fontSize:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:5,marginBottom:2}}>{"\u25C8"} Toutes <span style={{marginLeft:"auto",fontSize:7,color:"#ffffff10",fontFamily:"'JetBrains Mono',monospace"}}>{allAn}</span></button>
          {engines.filter(e=>e.active).map(en=>(<div key={en.id} style={{display:"flex",alignItems:"center"}}><button type="button" onClick={()=>setFilter({t:"an",id:en.id})} style={{flex:1,padding:"4px 6px",borderRadius:4,border:"none",background:filter.t==="an"&&filter.id===en.id?`${en.color}08`:"transparent",color:filter.t==="an"&&filter.id===en.id?en.color:"#ffffff22",fontSize:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11,color:filter.t==="an"&&filter.id===en.id?en.color:"#ffffff25"}}>{en.icon}</span><span style={{flex:1}}>{en.name}</span>{engCnt(en.id)>0&&<span style={{fontSize:7,color:`${en.color}44`,fontFamily:"'JetBrains Mono',monospace"}}>{engCnt(en.id)}</span>}</button><button type="button" onClick={e=>{e.stopPropagation();setEditEng(en);}} style={{background:"none",border:"none",color:"#ffffff0d",cursor:"pointer",padding:2,display:"flex"}} onMouseEnter={e=>{e.currentTarget.style.color=en.color;}} onMouseLeave={e=>{e.currentTarget.style.color="#ffffff0d";}}>{IC.gear}</button></div>))}
          <button type="button" onClick={()=>setShowNew(true)} style={{width:"100%",padding:"5px 6px",borderRadius:4,border:"1px dashed #ffffff08",background:"transparent",color:"#ffffff18",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginTop:3}}>{IC.plus} Nouvelle analyse</button>

          {/* NEWSLETTER */}
          <div style={{fontSize:7,letterSpacing:3,color:"#ffffff0d",fontFamily:"'JetBrains Mono',monospace",padding:"10px 4px 3px",display:"flex",alignItems:"center",gap:4}}><span style={{flex:1,height:1,background:"#ffffff05"}}/><span>DIFFUSION</span><span style={{flex:1,height:1,background:"#ffffff05"}}/></div>
          <button type="button" onClick={()=>setShowNews(true)} style={{width:"100%",padding:"4px 6px",borderRadius:4,border:"none",background:showNews?"rgba(0,240,255,0.06)":"transparent",color:showNews?"#00f0ff":"#ffffff22",fontSize:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:5}}>{IC.mail} Newsletter</button>

          <div style={{fontSize:7,letterSpacing:3,color:"#ffffff0d",fontFamily:"'JetBrains Mono',monospace",padding:"10px 4px 3px",display:"flex",alignItems:"center",gap:4}}><span style={{flex:1,height:1,background:"#ffffff05"}}/><span>NOTES</span><span style={{flex:1,height:1,background:"#ffffff05"}}/></div>
          {[...new Set(articles.flatMap(a=>a.notes))].map(tag=>(<div key={tag} style={{padding:"3px 6px",fontSize:9,color:"#ffffff20",fontStyle:"italic",display:"flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:2,background:"#ffffff12"}}/>{tag}<span style={{marginLeft:"auto",fontSize:7,color:"#ffffff0a"}}>{articles.filter(a=>a.notes.includes(tag)).length}</span></div>))}
        </div>}
      </aside>

      {/* MAIN */}
      <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* HEADER */}
        <header style={{padding:"7px 14px",borderBottom:"1px solid #ffffff04",display:"flex",alignItems:"center",gap:6,background:"#09091280"}}>
          <div style={{position:"relative",flex:1,maxWidth:240}}><span style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)"}}>{IC.search}</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher..." style={{width:"100%",padding:"6px 7px 6px 24px",boxSizing:"border-box",background:"rgba(255,255,255,0.01)",border:"1px solid #ffffff03",borderRadius:4,color:"#fff",fontSize:10,outline:"none"}}/></div>

          {/* Dedup toggle */}
          <button type="button" onClick={()=>setShowDupes(!showDupes)} style={{padding:"4px 9px",borderRadius:4,border:`1px solid ${showDupes?"#00f0ff22":"#ffffff06"}`,background:showDupes?"rgba(0,240,255,0.04)":"transparent",color:showDupes?"#00f0ff":"#ffffff22",fontSize:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",gap:3}}>{IC.layers} DÃƒÂ©dup.</button>

          {/* Sort controls */}
          <div style={{display:"flex",gap:2,alignItems:"center"}}>
            <span style={{fontSize:7,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace"}}>Tri:</span>
            {[{k:"date",l:"Date"},{k:"source",l:"Source"},{k:"status",l:"Statut"}].map(s=>(<button key={s.k} type="button" onClick={()=>setSortBy(s.k)} style={{padding:"3px 7px",borderRadius:3,border:`1px solid ${sortBy===s.k?"#ffffff18":"#ffffff04"}`,background:sortBy===s.k?"#ffffff08":"transparent",color:sortBy===s.k?"#ffffff66":"#ffffff18",fontSize:7,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{s.l}</button>))}
          </div>

          <span style={{flex:1}}/>

          {/* Selection actions */}
          {selIds.length>0&&(<>
            <span style={{fontSize:8,color:"#00f0ff55",fontFamily:"'JetBrains Mono',monospace"}}>{selIds.length} sÃƒÂ©l.</span>
            <button type="button" onClick={()=>setShowAuto(true)} style={{padding:"4px 9px",borderRadius:4,border:"1px solid #b026ff28",background:"rgba(176,38,255,0.04)",color:"#b026ff",fontSize:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",gap:3}}>{IC.sparkle} Analyser</button>
            <button type="button" onClick={()=>setSelIds([])} style={{padding:"4px 5px",borderRadius:3,border:"1px solid #ffffff05",background:"transparent",color:"#ffffff15",fontSize:8,cursor:"pointer"}}>x</button>
          </>)}

          {/* Export button - visible when viewing archives */}
          {filter.t==="static"&&(
            <button type="button" onClick={exportArchive} style={{padding:"4px 9px",borderRadius:4,border:"1px solid #ffb80020",background:"rgba(255,184,0,0.04)",color:"#ffb800",fontSize:8,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",gap:3}}>CSV</button>
          )}

          {/* Alerts bell */}
          <button type="button" onClick={()=>setShowAlerts(true)} style={{position:"relative",background:"none",border:"none",color:unreadNotifs>0?"#ff003c":"#ffffff22",cursor:"pointer",padding:4,display:"flex"}}>
            {IC.bell}
            {unreadNotifs>0&&<span style={{position:"absolute",top:-2,right:-2,width:14,height:14,borderRadius:7,background:"#ff003c",color:"#fff",fontSize:7,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadNotifs}</span>}
          </button>
        </header>

        {/* CONTENT */}
        <div style={{flex:1,overflow:"auto",padding:"10px 14px"}}>
          {selArt?(
            <div style={{height:"100%",overflow:"auto"}}>
              <button type="button" onClick={()=>setSelArtId(null)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 0 12px",background:"none",border:"none",color:"#00f0ff",cursor:"pointer",fontSize:10}}>{IC.back} Retour</button>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7}}><span style={{padding:"2px 6px",borderRadius:3,background:`${selArt.sc}0d`,border:`1px solid ${selArt.sc}1a`,color:selArt.sc,fontSize:8,letterSpacing:2,fontFamily:"'JetBrains Mono',monospace"}}>{selArt.sn}</span><span style={{fontSize:8,color:"#ffffff18",fontFamily:"'JetBrains Mono',monospace"}}>{selArt.date}</span></div>
              <h1 style={{fontSize:20,fontWeight:700,lineHeight:1.35,color:"#ffffffee",marginBottom:8}}>{selArt.title}</h1>
              {selArt.ai&&<div style={{padding:8,borderRadius:5,background:"rgba(176,38,255,0.03)",border:"1px solid #b026ff0a",marginBottom:12,fontSize:9,color:"#b026ff66",fontStyle:"italic",fontFamily:"'JetBrains Mono',monospace"}}>{"\u2728"} {selArt.ai}</div>}
              {engines.filter(e=>e.active&&selArt.an[e.id]?.length>0).map(en=>(<div key={en.id} style={{marginBottom:8}}><div style={{fontSize:8,letterSpacing:2,color:`${en.color}55`,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{en.icon} {en.name.toUpperCase()}</div><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{selArt.an[en.id].map((v,i)=>(<ETag key={i} label={v} color={en.color} onRemove={()=>rmAn(selArt.id,en.id,v)}/>))}</div></div>))}
              {Object.keys(selArt.an).length===0&&<div style={{fontSize:9,color:"#ffffff12",fontStyle:"italic",marginBottom:10}}>Pas encore analysÃƒÂ©</div>}
              <div style={{marginBottom:14,marginTop:10}}><div style={{fontSize:8,letterSpacing:2,color:"#ffffff12",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>NOTES</div><NoteInput art={selArt} onAdd={addNote} onRemove={rmNote}/></div>
              <div style={{fontSize:13,lineHeight:1.8,color:"#ffffff80",whiteSpace:"pre-line",marginBottom:22}}>{selArt.content}</div>
              {/* Show cluster siblings */}
              {selArt.cluster&&(<div style={{marginBottom:16}}><div style={{fontSize:8,letterSpacing:2,color:"#00f0ff44",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>{IC.layers} ARTICLES SIMILAIRES</div>{articles.filter(a=>a.cluster===selArt.cluster&&a.id!==selArt.id).map(a=>(<div key={a.id} onClick={()=>setSelArtId(a.id)} style={{padding:"7px 10px",borderRadius:5,background:"rgba(0,240,255,0.02)",border:"1px solid #00f0ff10",marginBottom:3,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:8,color:a.sc,fontWeight:600}}>{a.sn}</span><span style={{fontSize:9,color:"#ffffff55",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</span></div>))}</div>)}
              <a href={selArt.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,padding:"6px 10px",borderRadius:4,border:"1px solid #ffffff05",background:"rgba(255,255,255,0.008)",color:"#ffffff44",fontSize:9,textDecoration:"none",fontFamily:"'JetBrains Mono',monospace"}}>{IC.link} Source</a>
            </div>
          ):(
            <>
              <div style={{marginBottom:8}}><h2 style={{fontSize:14,fontWeight:600,marginBottom:1}}>{filter.t==="all"?"Tous les flux":filter.t==="src"?srcF.find(f=>f.id===filter.id)?.name:filter.t==="allAn"?"Toutes les analyses":engines.find(e=>e.id===filter.id)?.name}</h2><span style={{fontSize:8,color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace"}}>{feed.length} articles{showDupes?" (dÃƒÂ©dupliquÃƒÂ©)":""}</span></div>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {feed.map(art=>{
                  const isSel=selIds.includes(art.id);const hasAn=Object.keys(art.an).length>0;
                  return(<div key={art.id} style={{padding:"10px 11px",borderRadius:6,border:`1px solid ${isSel?"#00f0ff1a":"#ffffff03"}`,borderLeft:`3px solid ${art.sc}`,background:isSel?"rgba(0,240,255,0.015)":"rgba(255,255,255,0.004)",transition:"0.1s"}} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="rgba(255,255,255,0.01)";}} onMouseLeave={e=>{e.currentTarget.style.background=isSel?"rgba(0,240,255,0.015)":"rgba(255,255,255,0.004)";}}>
                    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                      <button type="button" onClick={e=>{e.stopPropagation();tSel(art.id);}} style={{width:15,height:15,borderRadius:3,flexShrink:0,border:`1.5px solid ${isSel?"#00f0ff":"#ffffff0a"}`,background:isSel?"#00f0ff15":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&<span style={{color:"#00f0ff",fontSize:7,fontWeight:700}}>{"\u2713"}</span>}</button>
                      <span style={{fontSize:10,fontWeight:600,color:art.sc}}>{art.sn}</span>
                      {art.st&&<span style={{padding:"0 4px",borderRadius:2,background:`${art.sc}12`,color:art.sc,fontSize:7,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{art.st}</span>}
                      {art.rg&&<span style={{padding:"0 4px",borderRadius:2,background:"#ffffff03",color:"#ffffff28",fontSize:7,fontFamily:"'JetBrains Mono',monospace"}}>{art.rg}</span>}
                      {art.clusterCount>1&&<ClusterBadge count={art.clusterCount}/>}
                      <span style={{flex:1}}/>
                      <span style={{fontSize:8,color:"#ffffff10",fontFamily:"'JetBrains Mono',monospace"}}>{art.date}</span>
                      {!hasAn&&<span style={{fontSize:7,padding:"1px 4px",borderRadius:2,background:"#ffffff04",color:"#ffffff15",fontFamily:"'JetBrains Mono',monospace"}}>non analysÃƒÂ©</span>}
                      <span onClick={()=>setSelArtId(art.id)} style={{cursor:"pointer",display:"flex"}}>{IC.arrow}</span>
                    </div>
                    <div onClick={()=>setSelArtId(art.id)} style={{fontSize:12,fontWeight:600,color:"#ffffffdd",lineHeight:1.4,marginBottom:2,cursor:"pointer"}}>{art.title}</div>
                    {art.ai&&<div style={{fontSize:8,color:"#b026ff40",fontStyle:"italic",marginBottom:2,fontFamily:"'JetBrains Mono',monospace"}}>{"\u2728"} {art.ai}</div>}
                    <div onClick={()=>setSelArtId(art.id)} style={{fontSize:10,color:"#ffffff20",lineHeight:1.4,marginBottom:5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",cursor:"pointer"}}>{art.sum}</div>
                    {hasAn&&<div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:4}}>{engines.filter(e=>art.an[e.id]?.length>0).map(en=>art.an[en.id].map((v,i)=>(<ETag key={`${en.id}${i}`} label={v} color={en.color}/>)))}</div>}
                    <NoteInput art={art} onAdd={addNote} onRemove={rmNote}/>
                  </div>);
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* CONTEXT MENU */}
      {ctxMenu&&(<>
        <div onClick={()=>setCtxMenu(null)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:998}}/>
        <div style={{position:"fixed",left:ctxMenu.x,top:ctxMenu.y,width:160,background:"#111122",border:"1px solid #ffffff12",borderRadius:8,boxShadow:"0 8px 30px rgba(0,0,0,0.6)",zIndex:999,padding:4}}>
          {[
            {l:"Renommer",fn:()=>ctxRename(ctxMenu.fid),c:"#ffffffaa"},
            {l:"Dupliquer",fn:()=>ctxDuplicate(ctxMenu.fid),c:"#ffffffaa"},
            {l:"Archiver le contenu",fn:()=>ctxArchiveAll(ctxMenu.fid),c:"#ffb800"},
            {l:"Couleur",fn:null,c:"#ffffff55",isSub:true},
            {l:"Supprimer",fn:()=>ctxDelete(ctxMenu.fid),c:"#ff003c"},
          ].map((item,i)=>(
            item.isSub?(
              <div key={i} style={{padding:"4px 8px"}}>
                <div style={{fontSize:8,color:"#ffffff33",marginBottom:3}}>Couleur</div>
                <div style={{display:"flex",gap:2}}>
                  {["#00f0ff","#b026ff","#ff003c","#ffb800","#00ff87","#3b82f6","#f97316"].map(c=>(
                    <button key={c} type="button" onClick={()=>ctxColor(ctxMenu.fid,c)} style={{width:14,height:14,borderRadius:3,background:c,border:"none",cursor:"pointer",opacity:0.7}}/>
                  ))}
                </div>
              </div>
            ):(
              <button key={i} type="button" onClick={item.fn} style={{width:"100%",padding:"6px 10px",borderRadius:4,border:"none",background:"transparent",color:item.c,fontSize:9,cursor:"pointer",textAlign:"left",fontFamily:"'JetBrains Mono',monospace"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>{item.l}</button>
            )
          ))}
        </div>
      </>)}

      {/* PANELS */}
      {showAlerts&&<AlertsPanel alerts={alerts} setAlerts={setAlerts} notifs={notifs} setNotifs={setNotifs} engines={engines} onClose={()=>setShowAlerts(false)} onGoToArticle={(aid)=>setSelArtId(aid)}/>}
      {showNews&&<NewsletterPanel articles={articles} engines={engines} selIds={selIds} onClose={()=>setShowNews(false)}/>}
      {showAuto&&<AutoModal/>}
      {showNew&&<NewEngineModal onClose={()=>setShowNew(false)} onAdd={(en)=>setEngines(p=>[...p,en])}/>}
      {showAdd&&<AddSourceModal onClose={()=>setShowAdd(false)} folders={srcF} onAddSource={addSource}/>}
      {editEng&&<EngineSettings engine={editEng} onSave={en=>setEngines(p=>p.map(e=>e.id===en.id?en:e))} onClose={()=>setEditEng(null)}/>}
      {showAISetup&&<AISetupPanel onClose={()=>setShowAISetup(false)} onApply={applyAISetup} engines={engines}/>}

      <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#ffffff04;border-radius:2px}a{color:inherit}button{font-family:inherit}`}</style>
    </div>
  );
}
