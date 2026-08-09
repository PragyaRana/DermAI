import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const info = [
    { label:'Full Name',    value: user?.name },
    { label:'Email',        value: user?.email },
    { label:'Total Scans',  value: `${user?.totalScans ?? 0} scans completed` },
    { label:'Member Since', value: new Date().getFullYear() },
  ];

  return (
    <div className="page" style={{ maxWidth:600 }}>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, marginBottom:28 }}>Profile</h1>

      <div className="card" style={{ padding:32 }}>
        {/* Avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28, paddingBottom:28, borderBottom:'1px solid rgba(200,151,110,0.15)' }}>
          <div style={{
            width:72, height:72, borderRadius:'50%', background:'var(--rose)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#fff',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26 }}>{user?.name}</h2>
            <p style={{ color:'var(--muted)', fontSize:14, marginTop:2 }}>{user?.email}</p>
          </div>
        </div>

        {/* Info rows */}
        {info.map(({ label, value }) => (
          <div key={label} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'14px 16px', background:'rgba(253,248,245,0.8)',
            borderRadius:10, marginBottom:10,
          }}>
            <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)' }}>
              {label}
            </span>
            <span style={{ fontSize:14, fontWeight:500 }}>{value}</span>
          </div>
        ))}

        {/* Actions */}
        <div style={{ display:'flex', gap:12, marginTop:24 }}>
          <button className="btn btn-rose" onClick={() => navigate('/scan')} style={{ flex:1, justifyContent:'center' }}>
            ◎ New Scan
          </button>
          <button className="btn btn-outline" onClick={handleLogout} style={{ flex:1, justifyContent:'center' }}>
            ⎋ Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
