import { useParams, Link } from 'react-router-dom'

const PAGES = {
  termeni: {
    title: 'Termeni și condiții',
    sections: [
      { heading: '1. Acceptarea termenilor', body: 'Prin utilizarea platformei Orașul Vede, acceptați în întregime prezentii termeni și condiții. Dacă nu sunteți de acord, vă rugăm să nu utilizați platforma.' },
      { heading: '2. Descrierea serviciului', body: 'Orașul Vede este o platformă de implicare civică ce permite cetățenilor să raporteze probleme din spațiul public și să urmărească rezolvarea acestora.' },
      { heading: '3. Contul de utilizator', body: 'Sunteți responsabil pentru menținerea confidențialității datelor de autentificare și pentru toate activitățile desfășurate în contul dumneavoastră.' },
      { heading: '4. Conținut generat de utilizatori', body: 'Prin trimiterea unui raport, acordați Orașul Vede dreptul de a afișa conținutul în mod public. Nu trimiteți conținut ilegal, ofensator sau fals.' },
      { heading: '5. Modificări ale termenilor', body: 'Ne rezervăm dreptul de a modifica acești termeni în orice moment. Continuarea utilizării platformei după modificări constituie acceptul noilor termeni.' },
    ]
  },
  confidentialitate: {
    title: 'Politică de confidențialitate',
    sections: [
      { heading: '1. Date colectate', body: 'Colectăm adresa de email, numele afișat, și conținutul rapoartelor trimise (titlu, descriere, fotografii, locație). Nu colectăm date sensibile.' },
      { heading: '2. Utilizarea datelor', body: 'Datele sunt folosite exclusiv pentru funcționarea platformei: afișarea rapoartelor, trimiterea notificărilor despre statusul raportului, și calculul clasamentelor.' },
      { heading: '3. Stocarea datelor', body: 'Datele sunt stocate în siguranță pe serverele Supabase (UE). Nu vindem și nu partajăm datele cu terțe părți în scopuri comerciale.' },
      { heading: '4. Drepturile dumneavoastră', body: 'Aveți dreptul de a accesa, corecta sau șterge datele personale. Puteți șterge contul oricând din secțiunea Profil → Setări.' },
      { heading: '5. Contact', body: 'Pentru orice întrebare legată de confidențialitate, ne puteți contacta la contact@orasulvede.ro.' },
    ]
  },
  cookies: {
    title: 'Politică de cookies',
    sections: [
      { heading: 'Ce sunt cookie-urile?', body: 'Cookie-urile sunt fișiere mici stocate în browserul dumneavoastră. Platforma Orașul Vede folosește un număr minim de cookie-uri, strict necesare funcționării.' },
      { heading: 'Cookie-uri esențiale', body: 'Folosim cookie-uri de sesiune pentru autentificare (furnizate de Supabase). Fără acestea, nu vă puteți autentifica în platformă.' },
      { heading: 'Cookie-uri de analiză', body: 'Nu folosim în prezent cookie-uri de analiză sau urmărire a comportamentului utilizatorilor.' },
      { heading: 'Gestionarea cookie-urilor', body: 'Puteți dezactiva cookie-urile din setările browserului, însă aceasta poate afecta funcționalitatea platformei, inclusiv autentificarea.' },
    ]
  },
}

export default function Legal() {
  const { page } = useParams()
  const content = PAGES[page]

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Pagina nu a fost găsită.</p>
          <Link to="/" className="text-primary-600 hover:underline text-sm">← Înapoi acasă</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-8">
          ← Înapoi
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{content.title}</h1>
        <div className="space-y-6">
          {content.sections.map(s => (
            <div key={s.heading}>
              <h2 className="font-semibold text-gray-900 mb-2">{s.heading}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-12">Ultima actualizare: aprilie 2026</p>
      </div>
    </div>
  )
}
