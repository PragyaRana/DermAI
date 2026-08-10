import { useNavigate } from 'react-router-dom';

const S = {
  wrap: {
    minHeight:'100vh', background:'#FDF8F5', overflow:'hidden', position:'relative',
  },
  orb1: {
    position:'fixed', top:-100, right:-100, width:500, height:500,
    borderRadius:'50%', background:'rgba(242,192,192,0.28)', filter:'blur(80px)', pointerEvents:'none',
  },
  orb2: {
    position:'fixed', bottom:-80, left:-80, width:380, height:380,
    borderRadius:'50%', background:'rgba(200,151,110,0.18)', filter:'blur(70px)', pointerEvents:'none',
  },
  nav: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'24px 48px', position:'relative', zIndex:10,
  },
  logo: { display:'flex', alignItems:'center', gap:10 },
  logoDot: { width:10, height:10, borderRadius:'50%', background:'#C9607B' },
  logoText: { fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700 },
  navBtns: { display:'flex', alignItems:'center', gap:16 },
  hero: {
    textAlign:'center', padding:'60px 24px 80px', position:'relative', zIndex:10,
    maxWidth:820, margin:'0 auto',
  },
  badge: {
    display:'inline-block', padding:'6px 18px', borderRadius:99,
    background:'rgba(201,96,123,0.1)', color:'#C9607B', fontSize:11,
    fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:28,
  },
  h1: { fontFamily:"'Playfair Display',serif", fontSize:62, fontWeight:700, lineHeight:1.15, marginBottom:20 },
  h1em: { color:'#C9607B', fontStyle:'italic' },
  p: { fontSize:17, color:'#7a5c48', maxWidth:520, margin:'0 auto 40px', lineHeight:1.7 },
  ctas: { display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' },
  features: {
    display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',
    gap:24, maxWidth:900, margin:'60px auto 0', padding:'0 24px',
    position:'relative', zIndex:10,
  },
  featureCard: {
    background:'rgba(255,255,255,0.65)', backdropFilter:'blur(12px)',
    border:'1px solid rgba(200,151,110,0.22)', borderRadius:20,
    padding:'32px 28px', boxShadow:'0 4px 24px rgba(26,10,0,0.07)',
  },
  featureIcon: {
    width:48, height:48, borderRadius:14, background:'rgba(201,96,123,0.1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:22, marginBottom:20,
  },
  featureTitle: { fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:600, marginBottom:8 },
  featureDesc: { fontSize:14, color:'#7a5c48', lineHeight:1.65 },
  stats: {
    display:'flex', alignItems:'center', justifyContent:'center', gap:64,
    maxWidth:700, margin:'64px auto 0', padding:'32px 24px 0',
    borderTop:'1px solid rgba(200,151,110,0.2)', flexWrap:'wrap',
  },
  statVal: { fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:700, color:'#C9607B' },
  statLabel: { fontSize:12, color:'#7a5c48', marginTop:4 },
};

const FEATURES = [
  { icon:'📸', title:'Smart Image Capture', desc:'Upload from gallery or use your live webcam. AI detects faces and starts analysis instantly.' },
  { icon:'🔬', title:'Deep Skin Analysis', desc:'Detects 12+ conditions: acne, dark circles, pigmentation, hydration, aging signs and more.' },
  { icon:'💊', title:'Personalised Plan', desc:'Get custom skincare routines, diet tips, lifestyle changes and product recommendations.' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={S.wrap}>
      <div style={S.orb1} />
      <div style={S.orb2} />

      {/* Navbar */}
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoDot} />
          <span style={S.logoText}>DermAI</span>
        </div>
        <div style={S.navBtns}>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-rose" onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.badge}>✨ AI-Powered Skincare Analysis</div>
        <h1 style={S.h1}>
          Know Your Skin.<br />
          <em style={S.h1em}>Transform It.</em>
        </h1>
        <p style={S.p}>
          Upload one photo and receive a complete AI skin report — acne, hydration,
          aging, pigmentation — with a personalised daily routine and product picks.
        </p>
        <div style={S.ctas}>
          <button className="btn btn-primary" style={{ padding:'14px 32px', fontSize:15 }}
            onClick={() => navigate('/register')}>
            Analyse My Skin ✨
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>
            I already have an account
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <div style={S.features}>
        {FEATURES.map((f, i) => (
          <div key={i} style={S.featureCard}>
            <div style={S.featureIcon}>{f.icon}</div>
            <h3 style={S.featureTitle}>{f.title}</h3>
            <p style={S.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={S.stats}>
        {[['12+','Conditions Detected'],['100','Max Skin Score'],['5 sec','Analysis Time']].map(([v,l]) => (
          <div key={l} style={{ textAlign:'center' }}>
            <div style={S.statVal}>{v}</div>
            <div style={S.statLabel}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
