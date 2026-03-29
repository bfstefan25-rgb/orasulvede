import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle, Eye, Heart, Shield, ArrowRight, Grid, Map, FileText, Trophy, User, Bell, Star, Quote, MapPin } from 'lucide-react';

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function OrasulVedeLogo({ size = 40 }) {
  return (
<svg width={size} height={size} viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pin outline */}
      <path
        d="M20 2C12.268 2 6 8.268 6 16c0 10.5 14 28 14 28s14-17.5 14-28C34 8.268 27.732 2 20 2z"
        stroke="#2563EB"
        strokeWidth="2.2"
        fill="none"
      />
      {/* Eye white part */}
      <ellipse cx="20" cy="16" rx="7" ry="4.5" fill="white" fillOpacity="0.15"/>
      {/* Eye outline */}
      <path
        d="M13 16c0 0 3-5 7-5s7 5 7 5-3 5-7 5-7-5-7-5z"
        stroke="#2563EB"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Pupil */}
      <circle cx="20" cy="16" r="2" fill="#2563EB"/>
      {/* Pupil inner */}
      <circle cx="20" cy="16" r="0.8" fill="white"/>
    </svg>
  );
}

const PARK_BG = '/park-bg.jpg';

export default function Landing() {
  useScrollAnimation();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans">

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <OrasulVedeLogo size={36} />
            <span className="font-bold text-blue-600 text-xl tracking-tight">Orasul Vede</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['despre','Despre'],['functionalitati','Funcționalități'],['cum-functioneaza','Cum funcționează'],['statistici','Statistici']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors">
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors">Autentificare</Link>
            <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-blue-200">
              Începe acum
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url(" + PARK_BG + ")"}} />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex flex-col items-center gap-8 px-4">
          <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl px-14 py-10 flex items-center gap-6 shadow-2xl scroll-animate fade-up">
            <OrasulVedeLogo size={80} />
            <div>
              <h1 className="text-5xl font-extrabold text-blue-400 leading-none">Orasul Vede</h1>
              <p className="text-white/80 text-lg mt-1">Cetățenii văd, orașul răspunde</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl px-12 py-10 max-w-2xl w-full shadow-2xl scroll-animate fade-up delay-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
                Orașul tău, vocea ta
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
                Implică-te în{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                  orașul tău
                </span>
              </h2>
              <p className="text-slate-500 text-base mt-4 leading-relaxed">
                Raportează probleme urbane, urmărește rezolvarea lor pe hartă și contribuie la un oraș mai sigur și mai curat pentru toți.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mb-8">
              <Link to="/report" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5">
                Raportează acum <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/map" className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 font-semibold px-5 py-3.5 rounded-2xl border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50 transition-all">
                Explorează harta
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-100">
              {[
                { icon: MapPin, value: '1,247', label: 'Probleme raportate', color: 'text-blue-600 bg-blue-50' },
                { icon: Users, value: '3,500+', label: 'Utilizatori activi', color: 'text-indigo-600 bg-indigo-50' },
                { icon: CheckCircle, value: '69%', label: 'Rata de rezolvare', color: 'text-emerald-600 bg-emerald-50' },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-base leading-none">{value}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/70 text-sm tracking-widest uppercase scroll-animate fade-up delay-200">
            Cetățenii văd · Orașul răspunde
          </p>
        </div>
      </section>

      <section id="despre" className="py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-up">
            <div className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">DESPRE ORASULVEDE</div>
            <h2 className="text-4xl font-extrabold text-slate-900">
              Un instrument dedicat <span className="text-blue-600">comunității tale</span>
            </h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
              Fiecare groapă semnalată, fiecare stâlp defect sau problemă de mediu ajunge pe o hartă comună, vizibilă pentru toată lumea. <strong>Fii vocea cartierului tău!</strong>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: 'Transparență', desc: 'Fiecare problemă raportată este vizibilă pentru toată comunitatea. Urmărește progresul în timp real.', color: 'bg-blue-50 text-blue-600' },
              { icon: Heart, title: 'Implicare civică', desc: 'Transformă observațiile tale în acțiuni concrete. Fii vocea cartierului tău.', color: 'bg-indigo-50 text-indigo-600' },
              { icon: Shield, title: 'Impact real', desc: 'Problemele raportate ajung direct la autorități. Contribuie la un mediu urban mai sigur.', color: 'bg-emerald-50 text-emerald-600' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} className={`scroll-animate fade-up delay-${i * 100} bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-xl mb-3">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="functionalitati" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-up">
            <div className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">FUNCȚIONALITĂȚI</div>
            <h2 className="text-4xl font-extrabold text-slate-900">
              Tot ce ai nevoie într-o <span className="text-blue-600">singură aplicație</span>
            </h2>
          </div>
          {[
            { icon: Grid, title: 'Feed probleme', desc: 'Urmărește și votează problemele raportate în comunitatea ta. Filtrează după categorii și status.', reverse: false },
            { icon: Map, title: 'Hartă interactivă', desc: 'Vizualizează toate problemele pe o hartă color-coded cu legendă și filtre pe categorii.', reverse: true },
            { icon: FileText, title: 'Raportare pas cu pas', desc: 'Formular intuitiv cu 5 pași simpli: categorie, locație, detalii, fotografii și confirmare.', reverse: false },
            { icon: Trophy, title: 'Clasamente și statistici', desc: 'Top utilizatori activi, cele mai problematice străzi și statistici detaliate pe categorii.', reverse: true },
            { icon: User, title: 'Profil și badge-uri', desc: 'Urmărește activitatea ta, câștigă badge-uri și urcă în clasament prin contribuții.', reverse: false },
            { icon: Bell, title: 'Setări și notificări', desc: 'Configurează zonele tale, primește notificări locale și monitorizează problemele din apropiere.', reverse: true },
          ].map(({ icon: Icon, title, desc, reverse }, i) => (
            <div key={title} className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center mb-24 scroll-animate ${reverse ? 'fade-right' : 'fade-left'} delay-${(i % 3) * 100}`}>
              <div className="flex-1">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">{title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed">{desc}</p>
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 min-h-64 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Icon className="w-16 h-16 mx-auto mb-3 text-blue-200" />
                    <span className="text-sm">{title}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="cum-functioneaza" className="py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-up">
            <div className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">CUM FUNCȚIONEAZĂ</div>
            <h2 className="text-4xl font-extrabold text-slate-900">
              4 pași simpli pentru un <span className="text-blue-600">oraș mai bun</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Observă problema', desc: 'Fotografiază groapa, stâlpul defect sau orice problemă din oraș.' },
              { step: '2', title: 'Marchează pe hartă', desc: 'Selectează locația exactă folosind harta interactivă.' },
              { step: '3', title: 'Trimite raportul', desc: 'Adaugă detalii, selectează categoria și trimite raportul în câteva secunde.' },
              { step: '4', title: 'Urmărește progresul', desc: 'Primești notificări când problema este analizată, în lucru sau rezolvată.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className={`scroll-animate fade-up delay-${i * 100} text-center`}>
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-5 shadow-lg shadow-blue-200">
                  {step}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-animate fade-up">
            <div className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">TESTIMONIALE</div>
            <h2 className="text-4xl font-extrabold text-slate-900">
              Ce spun <span className="text-blue-600">utilizatorii noștri</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { quote: 'Am raportat o groapă enormă pe strada mea și în 5 zile a fost reparată. Incredibil cât de simplu e să faci diferența!', name: 'Andrei Popa', role: 'Locuitor în Sector 3', initials: 'AP', delay: 0 },
              { quote: 'Folosesc OrasulVede de 6 luni. Am raportat peste 80 de probleme și majoritatea au fost rezolvate. E cea mai bună platformă civică!', name: 'Elena Georgescu', role: 'Voluntar comunitar', initials: 'EG', delay: 100 },
              { quote: 'Badge-urile și clasamentul mă motivează să fiu mai atentă la problemele din cartier. Simt că fac parte dintr-o comunitate reală.', name: 'Maria Ionescu', role: 'Membră activă', initials: 'MI', delay: 200 },
              { quote: 'Am ajuns pe primul loc în clasament cu 95 de raportări. Funcția de hartă e extraordinară — vezi exact ce se întâmplă în zona ta.', name: 'Ion Popescu', role: 'Top Reporter', initials: 'IP', delay: 300 },
            ].map(({ quote, name, role, initials, delay }) => (
              <div key={name} className={`scroll-animate fade-up delay-${delay} bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all`}>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{name}</div>
                    <div className="text-slate-400 text-xs">{role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="statistici" className="py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-16 text-center scroll-animate fade-up">
            <div className="text-blue-200 font-semibold text-sm uppercase tracking-widest mb-3">STATISTICI GENERALE</div>
            <h2 className="text-4xl font-extrabold text-white mb-12">Impactul comunității OrasulVede în cifre</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { value: '1,247', label: 'Total probleme' },
                { value: '856', label: 'Rezolvate' },
                { value: '234', label: 'În lucru' },
                { value: '69%', label: 'Rata rezolvare' },
              ].map(({ value, label }, i) => (
                <div key={label} className={`scroll-animate fade-up delay-${i * 100}`}>
                  <div className="text-5xl font-extrabold text-white mb-2">{value}</div>
                  <div className="text-blue-200">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center scroll-animate fade-up">
          <h2 className="text-5xl font-extrabold text-slate-900 mb-6">
            Pregătit să faci <span className="text-blue-600">diferența?</span>
          </h2>
          <p className="text-slate-500 text-xl mb-10">
            Alătură-te comunității OrasulVede și contribuie la îmbunătățirea orașului tău. Implicarea ta chiar face diferența.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5">
              Creează cont gratuit <ArrowRight className="w-5 h-5" />
            </Link>
            <button onClick={() => scrollTo('cum-functioneaza')} className="text-slate-600 hover:text-blue-600 font-semibold px-6 py-4 transition-colors">
              Află mai multe
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <OrasulVedeLogo size={32} />
                <span className="font-bold text-lg">Orasul Vede</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Platformă de implicare civică pentru un oraș mai bun.</p>
            </div>
            <div>
              <div className="font-semibold mb-4 text-slate-300">Platformă</div>
              {['Funcționalități','Hartă','Clasamente'].map(l => <Link key={l} to="/map" className="block text-slate-400 hover:text-white text-sm mb-2 transition-colors">{l}</Link>)}
            </div>
            <div>
              <div className="font-semibold mb-4 text-slate-300">Resurse</div>
              {['Cum funcționează','FAQ','Contact'].map(l => <a key={l} href="#" className="block text-slate-400 hover:text-white text-sm mb-2 transition-colors">{l}</a>)}
            </div>
            <div>
              <div className="font-semibold mb-4 text-slate-300">Legal</div>
              {['Termeni și condiții','Confidențialitate','Cookies'].map(l => <a key={l} href="#" className="block text-slate-400 hover:text-white text-sm mb-2 transition-colors">{l}</a>)}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-slate-400 text-sm">© 2025 OrasulVede. Toate drepturile rezervate.</span>
            <span className="text-slate-400 text-sm">Făcut cu ❤️ pentru comunitate</span>
          </div>
        </div>
      </footer>

      <style>{`
        .scroll-animate { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .scroll-animate.fade-left { transform: translateX(-40px); }
        .scroll-animate.fade-right { transform: translateX(40px); }
        .scroll-animate.animate-in { opacity: 1; transform: translate(0); }
        .delay-0 { transition-delay: 0s; }
        .delay-100 { transition-delay: 0.1s; }
        .delay-200 { transition-delay: 0.2s; }
        .delay-300 { transition-delay: 0.3s; }
        .delay-400 { transition-delay: 0.4s; }
      `}</style>

    </div>
  );
}