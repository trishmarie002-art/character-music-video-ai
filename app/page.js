'use client'

import { useState } from 'react'

const FREE_COLAB = 'https://colab.research.google.com/github/Square-Zero-Labs/Wan2GP-on-Colab/blob/main/wan2gp-google-colab.ipynb'

export default function Home() {
  const [status, setStatus] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [mode, setMode] = useState('free')
  const [busy, setBusy] = useState(false)
  const [motion, setMotion] = useState('Make the character dance playfully for the camera')

  function previewCharacter(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function submit(e) {
    e.preventDefault()

    if (mode === 'free') {
      setStatus('For free testing, open Wan2GP Colab below, choose the FastWan 5B image-to-video model at 480p, then upload the same character image and paste your motion prompt there.')
      window.open(FREE_COLAB, '_blank', 'noopener,noreferrer')
      return
    }

    setVideoUrl('')
    setBusy(true)
    setStatus('Premium: uploading your character and starting Kling AI...')

    try {
      const form = new FormData(e.currentTarget)
      const res = await fetch('/api/generate', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not start generation.')
      setStatus(data.message || 'Generation started...')
      await pollPremium(data.requestId)
    } catch (err) {
      setStatus(`Error: ${err.message}`)
      setBusy(false)
    }
  }

  async function pollPremium(requestId) {
    for (;;) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      const res = await fetch(`/api/status?id=${encodeURIComponent(requestId)}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setStatus(`Error: ${data.error || 'Generation failed.'}`)
        setBusy(false)
        return
      }
      setStatus(data.message || 'Working...')
      if (data.status === 'COMPLETED') {
        setVideoUrl(data.videoUrl)
        setBusy(false)
        return
      }
    }
  }

  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'linear-gradient(180deg,#090910,#11111c)'}}>
      <section style={{width:'100%',maxWidth:780,background:'#151522',border:'1px solid #2b2b3d',borderRadius:24,padding:28,boxShadow:'0 20px 60px rgba(0,0,0,.35)'}}>
        <p style={{margin:0,color:'#aaa'}}>AI CHARACTER MUSIC VIDEO STUDIO</p>
        <h1 style={{fontSize:42,margin:'8px 0 10px'}}>Bring your character to life.</h1>
        <p style={{color:'#bbb',lineHeight:1.6}}>Use free Wan2GP on Google Colab while we test, or switch to Premium for Kling.</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:22}}>
          <button type="button" onClick={()=>setMode('free')} style={modeButton(mode==='free')}>
            🆓 FREE TESTING
            <small style={{display:'block',marginTop:5,fontWeight:500}}>Wan2GP + free Colab GPU</small>
          </button>
          <button type="button" onClick={()=>setMode('premium')} style={modeButton(mode==='premium')}>
            ⭐ PREMIUM
            <small style={{display:'block',marginTop:5,fontWeight:500}}>Real Kling AI video</small>
          </button>
        </div>

        {mode === 'free' && (
          <div style={{marginTop:18,padding:18,border:'1px solid #34344c',borderRadius:14,background:'#101019'}}>
            <strong style={{fontSize:18}}>Free mode — no credits</strong>
            <p style={{color:'#bbb',lineHeight:1.6}}>We replaced the CogVideoX setup that crashed your RAM. This uses a Wan2GP Colab setup designed for low-memory GPUs.</p>
            <div style={{padding:14,borderRadius:12,background:'#181824',lineHeight:1.7,color:'#ddd'}}>
              <b>In Colab:</b><br/>
              1. Connect to the free GPU.<br/>
              2. Run the notebook from top to bottom.<br/>
              3. In Wan2GP choose <b>Wan 2.2 TextImage2Video 5B FastWan</b>.<br/>
              4. Set resolution to <b>480p</b>.<br/>
              5. Upload your character image and paste your prompt.
            </div>
            <a href={FREE_COLAB} target="_blank" rel="noreferrer" style={{display:'block',textAlign:'center',marginTop:14,padding:14,borderRadius:12,background:'#fff',color:'#111',fontWeight:900,textDecoration:'none'}}>OPEN FREE WAN2GP COLAB ↗</a>
          </div>
        )}

        <form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}>
          <input type="hidden" name="mode" value={mode}/>
          <label>Character image<input name="character" onChange={previewCharacter} type="file" accept="image/png,image/jpeg,image/webp" required style={input}/></label>
          <label>Song or audio <span style={{color:'#888'}}>(we connect this after motion works)</span><input name="song" type="file" accept="audio/*" style={input}/></label>
          <label>Style<select name="style" style={input}><option>Funny</option><option>Cute</option><option>Cinematic</option><option>Pop Star</option><option>Country</option><option>Rap</option></select></label>
          <label>What should the character do?<textarea name="motion" value={motion} onChange={e=>setMotion(e.target.value)} rows="4" style={input}/></label>
          <button disabled={busy} style={{padding:16,border:0,borderRadius:14,fontWeight:800,fontSize:16,cursor:busy?'wait':'pointer',opacity:busy?.65:1}}>
            {busy ? 'GENERATING...' : mode === 'free' ? 'OPEN FREE AI GENERATOR' : 'GENERATE PREMIUM AI VIDEO'}
          </button>
        </form>

        {status && <p style={{marginTop:18,color:'#c7c7ff',lineHeight:1.5}}>{status}</p>}

        {previewUrl && (
          <div style={{marginTop:24,padding:18,border:'1px solid #303048',borderRadius:18,background:'#101019'}}>
            <h2 style={{marginTop:0}}>Character preview</h2>
            <img src={previewUrl} alt="Character preview" style={{width:'100%',maxHeight:520,objectFit:'contain',borderRadius:14,background:'#000'}} />
          </div>
        )}

        {videoUrl && (
          <div style={{marginTop:24}}>
            <h2>Your AI video is ready 🎉</h2>
            <video src={videoUrl} controls playsInline style={{width:'100%',maxHeight:640,borderRadius:18,background:'#000'}} />
            <a href={videoUrl} target="_blank" rel="noreferrer" style={{display:'inline-block',marginTop:14,color:'#fff'}}>Open full video ↗</a>
          </div>
        )}
      </section>
    </main>
  )
}

const input = {display:'block',width:'100%',boxSizing:'border-box',marginTop:8,padding:12,borderRadius:10,border:'1px solid #34344c',background:'#0f0f19',color:'#fff'}
const modeButton = active => ({padding:16,borderRadius:14,border:active?'2px solid #fff':'1px solid #34344c',background:active?'#27273d':'#101019',color:'#fff',fontWeight:800,cursor:'pointer'})
