import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Eye, MapPin, Send, Bell, ArrowRight, ChevronUp, Users, CheckCircle2, Clock, Shield, Megaphone, BarChart3 } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    ["Despre", "#despre"],
    ["Functionalitati", "#functionalitati"],
    ["Cum functioneaza", "#cum-functioneaza"],
    ["Statistici", "#statistici"],
  ];

  return (
    <div className="font-[Inter,sans-serif] text-gray-900 overflow-x-hidden">
      <style>{`
        .scroll-animate{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}
        .scroll-animate.animate-in{opacity:1!important;transform:translate(0)!important}
        .delay-1{transition-delay:.1s}.delay-2{transition-delay:.2s}.delay-3{transition-delay:.3s}
        .count-num{transition:all 0.3s ease}
      `}</style>

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-gray-200/60">
        <div className="flex items-center justify-between h-16 px-4 md:px-12 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke="#2563EB" strokeWidth="2.2" fill="none"/>
              <ellipse cx="16" cy="12" rx="5" ry="3.5" stroke="#2563EB" strokeWidth="1.8" fill="none"/>
              <circle cx="16" cy="12" r="1.5" fill="#2563EB"/>
            </svg>
            <span className="font-bold text-base text-gray-900">Orașul Vede</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} className="text-gray-500 font-medium text-sm no-underline hover:text-gray-900 transition-colors">{label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="bg-transparent border-none text-gray-600 font-medium text-sm cursor-pointer px-4 py-2 hover:text-gray-900 transition-colors">Autentificare</button>
            <button onClick={() => navigate("/register")} className="bg-gray-900 text-white border-none rounded-lg font-medium text-sm cursor-pointer px-4 py-2.5 hover:bg-gray-800 transition-colors">Incepe acum</button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-transparent border-none cursor-pointer text-gray-700">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-6 pt-2">
            <div className="flex flex-col gap-1">
              {navLinks.map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium text-base no-underline py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors">{label}</a>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-4 flex flex-col gap-3">
              <button onClick={() => { setMobileMenuOpen(false); navigate("/login") }} className="w-full h-12 bg-transparent border border-gray-200 text-gray-700 font-semibold text-base cursor-pointer rounded-xl hover:border-gray-400 transition-colors">Autentificare</button>
              <button onClick={() => { setMobileMenuOpen(false); navigate("/register") }} className="w-full h-12 bg-gray-900 text-white border-none font-semibold text-base cursor-pointer rounded-xl hover:bg-gray-800 transition-colors">Incepe acum</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="scroll-animate inline-flex items-center gap-2 bg-primary-50 text-primary-600 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Platforma civica
          </div>
          <h1 className="scroll-animate delay-1 text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5">
            Implica-te in{" "}
            <span className="text-primary-600">orasul tau</span>
          </h1>
          <p className="scroll-animate delay-2 text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            Raporteaza probleme urbane, urmareste rezolvarea lor pe harta si contribuie la un oras mai sigur pentru toti.
          </p>
          <div className="scroll-animate delay-3 flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <button onClick={() => navigate("/register")} className="h-12 bg-gray-900 text-white border-none rounded-xl font-semibold text-sm cursor-pointer px-6 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              Raporteaza acum
              <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate("/harta")} className="h-12 bg-transparent text-gray-700 border border-gray-300 rounded-xl font-medium text-sm cursor-pointer px-6 hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
              <MapPin size={16} />
              Exploreaza harta
            </button>
          </div>
          <div className="flex justify-center gap-8 md:gap-12">
            {[
              ["1,247", "Probleme raportate"],
              ["3,500+", "Utilizatori activi"],
              ["69%", "Rata de rezolvare"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-xl md:text-2xl font-extrabold text-gray-900">{val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Despre ─────────────────────────────────────────────────── */}
      <section id="despre" className="py-16 md:py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="scroll-animate text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Despre</p>
            <h2 className="scroll-animate delay-1 text-2xl md:text-4xl font-extrabold tracking-tight">Un instrument dedicat comunitatii tale</h2>
            <p className="scroll-animate delay-2 text-gray-500 text-sm md:text-base leading-relaxed mt-4 max-w-lg mx-auto">
              Fiecare problema semnalata ajunge pe o harta comuna, vizibila pentru toata lumea. Fii vocea cartierului tau.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              [Shield, "Transparenta", "Fiecare problema raportata este vizibila pentru toata comunitatea. Urmareste progresul in timp real."],
              [Megaphone, "Implicare civica", "Transforma observatiile tale in actiuni concrete. Fii vocea cartierului tau."],
              [CheckCircle2, "Impact real", "Problemele raportate ajung direct la autoritati. Contribuie la un mediu urban mai sigur."],
            ].map(([Icon, title, desc]) => (
              <div key={title} className="scroll-animate bg-white rounded-xl p-5 md:p-6 border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-gray-600" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Functionalitati ────────────────────────────────────────── */}
      <section id="functionalitati" className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="scroll-animate text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Functionalitati</p>
            <h2 className="scroll-animate delay-1 text-2xl md:text-4xl font-extrabold tracking-tight">Tot ce ai nevoie intr-o singura aplicatie</h2>
          </div>

          <div className="space-y-12 md:space-y-20">
            {/* Feature 1: Feed */}
            <div className="scroll-animate grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div>
                <h3 className="font-bold text-xl md:text-2xl mb-3">Feed probleme</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">Urmareste si voteaza problemele raportate in comunitatea ta. Filtreaza dupa categorii si status.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {["Toate", "Infrastructura", "Iluminat", "Trafic"].map((f, i) => (
                    <span key={f} className={`rounded-md px-3 py-1 text-xs font-medium ${i === 0 ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>{f}</span>
                  ))}
                </div>
                {[
                  ["Groapa pe Calea Victoriei", "Infrastructura", "In lucru", "24"],
                  ["Stalp iluminat defect", "Iluminat", "Raportat", "12"],
                  ["Gunoi neridictat Bd. Unirii", "Gunoi", "Rezolvat", "8"],
                ].map(([title, cat, status, votes]) => (
                  <div key={title} className="bg-white rounded-lg p-3 mb-2 last:mb-0 border border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm mb-1">{title}</div>
                      <div className="flex gap-1.5">
                        <span className="bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-xs font-medium">{cat}</span>
                        <span className="bg-gray-50 text-gray-400 rounded px-2 py-0.5 text-xs">{status}</span>
                      </div>
                    </div>
                    <span className="text-gray-900 font-semibold text-sm flex items-center gap-0.5">
                      <ChevronUp size={14} /> {votes}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 2: Map */}
            <div className="scroll-animate grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="md:order-2">
                <h3 className="font-bold text-xl md:text-2xl mb-3">Harta interactiva</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">Vizualizeaza toate problemele pe o harta cu legende si filtre pe categorii.</p>
              </div>
              <div className="md:order-1 rounded-xl overflow-hidden border border-gray-200">
                <img src="/app-map.png" alt="Harta interactiva" className="w-full block" />
              </div>
            </div>

            {/* Feature 3: Report flow */}
            <div className="scroll-animate grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div>
                <h3 className="font-bold text-xl md:text-2xl mb-3">Raportare pas cu pas</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">Formular intuitiv cu 5 pasi simpli: categorie, locatie, detalii, fotografii si confirmare.</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center mb-5 overflow-hidden">
                  {["Categorie", "Locatie", "Detalii", "Foto", "Gata"].map((label, i) => (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>{i + 1}</div>
                        <span className={`text-[10px] font-medium whitespace-nowrap ${i === 0 ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                      </div>
                      {i < 4 && <div className="h-px flex-1 bg-gray-200 mx-1 mb-5" />}
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-sm text-gray-700 mb-3">Selecteaza categoria</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Infrastructura", "Iluminat", "Trafic", "Trotuare", "Parcuri", "Gunoi"].map((label) => (
                      <div key={label} className="bg-white border border-gray-200 rounded-lg py-2.5 px-2 text-center">
                        <span className="text-xs font-medium text-gray-700">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Leaderboard */}
            <div className="scroll-animate grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="md:order-2">
                <h3 className="font-bold text-xl md:text-2xl mb-3">Clasamente si statistici</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">Top utilizatori activi, cele mai problematice strazi si statistici detaliate pe categorii.</p>
              </div>
              <div className="md:order-1 bg-white rounded-xl p-5 border border-gray-200">
                <p className="font-semibold text-sm mb-3">Top contribuitori</p>
                {[
                  ["Ion Popescu", "95 rapoarte", "2,150 pts", "1"],
                  ["Elena Georgescu", "82 rapoarte", "1,890 pts", "2"],
                  ["Maria Ionescu", "67 rapoarte", "1,250 pts", "3"],
                ].map(([name, sub, pts, rank]) => (
                  <div key={name} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-bold text-gray-400 w-4">{rank}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{name}</div>
                      <div className="text-xs text-gray-400">{sub}</div>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 5: Profile */}
            <div className="scroll-animate grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div>
                <h3 className="font-bold text-xl md:text-2xl mb-3">Profil si progres</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">Urmareste activitatea ta, castiga badge-uri si urca in clasament prin contributii.</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-base text-gray-500 flex-shrink-0">IP</div>
                  <div>
                    <div className="font-semibold text-base">Ion Popescu</div>
                    <div className="text-xs text-gray-400">Membru din Ianuarie 2025</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[["95", "Raportari"], ["#1", "Clasament"], ["69%", "Rezolvate"]].map(([val, label]) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">{val}</div>
                      <div className="text-xs text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cum functioneaza ───────────────────────────────────────── */}
      <section id="cum-functioneaza" className="py-16 md:py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="scroll-animate text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Cum functioneaza</p>
            <h2 className="scroll-animate delay-1 text-2xl md:text-4xl font-extrabold tracking-tight">4 pasi simpli pentru un oras mai bun</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[
              [Eye, "Observa problema", "Fotografiaza groapa, stalpul defect sau orice problema din oras."],
              [MapPin, "Marcheaza pe harta", "Selecteaza locatia exacta folosind harta interactiva."],
              [Send, "Trimite raportul", "Adauga detalii, selecteaza categoria si trimite in cateva secunde."],
              [Bell, "Urmareste progresul", "Primesti notificari cand problema e analizata sau rezolvata."],
            ].map(([Icon, title, desc], i) => (
              <div key={title} className="scroll-animate bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                </div>
                <Icon size={20} className="text-gray-900 mb-3" strokeWidth={1.8} />
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistici ─────────────────────────────────────────────── */}
      <section id="statistici" className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="scroll-animate text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Statistici</p>
          <h2 className="scroll-animate delay-1 text-2xl md:text-4xl font-extrabold tracking-tight mb-10 md:mb-14">Impactul comunitatii in cifre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[
              [BarChart3, "1,247", "Total probleme"],
              [CheckCircle2, "856", "Rezolvate"],
              [Clock, "234", "In lucru"],
              [Users, "69%", "Rata rezolvare"],
            ].map(([Icon, val, label]) => (
              <div key={label} className="scroll-animate bg-gray-50 rounded-xl p-5 md:p-8">
                <Icon size={18} className="text-gray-400 mx-auto mb-3" strokeWidth={1.8} />
                <div className="text-2xl md:text-3xl font-extrabold text-gray-900 count-num" data-target={val}>{val}</div>
                <div className="text-xs text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimoniale ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p className="scroll-animate text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Testimoniale</p>
            <h2 className="scroll-animate delay-1 text-2xl md:text-4xl font-extrabold tracking-tight">Ce spun utilizatorii nostri</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              ["Am raportat o groapa enorma pe strada mea si in 5 zile a fost reparata. Incredibil cat de simplu e sa faci diferenta!", "Andrei Popa", "Locuitor in Sector 3", "AP"],
              ["Folosesc Orasul Vede de 6 luni. Am raportat peste 80 de probleme si majoritatea au fost rezolvate.", "Elena Georgescu", "Voluntar comunitar", "EG"],
              ["Clasamentul ma motiveaza sa fiu mai atenta la problemele din cartier. Simt ca fac parte dintr-o comunitate reala.", "Maria Ionescu", "Membra activa", "MI"],
              ["Am ajuns pe primul loc in clasament cu 95 de raportari. Functia de harta e extraordinara.", "Ion Popescu", "Top Reporter", "IP"],
            ].map(([quote, name, role, initials]) => (
              <div key={name} className="scroll-animate bg-white rounded-xl p-5 md:p-6 border border-gray-200">
                <svg width="24" height="18" viewBox="0 0 24 18" className="text-gray-200 mb-3" fill="currentColor">
                  <path d="M0 18V7.2C0 2.4 3.36.24 6.72 0l.72 1.44C4.8 2.4 4.08 4.56 4.08 6h3.36V18H0Zm13.44 0V7.2c0-4.8 3.36-6.96 6.72-7.2l.72 1.44c-2.64.96-3.36 3.12-3.36 6h3.36V18h-7.44Z"/>
                </svg>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-xs text-gray-500 flex-shrink-0">{initials}</div>
                  <div>
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-xs text-gray-400">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="scroll-animate text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-4">Pregatit sa faci diferenta?</h2>
          <p className="scroll-animate delay-1 text-gray-400 text-sm md:text-base leading-relaxed mb-8">Alatura-te comunitatii Orasul Vede si contribuie la imbunatatirea orasului tau.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/register")} className="h-12 bg-white text-gray-900 border-none rounded-xl font-semibold text-sm cursor-pointer px-6 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              Creeaza cont gratuit
              <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate("/harta")} className="h-12 bg-transparent text-gray-300 border border-gray-600 rounded-xl font-medium text-sm cursor-pointer px-6 hover:border-gray-400 hover:text-white transition-colors flex items-center justify-center">
              Afla mai multe
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 px-4 md:px-8 pt-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" stroke="#60a5fa" strokeWidth="2.2" fill="none"/>
                  <ellipse cx="16" cy="12" rx="5" ry="3.5" stroke="#60a5fa" strokeWidth="1.8" fill="none"/>
                  <circle cx="16" cy="12" r="1.5" fill="#60a5fa"/>
                </svg>
                <span className="font-bold text-sm text-white">Orasul Vede</span>
              </div>
              <p className="text-sm leading-relaxed">Platforma de implicare civica pentru un oras mai bun.</p>
            </div>
            {[
              ["Platforma", ["Functionalitati", "Harta", "Clasamente"]],
              ["Resurse", ["Cum functioneaza", "FAQ", "Contact"]],
              ["Legal", ["Termeni si conditii", "Confidentialitate", "Cookies"]],
            ].map(([title, links]) => (
              <div key={title}>
                <div className="font-semibold text-white text-xs uppercase tracking-wider mb-3">{title}</div>
                {links.map(l => (
                  <div key={l} className="mb-2 text-sm cursor-pointer hover:text-gray-300 transition-colors">{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
            <span>2026 Orasul Vede. Toate drepturile rezervate.</span>
            <span>Facut pentru comunitate</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
