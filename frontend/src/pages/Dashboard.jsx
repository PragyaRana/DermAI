import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ScoreRing from '../components/ScoreRing';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(r => setReports(r.data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const latest    = reports[0];
  const chartData = [...reports].reverse().map((r, i) => ({
    name: `Scan ${i + 1}`, score: r.overallScore,
  }));

  const statCards = [
    { label:'Total Scans',   value: user?.totalScans ?? 0,          icon:'◎' },
    { label:'Latest Score',  value: latest?.overallScore ?? '—',    icon:'★' },
    { label:'Skin Type',     value: latest?.skinType ?? 'Not scanned', icon:'◉', cap:true },
    { label:'Skin Age Est.', value: latest?.skinAge ? `~${latest.skinAge} yrs` : '—', icon:'◷' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, marginBottom:6 }}>
          Good day, <em style={{ color:'var(--rose)', fontStyle:'italic' }}>{user?.name?.split(' ')[0]}</em> ✨
        </h1>
        <p style={{ color:'var(--muted)', fontSize:15 }}>Here's your skin health overview</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {statCards.map(({ label, value, icon, cap }) => (
          <div key={label} className="card" style={{ padding:'22px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)' }}>{label}</span>
              <span style={{ fontSize:20 }}>{icon}</span>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, textTransform: cap ? 'capitalize' : 'none' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.7fr', gap:20, marginBottom:24 }}>
        {/* Latest scores */}
        {latest ? (
          <div className="card" style={{ padding:24 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, marginBottom:20 }}>Latest Analysis</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <ScoreRing score={latest.overallScore}   label="Overall"   size={88} />
              <ScoreRing score={latest.acneScore}      label="Acne"      size={88} />
              <ScoreRing score={latest.glowScore}      label="Glow"      size={88} />
              <ScoreRing score={latest.hydrationScore} label="Hydration" size={88} />
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding:24, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
            <div style={{ fontSize:48 }}>🔬</div>
            <p style={{ color:'var(--muted)', textAlign:'center', fontSize:14 }}>No scans yet</p>
            <button className="btn btn-rose" onClick={() => navigate('/scan')} style={{ fontSize:13 }}>
              Start First Scan
            </button>
          </div>
        )}

        {/*Progress chart */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, marginBottom:20 }}>Skin Score Progress</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,151,110,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#7a5c48' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize:11, fill:'#7a5c48' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius:12, border:'1px solid rgba(200,151,110,0.25)', fontSize:12, fontFamily:'Inter' }}
                />
                <Line type="monotone" dataKey="score" stroke="#C9607B" strokeWidth={2.5}
                  dot={{ fill:'#C9607B', r:4, strokeWidth:0 }}
                  activeDot={{ r:6, fill:'#C9607B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:14 }}>
              Run your first scan to see progress
            </div>
          )}
        </div>
      </div>

      {/* Recent scans */}
      {reports.length > 0 && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20 }}>Recent Scans</h3>
            <button className="btn btn-outline" style={{ fontSize:12, padding:'8px 16px' }}
              onClick={() => navigate('/history')}>View All →</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {reports.slice(0,3).map(r => (
              <div key={r._id}
                onClick={() => navigate(`/report/${r._id}`)}
                style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(200,151,110,0.2)', cursor:'pointer', transition:'transform .2s, box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(26,10,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
              >
                <div style={{ position:'relative' }}>
                  <img src={r.imageUrl} alt="scan" style={{ width:'100%', height:120, objectFit:'cover' }} />
                  <div style={{
                    position:'absolute', top:8, right:8, background:'rgba(255,255,255,0.95)',
                    borderRadius:99, padding:'3px 10px', fontWeight:700, fontSize:13,
                    color: r.overallScore>=75 ? '#166534' : r.overallScore>=50 ? '#854d0e' : '#991b1b',
                  }}>{r.overallScore}</div>
                </div>
                <div style={{ padding:'10px 12px' }}>
                  <p style={{ fontSize:12, fontWeight:600, textTransform:'capitalize' }}>{r.skinType} skin</p>
                  <p style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <button className="btn btn-primary" onClick={() => navigate('/scan')}
        style={{ marginTop:24, padding:'14px 32px', fontSize:15 }}>
        ◎ Start New Skin Scan →
      </button>
    </div>
  );
}
