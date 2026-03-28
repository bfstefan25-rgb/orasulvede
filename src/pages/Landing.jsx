import { Link } from 'react-router-dom'
import { MapPin, Users, CheckCircle, Eye, Heart, Shield, ArrowRight } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">OV</span>
          </div>
          <div>
            <span className="font-bold text-blue-600 text-xl">OrasulVede</span>
            <p className="text-gray-400 text-xs">VEZI. RAPORTEAZĂ. SCHIMBĂ.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm px-4 py-2">
            Autentificare
          </Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
            Începe acum
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Platformă de implicare civică
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Orașul tău,{' '}
            <span className="text-blue-600">vocea ta</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8 leading-relaxed">
            Raportează probleme urbane, urmărește rezolvarea lor pe hartă și contribuie la un oraș mai sigur și mai curat pentru toți.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors text-lg">
              Raportează acum <ArrowRight size={20} />
            </Link>
            <Link to="/harta" className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-blue-300 transition-colors text-lg">
              Explorează harta
            </Link>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={18} className="text-blue-600" />
              <span><strong className="text-gray-900">1,247</strong> Probleme raportate</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Users size={18} className="text-blue-600" />
              <span><strong className="text-gray-900">3,500+</strong> Utilizatori activi</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <CheckCircle size={18} className="text-blue-600" />
              <span><strong className="text-gray-900">69%</strong> Rata de rezolvare</span>
            </div>
          </div>
        </div>
        {/* Hero image placeholder */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 min-h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye size={40} className="text-white" />
            </div>
            <p className="text-blue-600 font-semibold text-lg">OrasulVede</p>
            <p className="text-blue-400 text-sm">Orașul tău, mai bun</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-4">Despre OrasulVede</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Un instrument dedicat <span className="text-blue-600">comunității tale</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-16">
            Fiecare groapă semnalată, fiecare stâlp defect sau problemă de mediu ajunge pe o hartă comună. <strong>Fii vocea cartierului tău!</strong>
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: 'Transparență', desc: 'Fiecare problemă raportată este vizibilă pentru toată comunitatea. Urmărește progresul în timp real.' },
              { icon: Heart, title: 'Implicare civică', desc: 'Transformă observațiile tale în acțiuni concrete. Fii vocea cartierului tău.' },
              { icon: Shield, title: 'Impact real', desc: 'Problemele raportate ajung direct la autorități. Contribuie la un mediu urban mai sigur.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 text-left shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-4">Cum funcționează</p>
          <h2 className="text-4xl font-bold text-gray-900">
            Simplu în <span className="text-blue-600">3 pași</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Raportează', desc: 'Fotografiază problema, selectează categoria și locația pe hartă.' },
            { step: '2', title: 'Urmărește', desc: 'Monitorizează statusul raportului tău și votează alte probleme importante.' },
            { step: '3', title: 'Schimbă', desc: 'Problemele ajung la autorități și comunitatea vede progresul în timp real.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                {step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Gata să schimbi orașul tău?</h2>
          <p className="text-blue-100 text-xl mb-8">Alătură-te miilor de cetățeni care fac diferența.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors">
            Începe acum <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>© 2026 OrasulVede. Toate drepturile rezervate.</p>
      </footer>
    </div>
  )
}