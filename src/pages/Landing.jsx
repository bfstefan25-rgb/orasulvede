import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const PARK_BG = "/park-bg.jpg";

function PieChart() {
  const slices = [[0,85,"#f97316"],[85,155,"#f59e0b"],[155,210,"#ef4444"],[210,248,"#8b5cf6"],[248,278,"#22c55e"],[278,305,"#6b7280"],[305,328,"#3b82f6"],[328,360,"#111827"]];
  function pt(deg) { const r = ((deg-90)*Math.PI)/180; return [45+40*Math.cos(r), 45+40*Math.sin(r)]; }
  function arc(s,e) { const [x1,y1]=pt(s); const [x2,y2]=pt(e); return "M45,45 L"+x1+","+y1+" A40,40 0 "+(e-s>180?1:0)+",1 "+x2+","+y2+" Z"; }
  return (<svg width="90" height="90" viewBox="0 0 90 90">{slices.map(([s,e,c],i)=><path key={i} d={arc(s,e)} fill={c} stroke="#fff" strokeWidth="1.5"/>)}</svg>);
}

function BarChart() {
  const data = [["Centru",175],["C.Vechi",155],["Dorobanti",140],["Titan",130],["Obor",115],["Militari",100],["Tineret",92]];
  return (
    <svg width="100%" height="110" viewBox="0 0 168 110">
      {data.map(([l,v],i) => {
        const bh = Math.round((v/180)*85); const x = i*24+2;
        return (<g key={l}><rect x={x} y={85-bh} width="18" height={bh} fill="#8b5cf6" rx="2"/><text x={x+9} y="100" textAnchor="middle" fontSize="6" fill="#6b7280">{l}</text></g>);
      })}
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("animate-in"); }); },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".scroll-animate").forEach((el) => observerRef.current.observe(el));
    return () => observerRef.current && observerRef.current.disconnect();
  }, []);
