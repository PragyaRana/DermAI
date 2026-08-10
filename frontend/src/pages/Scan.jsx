import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import api from '../services/api';
import { toast, ToastContainer } from '../components/Toast';

export default function Scan() {
  const [mode,      setMode]      = useState('idle'); // idle | camera | preview
  const [preview,   setPreview]   = useState(null);
  const [file,      setFile]      = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const webcamRef  = useRef(null);
  const inputRef   = useRef(null);
  const navigate   = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!allowed.includes(f.type)) { toast('Only JPG, PNG, WEBP allowed.', 'error'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMode('preview');
  };

  const capture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot();
    if (!src) return;
    const byteStr = atob(src.split(',')[1]);
    const ab = new ArrayBuffer(byteStr.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
    const blob = new Blob([ab], { type:'image/jpeg' });
    handleFile(new File([blob], 'webcam.jpg', { type:'image/jpeg' }));
  }, []);

  const analyse = async () => {
    if (!file) { toast('Please upload or capture an image.', 'error'); return; }
    setAnalyzing(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data: up } = await api.post('/upload/image', form, { headers:{ 'Content-Type':'multipart/form-data' } });
      const { data }     = await api.post('/analyze', { imageUrl: up.imageUrl });
      toast('Analysis complete! ✨');
      navigate(`/report/${data.report._id}`);
    } catch (err) {
      toast(err.response?.data?.error || 'Analysis failed. Try again.', 'error');
    } finally { setAnalyzing(false); }
  };

  const reset = () => { setPreview(null); setFile(null); setMode('idle'); };

  return (
    <div className="page" style={{ maxWidth:640 }}>
      <ToastContainer />
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:42, marginBottom:6 }}>Scan Your Skin</h1>
      <p style={{ color:'var(--muted)', marginBottom:32, fontSize:15 }}>Upload a clear, well-lit photo of your face for best results</p>

      {/* ── Preview state ─────────────────── */}
      {mode === 'preview' && (
        <div className="card" style={{ padding:24, marginBottom:20 }}>
          <div style={{ position:'relative', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
            <img src={preview} alt="Preview" style={{ width:'100%', maxHeight:320, objectFit:'cover' }} />
            <button onClick={reset} style={{
              position:'absolute', top:10, right:10, width:32, height:32, borderRadius:'50%',
              background:'rgba(26,10,0,0.75)', border:'none', color:'#fff', cursor:'pointer', fontSize:16,
            }}>✕</button>
          </div>
          <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13, marginBottom:16 }}>
            ✅ Image ready — click Analyse to run AI
          </p>
          <button className="btn btn-primary" onClick={analyse} disabled={analyzing}
            style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:15 }}>
            {analyzing
              ? <><span className="spinner" style={{ borderColor:'#fff' }} /> Analysing your skin…</>
              : '✨ Analyse My Skin'}
          </button>
          {analyzing && (
            <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(200,151,110,0.1)', borderRadius:10, fontSize:13, color:'var(--muted)', textAlign:'center' }}>
              This takes 3–10 seconds. Detecting face, texture, spots…
            </div>
          )}
        </div>
      )}

      {/* ── Camera state ──────────────────── */}
      {mode === 'camera' && (
        <div className="card" style={{ padding:20, marginBottom:20 }}>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
            style={{ width:'100%', borderRadius:12 }}
            videoConstraints={{ facingMode:'user', width:640, height:480 }} />
          <div style={{ display:'flex', gap:12, marginTop:16 }}>
            <button className="btn btn-rose" onClick={capture} style={{ flex:1, justifyContent:'center' }}>
              📸 Capture Photo
            </button>
            <button className="btn btn-outline" onClick={() => setMode('idle')} style={{ flex:1, justifyContent:'center' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Idle state ────────────────────── */}
      {mode === 'idle' && (
        <>
          {/* Drag & drop */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--rose)' : 'rgba(200,151,110,0.4)'}`,
              borderRadius: 20, padding: '52px 24px', textAlign:'center',
              cursor:'pointer', transition:'all .2s', marginBottom:16,
              background: dragging ? 'rgba(201,96,123,0.04)' : 'rgba(255,255,255,0.5)',
            }}>
            <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize:48, marginBottom:14 }}>{dragging ? '📂' : '📁'}</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, marginBottom:6 }}>
              {dragging ? 'Drop it here!' : 'Drag & drop your photo'}
            </h3>
            <p style={{ color:'var(--muted)', fontSize:13 }}>or click to browse — JPG, PNG, WEBP supported</p>
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:'rgba(200,151,110,0.25)' }} />
            <span style={{ fontSize:12, color:'var(--muted)' }}>or</span>
            <div style={{ flex:1, height:1, background:'rgba(200,151,110,0.25)' }} />
          </div>

          {/* Camera button */}
          <button className="btn btn-outline" onClick={() => setMode('camera')}
            style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:14 }}>
            📷 Use Live Camera
          </button>
        </>
      )}

      {/* Tips */}
      <div style={{
        marginTop:28, padding:'18px 20px', background:'rgba(200,151,110,0.08)',
        borderRadius:14, border:'1px solid rgba(200,151,110,0.2)',
      }}>
        <p style={{ fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>
          📸 Tips for best results
        </p>
        {[
          'Face the camera directly in good natural lighting',
          'Remove glasses, heavy makeup, or hair covering the face',
          'Keep a neutral expression with your full face visible',
        ].map((t, i) => (
          <p key={i} style={{ fontSize:13, color:'var(--muted)', marginBottom:5 }}>• {t}</p>
        ))}
      </div>
    </div>
  );
}
