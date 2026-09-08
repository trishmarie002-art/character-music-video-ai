'use client'

import { useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [mode, setMode] = useState('free')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setVideoUrl('')
    setBusy(true)

    const form = new FormData(e.currentTarget)
    const character = form.get('character')
    if (character instanceof File && character.size) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(character))
    }

    if (mode === 'free') {
      setStatus('Free test: checking uploads and simulating the video workflow...')
    } else {
      setStatus('Premium: uploading your character and starting Kling AI...')
    }

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not start generation.')

      if (data.testMode) {
        setStatus('✅ FREE TEST PASSED — Character + song workflow is working. No credits were used.')
        setBusy(false)
        return
      }

      setStatus(data.message || 'Generation started...')
      await poll(data.requestId)
    } catch (err) {
      setStatus(`Error: ${err.message}`)
      setBusy(false)
    }
  }

  async function poll(requestId) {
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
        <p style={{color:'#bbb',lineHeight:1.6}}>Build and test the whole workflow for free, then switch to Premium when you want a real Kling AI render.</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:22}}>
          <button type="button" onClick={()=>setMode('free')} style={modeButton(mode==='free')}>
            🆓 FREE TEST
            <small style={{display:'block',marginTop:5,fontWeight:500}}>Uses 0 credits</small>
          </button>
          <button type="button" onClick={()=>setMode('premium')} style={modeButton(mode==='premium')}>
            ⭐ PREMIUM
            <small style={{display:'block',marginTop:5,fontWeight:500}}>Real Kling AI video</small>
          </button>
        </div>

        <form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}>
          <input type="hidden" name="mode" value={mode}/>
          <label>Character image<input name="character" type="file" accept="image/png,image/jpeg,image/webp" required style={input}/></label>
          <label>Song or audio <span style={{color:'#888'}}>(optional for now)</span><input name="song" type="file" accept="audio/*" style={input}/></label>
          <label>Style<select name="style" style={input}><option>Funny</option><option>Cute</option><option>Cinematic</option><option>Pop Star</option><option>Country</option><option>Rap</option></select></label>
          <label>What should the character do?<textarea name="motion" placeholder="Example: dances excitedly, looks into the camera, bounces to the beat and gives a sassy head tilt" rows="4" style={input}/></label>
          <button disabled={busy} style={{padding:16,border:0,borderRadius:14,fontWeight:800,fontSize:16,cursor:busy?'wait':'pointer',opacity:busy?.65:1}}>
            {busy ? 'WORKING...' : mode === 'free' ? 'RUN FREE TEST' : 'GENERATE REAL AI VIDEO'}
          </button>
        </form>

        {status && <p style={{marginTop:18,color:'#c7c7ff',lineHeight:1.5}}>{status}</p>}

        {mode === 'free' && previewUrl && !busy && (
          <div style={{marginTop:24,padding:18,border:'1px solid #303048',borderRadius:18,background:'#101019'}}>
            <h2 style={{marginTop:0}}>Free workflow preview</h2>
            <img src={previewUrl} alt="Character preview" style={{width:'100%',maxHeight:520,objectFit:'contain',borderRadius:14,background:'#000'}} />
            <p style={{color:'#aaa',marginBottom:0}}>This verifies your upload, character selection, song field, style, prompt, and project flow without calling a paid AI model.</p>
          </div>
        )}

        {videoUrl && (
          <div style={{marginTop:24}}>
            <h2>Your real AI video is ready 🎉</h2>
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