useEffect(() => {
    const nums = document.querySelectorAll(".count-num");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = el.getAttribute("data-target");
        const isPercent = target.includes("%");
        const isPlus = target.includes("+");
        const isComma = target.includes(",");
        const num = parseInt(target.replace(/[^0-9]/g, ""));
        let start = 0;
        const duration = 1500;
        const step = Math.ceil(num / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= num) { start = num; clearInterval(timer); }
          let display = start.toLocaleString("ro-RO");
          if (isPercent) display = start + "%";
          if (isPlus) display = start.toLocaleString("en-US") + "+";
          el.textContent = display;
        }, 16);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, []);
  const streetData = [["Bulevardul Unirii",45,100],["Calea Victoriei",38,84],["Strada Parcului",32,71],["Calea Dorobanti",28,62],["Aleea Florilor",24,53]];
  const topUsers = [
    ["Ion Popescu","95 rap. 78 rez.","2,150","#fef9c3","#854d0e","1",true],
    ["Elena Georgescu","82 rap. 65 rez.","1,890","#f3f4f6","#374151","2",false],
    ["Maria Ionescu","67 rap. 45 rez.","1,250","#fff7ed","#9a3412","3",false],
    ["Andrei Mihai","58 rap. 42 rez.","1,120","#f9fafb","#6b7280","4",false]
  ];
  const feedItems = [
    ["Groapa pe Calea Victoriei","Infrastructura","În lucru","24","#dbeafe","#2563EB"],
    ["Stalp iluminat defect","Iluminat","Raportat","12","#fef9c3","#d97706"],
    ["Gunoi neridcat Bd. Unirii","Gunoi","Rezolvat","8","#d1fae5","#059669"],
    ["Trotuar deteriorat","Trotuare","În lucru","31","#ede9fe","#7c3aed"]
  ];
  const mapPins = [[205,100,"#ef4444"],[215,112,"#ef4444"],[202,122,"#f59e0b"],[218,120,"#3b82f6"],[208,132,"#f97316"],[201,142,"#8b5cf6"],[220,106,"#6b7280"],[212,145,"#22c55e"]];
  const catChips = [["Infrastructura","#fff5f5","#ef4444"],["Iluminat","#fffbeb","#d97706"],["Trafic","#fef2f2","#ef4444"],["Trotuare","#f5f3ff","#7c3aed"],["Parcuri","#f0fdf4","#16a34a"],["Gunoi","#f9fafb","#6b7280"],["Animale","#eff6ff","#2563eb"],["Alte pericole","#f9fafb","#111827"]];

  return (
    <div style={{fontFamily:"Inter,sans-serif",color:"#1a1a2e",overflowX:"hidden"}}>
      <style>{`
        .scroll-animate{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease}
        .scroll-animate.fade-left{transform:translateX(-40px)}
        .scroll-animate.fade-right{transform:translateX(40px)}
        .scroll-animate.animate-in{opacity:1!important;transform:translate(0)!important}
        .delay-100{transition-delay:.1s}.delay-200{transition-delay:.2s}.delay-300{transition-delay:.3s}
        .nav-link:hover{color:#2563EB!important}
.count-num{transition:all 0.3s ease}
      `}</style>

      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(255,255,255,0.93)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 48px",height:"64px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",cursor:"pointer"}} onClick={()=>navigate("/")}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke="#2563EB" strokeWidth="2.2" fill="none"/>
            <ellipse cx="16" cy="12" rx="5" ry="3.5" stroke="#2563EB" strokeWidth="1.8" fill="none"/>
            <circle cx="16" cy="12" r="1.5" fill="#2563EB"/>
          </svg>
          <span style={{fontWeight:700,fontSize:"18px",color:"#2563EB"}}>Orașul Vede</span>
        </div>
        <div style={{display:"flex",gap:"32px",alignItems:"center"}}>
          {[["Despre","#despre"],["Funcționalități","#functionalitati"],["Cum funcționează","#cum-functioneaza"],["Statistici","#statistici"]].map(([label,href])=>(
            <a key={label} href={href} className="nav-link" style={{color:"#4b5563",fontWeight:500,fontSize:"15px",textDecoration:"none"}}>{label}</a>
          ))}
        </div>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          <button onClick={()=>navigate("/login")} style={{background:"none",border:"none",color:"#4b5563",fontWeight:500,fontSize:"15px",cursor:"pointer",padding:"8px 16px"}}>Autentificare</button>
          <button onClick={()=>navigate("/register")} style={{background:"#2563EB",color:"#fff",border:"none",borderRadius:"10px",fontWeight:600,fontSize:"15px",cursor:"pointer",padding:"10px 22px"}}>Începe acum</button>
        </div>
      </nav>

      <section style={{minHeight:"100vh",position:"relative",backgroundImage:"url("+PARK_BG+")",backgroundSize:"cover",backgroundPosition:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.3),rgba(0,0,0,0.15))"}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center",marginTop:"80px"}}>
          <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:"8px",background:"rgba(255,255,255,0.12)",backdropFilter:"blur(16px)",borderRadius:"20px",padding:"28px 48px",marginBottom:"32px",border:"1px solid rgba(255,255,255,0.15)"}}>
            <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke="#60a5fa" strokeWidth="2.2" fill="none"/>
              <ellipse cx="16" cy="12" rx="5" ry="3.5" stroke="#60a5fa" strokeWidth="1.8" fill="none"/>
              <circle cx="16" cy="12" r="1.5" fill="#60a5fa"/>
            </svg>
            <span style={{fontSize:"32px",fontWeight:800,color:"#60a5fa"}}>Orașul Vede</span>
            <span style={{color:"rgba(255,255,255,0.8)",fontSize:"15px"}}>Cetățenii văd, orașul răspunde</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.97)",borderRadius:"24px",padding:"48px 56px",maxWidth:"680px",boxShadow:"0 24px 80px rgba(0,0,0,0.2)"}}>
            <span style={{display:"inline-block",background:"#EFF6FF",color:"#2563EB",borderRadius:"100px",padding:"5px 18px",fontSize:"12px",fontWeight:700,letterSpacing:"1.5px",marginBottom:"20px",textTransform:"uppercase"}}>orașul tău, vocea ta</span>
            <h1 style={{fontSize:"46px",fontWeight:900,lineHeight:1.1,margin:"0 0 20px",letterSpacing:"-1px"}}>
              Implică-te în <span style={{color:"#2563EB"}}>orașul tău</span>
            </h1>
            <p style={{color:"#6b7280",fontSize:"18px",lineHeight:1.6,marginBottom:"36px"}}>Raportează probleme urbane, Urmărește rezolvarea lor pe hartă si contribuie la un oraș mai sigur și mai curat pentru toți.</p>
            <div style={{display:"flex",gap:"14px",justifyContent:"center",marginBottom:"36px",flexWrap:"wrap"}}>
              <button onClick={()=>navigate("/Raporteaza")} style={{background:"#2563EB",color:"#fff",border:"none",borderRadius:"12px",fontWeight:700,fontSize:"17px",cursor:"pointer",padding:"14px 30px"}}>Raportează acum</button>
              <button onClick={()=>navigate("/harta")} style={{background:"transparent",color:"#1a1a2e",border:"2px solid #d1d5db",borderRadius:"12px",fontWeight:600,fontSize:"17px",cursor:"pointer",padding:"14px 30px"}}>Explorează harta</button>
            </div>
            <div style={{display:"flex",gap:"32px",justifyContent:"center"}}>
              {[["1,247","Probleme raportate","#2563EB"],["3,500+","Utilizatori activi","#7c3aed"],["69%","Rata de rezolvare","#059669"]].map(([val,label,col])=>(
                <div key={label} style={{textAlign:"center"}}>
                  <div style={{fontSize:"24px",fontWeight:800,color:col}}>{val}</div>
                  <div style={{fontSize:"13px",color:"#9ca3af"}}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="despre" style={{padding:"100px 48px",background:"#f8fafc",textAlign:"center"}}>
        <div style={{maxWidth:"900px",margin:"0 auto"}}>
          <p className="scroll-animate" style={{color:"#2563EB",fontWeight:700,letterSpacing:"2px",fontSize:"13px",textTransform:"uppercase",marginBottom:"8px"}}>Cetățenii văd · Orașul răspunde</p>
          <p className="scroll-animate delay-100" style={{color:"#2563EB",fontWeight:700,letterSpacing:"2px",fontSize:"13px",textTransform:"uppercase",marginBottom:"16px"}}>Despre Orașul Vede</p>
          <h2 className="scroll-animate delay-200" style={{fontSize:"40px",fontWeight:900,marginBottom:"20px"}}>Un instrument dedicat comunității tale</h2>
          <p className="scroll-animate delay-300" style={{color:"#6b7280",fontSize:"18px",lineHeight:1.7,marginBottom:"60px"}}>Fiecare groapă semnalată, fiecare stâlp defect sau problemă de mediu ajunge pe o hartă comună, vizibilă pentru toată lumea. Fii vocea cartierului tău!</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"32px"}}>
            {[["Transparență","Fiecare problemă raportată este vizibilă pentru toată comunitatea. Urmărește progresul în timp real."],["Implicare civică","Transformă observațiile tale în acțiuni concrete. Fii vocea cartierului tău."],["Impact real","Problemele raportate ajung direct la autorități. Contribuie la un mediu urban mai sigur."]].map(([title,desc])=>(
              <div key={title} className="scroll-animate" style={{background:"#fff",borderRadius:"20px",padding:"36px 28px",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",textAlign:"center"}}>
                <h3 style={{fontWeight:700,fontSize:"18px",marginBottom:"10px"}}>{title}</h3>
                <p style={{color:"#6b7280",lineHeight:1.6,margin:0}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="functionalitati" style={{padding:"100px 48px",background:"#fff"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <div className="scroll-animate" style={{textAlign:"center",marginBottom:"64px"}}>
            <p style={{color:"#2563EB",fontWeight:700,letterSpacing:"2px",fontSize:"13px",textTransform:"uppercase",marginBottom:"12px"}}>FUNCȚIONALITĂȚI</p>
            <h2 style={{fontSize:"40px",fontWeight:900}}>Tot ce ai nevoie intr-o <span style={{color:"#2563EB"}}>singură aplicație</span></h2>
          </div>

          <div className="scroll-animate fade-left" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"center",marginBottom:"80px"}}>
            <div>
              <h3 style={{fontWeight:800,fontSize:"26px",marginBottom:"12px"}}>Feed probleme</h3>
              <p style={{color:"#6b7280",fontSize:"16px",lineHeight:1.7}}>Urmărește si votează problemele raportate în comunitatea ta. Filtrează după categorii și status.</p>
            </div>
            <div style={{background:"#f8fafc",borderRadius:"20px",padding:"20px",border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex",gap:"8px",marginBottom:"14px",flexWrap:"wrap"}}>
                {["Toate","Infrastructura","Iluminat","Trafic"].map((f,i)=>(
                  <span key={f} style={{background:i===0?"#2563EB":"#e5e7eb",color:i===0?"#fff":"#4b5563",borderRadius:"100px",padding:"4px 14px",fontSize:"12px",fontWeight:600}}>{f}</span>
                ))}
              </div>
              {feedItems.map(([title,cat,status,votes,bg,color])=>(
                <div key={title} style={{background:"#fff",borderRadius:"12px",padding:"12px 14px",marginBottom:"8px",border:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:"13px",marginBottom:"4px"}}>{title}</div>
                    <div style={{display:"flex",gap:"6px"}}>
                      <span style={{background:bg,color,borderRadius:"100px",padding:"2px 10px",fontSize:"11px",fontWeight:600}}>{cat}</span>
                      <span style={{background:"#f3f4f6",color:"#6b7280",borderRadius:"100px",padding:"2px 10px",fontSize:"11px"}}>{status}</span>
                    </div>
                  </div>
                  <span style={{color:"#2563EB",fontWeight:700,fontSize:"13px"}}>▲ {votes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-animate fade-right" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"center",marginBottom:"80px"}}>
            <div style={{borderRadius:"20px",overflow:"hidden",border:"1px solid #e5e7eb",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
              <div style={{background:"#fff",padding:"10px 14px",display:"flex",alignItems:"center",gap:"8px",borderBottom:"1px solid #e5e7eb"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span style={{color:"#9ca3af",fontSize:"13px"}}>Caută probleme după titlu sau descriere...</span>
              </div>
              <div style={{background:"#fff",padding:"8px 10px",display:"flex",gap:"5px",flexWrap:"wrap",borderBottom:"1px solid #e5e7eb"}}>
                {catChips.map(([label,bg,color])=>(
                  <span key={label} style={{background:bg,color,borderRadius:"100px",padding:"3px 9px",fontSize:"10px",fontWeight:600,border:"1px solid #e5e7eb",whiteSpace:"nowrap"}}>{label}</span>
                ))}
              </div>
              <div style={{position:"relative",overflow:"hidden"}}>
                <img src="/app-map.png" alt="Harta interactivă" style={{width:"100%",display:"block",borderRadius:"0"}} />
                <div style={{position:"absolute",right:"10px",top:"10px",background:"#fff",borderRadius:"10px",padding:"10px 14px",boxShadow:"0 2px 10px rgba(0,0,0,0.15)",fontSize:"11px",minWidth:"130px"}}>
                  <div style={{fontWeight:700,marginBottom:"7px",fontSize:"12px"}}>Legendă</div>
                  {[["#f97316","Infrastructura"],["#f59e0b","Iluminat"],["#ef4444","Trafic"],["#8b5cf6","Trotuare"],["#22c55e","Parcuri"],["#6b7280","Gunoi"],["#3b82f6","Animale"],["#111","Alte pericole"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"3px"}}>
                      <div style={{width:"10px",height:"10px",borderRadius:"50%",background:c,flexShrink:0}}/>
                      <span style={{color:"#374151"}}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{position:"absolute",left:"10px",top:"10px",background:"#fff",borderRadius:"6px",boxShadow:"0 1px 5px rgba(0,0,0,0.2)",overflow:"hidden"}}>
                  <div style={{padding:"5px 9px",borderBottom:"1px solid #e5e7eb",fontWeight:800,fontSize:"15px",color:"#374151",lineHeight:1}}>+</div>
                  <div style={{padding:"5px 9px",fontWeight:800,fontSize:"15px",color:"#374151",lineHeight:1}}>-</div>
                </div>
              </div>
            </div>
            <div>
              <h3 style={{fontWeight:800,fontSize:"26px",marginBottom:"12px"}}>Hartă interactivă</h3>
              <p style={{color:"#6b7280",fontSize:"16px",lineHeight:1.7}}>Vizualizează toate problemele pe o hartă color-coded cu legendă si filtre pe categorii.</p>
            </div>
          </div>

          <div className="scroll-animate fade-left" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"center",marginBottom:"80px"}}>
            <div>
              <h3 style={{fontWeight:800,fontSize:"26px",marginBottom:"12px"}}>Raportare pas cu pas</h3>
              <p style={{color:"#6b7280",fontSize:"16px",lineHeight:1.7}}>Formular intuitiv cu 5 pași simpli: categorie, locație, detalii, fotografii și confirmare.</p>
            </div>
            <div style={{background:"#fff",borderRadius:"20px",padding:"24px",border:"1px solid #e5e7eb",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h4 style={{fontWeight:800,fontSize:"20px",margin:"0 0 4px"}}>Raportează o problemă</h4>
              <p style={{color:"#6b7280",fontSize:"13px",margin:"0 0 18px"}}>Ajută la îmbunătățirea orașului tău</p>
              <div style={{display:"flex",alignItems:"flex-start",marginBottom:"22px"}}>
                {[["1","Categorie",true],["2","Locatie",false],["3","Detalii",false],["4","Fotografii",false],["5","Confirmare",false]].map(([num,label,active],i)=>(
                  <div key={num} style={{display:"flex",alignItems:"center",flex:i<4?"1":"none"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"5px"}}>
                      <div style={{width:"34px",height:"34px",borderRadius:"50%",background:active?"#2563EB":"#e5e7eb",color:active?"#fff":"#9ca3af",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"14px"}}>{num}</div>
                      <span style={{fontSize:"10px",color:active?"#2563EB":"#9ca3af",fontWeight:active?700:400,whiteSpace:"nowrap"}}>{label}</span>
                    </div>
                    {i<4&&<div style={{height:"2px",flex:1,background:"#e5e7eb",margin:"0 3px",marginBottom:"18px"}}/>}
                  </div>
                ))}
              </div>
              <div style={{background:"#f8fafc",borderRadius:"14px",padding:"16px"}}>
                <p style={{fontWeight:600,fontSize:"14px",margin:"0 0 14px",color:"#374151"}}>Selectează categoria problemei</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"8px"}}>
                  {[["Infrastructura","#fff5f5"],["Iluminat","#fffbeb"],["Trafic","#fef2f2"],["Trotuare","#f5f3ff"],["Parcuri","#f0fdf4"],["Gunoi","#f9fafb"]].map(([label,bg])=>(
                    <div key={label} style={{background:bg,border:"1.5px solid #e5e7eb",borderRadius:"10px",padding:"12px 6px",textAlign:"center"}}>
                      <div style={{fontSize:"11px",fontWeight:600,color:"#374151"}}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px"}}>
                  {["Animale","Alte pericole"].map((label)=>(
                    <div key={label} style={{background:"#f9fafb",border:"1.5px solid #e5e7eb",borderRadius:"10px",padding:"12px 6px",textAlign:"center"}}>
                      <div style={{fontSize:"11px",fontWeight:600,color:"#374151"}}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-animate fade-right" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"center",marginBottom:"80px"}}>
            <div style={{background:"#fff",borderRadius:"20px",padding:"20px",border:"1px solid #e5e7eb",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
                <div style={{border:"1px solid #e5e7eb",borderRadius:"14px",padding:"14px"}}>
                  <div style={{fontWeight:700,fontSize:"12px",marginBottom:"10px"}}>Top utilizatori</div>
                  {topUsers.map(([name,sub,pts,bg,tc,medal,hl])=>(
                    <div key={name} style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"6px",padding:"6px 8px",borderRadius:"9px",background:bg,border:hl?"1.5px solid #fde047":"1.5px solid transparent"}}>
                      <span style={{fontSize:"11px",minWidth:"14px",fontWeight:700,color:tc}}>{medal}</span>
                      <div style={{width:"24px",height:"24px",borderRadius:"50%",background:"#d1d5db",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:700,color:"#6b7280",flexShrink:0}}>{name.split(" ").map(n=>n[0]).join("")}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:"10px",color:tc,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
                        <div style={{fontSize:"9px",color:"#9ca3af"}}>{sub}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontWeight:700,fontSize:"11px",color:"#1a1a2e"}}>{pts}</div>
                        <div style={{fontSize:"8px",color:"#9ca3af"}}>puncte</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{border:"1px solid #e5e7eb",borderRadius:"14px",padding:"14px"}}>
                  <div style={{fontWeight:700,fontSize:"11px",marginBottom:"10px",color:"#374151"}}>Cele mai problematice străzi</div>
                  {streetData.map(([street,count,pct],i)=>(
                    <div key={street} style={{marginBottom:"8px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px"}}>
                        <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
                          <span style={{fontWeight:700,fontSize:"9px",color:"#9ca3af",minWidth:"8px"}}>{i+1}</span>
                          <span style={{fontSize:"10px",fontWeight:600,color:"#1e40af"}}>{street}</span>
                        </div>
                        <span style={{fontSize:"10px",fontWeight:700,color:"#374151"}}>{count}</span>
                      </div>
                      <div style={{height:"5px",background:"#e5e7eb",borderRadius:"100px",overflow:"hidden"}}>
                        <div style={{height:"100%",width:pct+"%",background:"#ef4444",borderRadius:"100px"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                <div style={{border:"1px solid #e5e7eb",borderRadius:"14px",padding:"14px"}}>
                  <div style={{fontWeight:700,fontSize:"11px",marginBottom:"10px"}}>Probleme pe categorii</div>
                  <div style={{display:"flex",justifyContent:"center"}}><PieChart/></div>
                </div>
                <div style={{border:"1px solid #e5e7eb",borderRadius:"14px",padding:"14px"}}>
                  <div style={{fontWeight:700,fontSize:"11px",marginBottom:"6px"}}>Probleme pe cartiere</div>
                  <BarChart/>
                </div>
              </div>
            </div>
            <div>
              <h3 style={{fontWeight:800,fontSize:"26px",marginBottom:"12px"}}>Clasamente și statistici</h3>
              <p style={{color:"#6b7280",fontSize:"16px",lineHeight:1.7}}>Top utilizatori activi, cele mai problematice străzi și statistici detaliate pe categorii.</p>
            </div>
          </div>

          <div className="scroll-animate fade-left" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"center",marginBottom:"80px"}}>
            <div>
              <h3 style={{fontWeight:800,fontSize:"26px",marginBottom:"12px"}}>Profil și badge-uri</h3>
              <p style={{color:"#6b7280",fontSize:"16px",lineHeight:1.7}}>Urmărește activitatea ta, câștigă badge-uri și urcă în clasament prin contribuții.</p>
            </div>
            <div style={{background:"#fff",borderRadius:"20px",padding:"24px",border:"1px solid #e5e7eb",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px",paddingBottom:"16px",borderBottom:"1px solid #f3f4f6"}}>
                <div style={{width:"52px",height:"52px",borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"18px",color:"#2563EB",flexShrink:0}}>IP</div>
                <div>
                  <div style={{fontWeight:700,fontSize:"16px"}}>Ion Popescu</div>
                  <div style={{color:"#9ca3af",fontSize:"12px"}}>Membru din Ianuarie 2025</div>
                  <div style={{color:"#2563EB",fontSize:"12px",fontWeight:600,marginTop:"2px"}}>Nivel 4</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"20px"}}>
                {[["95","Raportari"],["#1","Clasament"],["69%","Rezolvate"]].map(([val,label])=>(
                  <div key={label} style={{background:"#f8fafc",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
                    <div style={{fontSize:"20px",fontWeight:800,color:"#2563EB"}}>{val}</div>
                    <div style={{fontSize:"11px",color:"#6b7280"}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:"8px",fontSize:"12px",fontWeight:700,color:"#374151"}}>Badge-uri câștigate</div>
              <div style={{display:"flex",gap:"10px"}}>{["🏆","⚡","🎯","🌟","💪"].map((b)=>(<span key={b} style={{fontSize:"24px"}}>{b}</span>))}</div>
            </div>
          </div>
        </div>
      </section>

<section id="cum-functioneaza" style={{padding:"100px 48px",background:"#f8fafc"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <div className="scroll-animate" style={{textAlign:"center",marginBottom:"64px"}}>
            <p style={{color:"#2563EB",fontWeight:700,letterSpacing:"2px",fontSize:"13px",textTransform:"uppercase",marginBottom:"12px"}}>CUM FUNCȚIONEAZĂ</p>
            <h2 style={{fontSize:"40px",fontWeight:900,marginBottom:"0"}}>4 pași simpli pentru un oraș mai bun</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"24px"}}>
            {[
              ["01","🔍","Observă problema","Fotografiază groapa, stâlpul defect sau orice problemă din oraș.","#EFF6FF","#2563EB"],
              ["02","📍","Marchează pe hartă","Selectează locația exactă folosind harta interactivă.","#F0FDF4","#16a34a"],
              ["03","📤","Trimite raportul","Adaugă detalii, selectează categoria și trimite în câteva secunde.","#FFF7ED","#d97706"],
              ["04","🔔","Urmărește progresul","Primești notificări când problema e analizată sau rezolvată.","#F5F3FF","#7c3aed"]
            ].map(([num,icon,title,desc,bg,color])=>(
              <div key={num} className="scroll-animate" style={{background:"#fff",borderRadius:"24px",padding:"32px 24px",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",textAlign:"left",position:"relative",overflow:"hidden"}}>
                
                <div style={{marginLeft:"auto",marginRight:"auto",marginBottom:"20px",width:"52px",height:"52px",borderRadius:"16px",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",marginBottom:"20px"}}>{icon}</div>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
                  <span style={{width:"28px",height:"28px",borderRadius:"50%",background:bg,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"13px",color:color,flexShrink:0}}>{num.replace("0","")}</span>
                  <h3 style={{fontWeight:800,fontSize:"16px",margin:0,color:"#1a1a2e",whiteSpace:"nowrap"}}>{title}</h3>
                </div>
                <p style={{color:"#6b7280",lineHeight:1.6,margin:0,fontSize:"14px"}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
<section id="statistici" style={{padding:"100px 48px",background:"#fff",textAlign:"center"}}>
        <div style={{maxWidth:"800px",margin:"0 auto"}}>
          <p style={{color:"#2563EB",fontWeight:700,letterSpacing:"2px",fontSize:"13px",textTransform:"uppercase",marginBottom:"12px"}}>STATISTICI GENERALE</p>
          <h2 style={{fontSize:"40px",fontWeight:900,marginBottom:"60px"}}>Impactul comunității Orașul Vede în cifre</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"32px"}}>
            {[["1,247","Total probleme","#2563EB"],["856","Rezolvate","#059669"],["234","În lucru","#d97706"],["69%","Rata rezolvare","#7c3aed"]].map(([val,label,col])=>(
              <div key={label} className="scroll-animate" style={{background:"#f8fafc",borderRadius:"20px",padding:"36px 20px"}}>
                <div style={{fontSize:"40px",fontWeight:900,color:col,marginBottom:"8px"}} className="count-num" data-target={val}>{val}</div>
                <div style={{color:"#6b7280",fontWeight:500}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:"100px 48px",background:"#f8fafc"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <div className="scroll-animate" style={{textAlign:"center",marginBottom:"64px"}}>
            <p style={{color:"#2563EB",fontWeight:700,letterSpacing:"2px",fontSize:"13px",textTransform:"uppercase",marginBottom:"12px"}}>TESTIMONIALE</p>
            <h2 style={{fontSize:"40px",fontWeight:900}}>Ce spun utilizatorii noștri</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"32px"}}>
            {[
              ["Am raportat o groapă enormă pe strada mea și în 5 zile a fost reparată. Incredibil cât de simplu e să faci diferența!","Andrei Popa","Locuitor în Sector 3","AP"],
              ["Folosesc Orașul Vede de 6 luni. Am raportat peste 80 de probleme și majoritatea au fost rezolvate. E cea mai bună platformă civică!","Elena Georgescu","Voluntar comunitar","EG"],
              ["Badge-urile și clasamentul mă motivează să fiu mai atentă la problemele din cartier. Simt că fac parte dintr-o comunitate reală.","Maria Ionescu","Membră activă","MI"],
              ["Am ajuns pe primul loc în clasament cu 95 de raportări. Funcția de hartă e extraordinară — vezi exact ce se întâmplă în zona ta.","Ion Popescu","Top Reporter","IP"]
            ].map(([quote,name,role,initials])=>(
              <div key={name} className="scroll-animate" style={{background:"#fff",borderRadius:"20px",padding:"36px",boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:"48px",color:"#2563EB",marginBottom:"4px",lineHeight:1,fontFamily:"Georgia,serif"}}>"</div>
                <p style={{color:"#374151",lineHeight:1.7,fontSize:"16px",marginBottom:"24px",fontStyle:"italic",marginTop:0}}>{quote}</p>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"14px",color:"#2563EB",flexShrink:0}}>{initials}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:"15px"}}>{name}</div>
                    <div style={{color:"#9ca3af",fontSize:"13px"}}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:"100px 48px",background:"linear-gradient(135deg,#1e40af,#2563EB)",textAlign:"center"}}>
        <div style={{maxWidth:"700px",margin:"0 auto"}}>
          <h2 className="scroll-animate" style={{fontSize:"42px",fontWeight:900,color:"#fff",marginBottom:"16px"}}>Pregătit să faci diferența?</h2>
          <p className="scroll-animate delay-100" style={{color:"rgba(255,255,255,0.8)",fontSize:"18px",lineHeight:1.6,marginBottom:"40px"}}>Alatura-te comunității Orașul Vede și contribuie la îmbunătățirea orașului tău.</p>
          <div style={{display:"flex",gap:"16px",justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>navigate("/register")} style={{background:"#fff",color:"#2563EB",border:"none",borderRadius:"12px",fontWeight:700,fontSize:"17px",cursor:"pointer",padding:"14px 32px"}}>Creează cont gratuit</button>
            <button onClick={()=>navigate("/harta")} style={{background:"transparent",color:"#fff",border:"2px solid rgba(255,255,255,0.5)",borderRadius:"12px",fontWeight:600,fontSize:"17px",cursor:"pointer",padding:"14px 32px"}}>Află mai multe</button>
          </div>
        </div>
      </section>

      <footer style={{background:"#0f172a",color:"#94a3b8",padding:"64px 48px 32px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:"48px",marginBottom:"48px"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke="#60a5fa" strokeWidth="2.2" fill="none"/>
                  <ellipse cx="16" cy="12" rx="5" ry="3.5" stroke="#60a5fa" strokeWidth="1.8" fill="none"/>
                  <circle cx="16" cy="12" r="1.5" fill="#60a5fa"/>
                </svg>
                <span style={{fontWeight:700,fontSize:"16px",color:"#fff"}}>Orașul Vede</span>
              </div>
              <p style={{lineHeight:1.7,fontSize:"14px"}}>Platformă de implicare civică pentru un oraș mai bun.</p>
            </div>
            {[["Platformă",["Funcționalități","Hartă","Clasamente"]],["Resurse",["Cum funcționează","FAQ","Contact"]],["Legal",["Termeni și condiții","Confidențialitate","Cookies"]]].map(([title,links])=>(
              <div key={title}>
                <div style={{fontWeight:700,color:"#fff",marginBottom:"16px",fontSize:"14px"}}>{title}</div>
                {links.map(l=>(<div key={l} style={{marginBottom:"10px",fontSize:"14px",cursor:"pointer"}}>{l}</div>))}
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid #1e293b",paddingTop:"32px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
            <span style={{fontSize:"14px"}}>© 2026 Orașul Vede. Toate drepturile rezervate.</span>
            <span style={{fontSize:"14px"}}>Făcut cu ❤️ pentru comunitate</span>
          </div>
        </div>
      </footer>
    </div>
  );
}