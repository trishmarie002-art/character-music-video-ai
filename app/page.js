'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [mode, setMode] = useState('free')
  const [busy, setBusy] = useState(false)
  const [backendUrl, setBackendUrl] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('freeVideoBackendUrl') || ''
    setBackendUrl(saved)
  }, [])

  function saveBackendUrl(value) {
    const clean = value.trim().replace(/\/$/, '')
    setBackendUrl(clean)
    localStorage.setItem('freeVideoBackendUrl', clean)
  }

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

    try {
      if (mode === 'free') {
        if (!backendUrl) throw new Error('Start the free Colab backend first, then paste its trycloudflare.com URL here.')
        setStatus('Sending your character to the free open-source AI...')

        const freeForm = new FormData()
        freeForm.append('image', character)
        freeForm.append('prompt', String(form.get('motion') || 'Make the character dance playfully for the camera'))
        freeForm.append('style', String(form.get('style') || 'Funny'))

        const res = await fetch(`${backendUrl}/submit`, { method: 'POST', body: freeForm })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.error || 'Could not start free generation.')

        setStatus('Free AI generation started. This can take a while on a free Colab GPU...')
        await pollFree(data.job_id)
        return
      }

      setStatus('Premium: uploading your character and starting Kling AI...')
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

  async function pollFree(jobId) {
    for (;;) {
      await new Promise(resolve => setTimeout(resolve, 8000))
      const res = await fetch(`${backendUrl}/status/${encodeURIComponent(jobId)}`, { cache: 'no-store' })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setStatus(`Error: ${data.error || 'Free generation failed.'}`)
        setBusy(false)
        return
      }

      if (data.status === 'failed') {
        setStatus(`Error: ${data.error || 'Free generation failed.'}`)
        setBusy(false)
        return
      }

      if (data.status === 'completed') {
        const result = data.video_url.startsWith('http') ? data.video_url : `${backendUrl}${data.video_url}`
        setVideoUrl(result)
        setStatus('🎉 Your free open-source AI video is ready!')
        setBusy(false)
        return
      }

      setStatus(data.message || 'The free AI is generating your video...')
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
        <p style={{color:'#bbb',lineHeight:1.6}}>Use a free open-source Colab GPU while we build, or switch to Premium for Kling.</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:22}}>
          <button type="button" onClick={()=>setMode('free')} style={modeButton(mode==='free')}>
            🆓 FREE OPEN SOURCE
            <small style={{display:'block',marginTop:5,fontWeight:500}}>CogVideoX on Colab</small>
          </button>
          <button type="button" onClick={()=>setMode('premium')} style={modeButton(mode==='premium')}>
            ⭐ PREMIUM
            <small style={{display:'block',marginTop:5,fontWeight:500}}>Real Kling AI video</small>
          </button>
        </div>

        {mode === 'free' && (
          <div style={{marginTop:18,padding:16,border:'1px solid #34344c',borderRadius:14,background:'#101019'}}>
            <strong>Free AI backend</strong>
            <p style={{color:'#aaa',fontSize:14,lineHeight:1.5}}>Open the Colab notebook, run all cells, then copy the URL ending in <b>trycloudflare.com</b> and paste it below.</p>
            <a href="https://colab.research.google.com/github/trishmarie002-art/character-music-video-ai/blob/main/colab/free-cogvideox-backend.ipynb" target="_blank" rel="noreferrer" style={{color:'#fff',fontWeight:800}}>OPEN FREE COLAB BACKEND ↗</a>
            <input value={backendUrl} onChange={e=>saveBackendUrl(e.target.value)} placeholder="https://xxxxx.trycloudflare.com" style={input}/>
          </div>
        )}

        <form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}>
          <input type="hidden" name="mode" value={mode}/>
          <label>Character image<input name="character" type="file" accept="image/png,image/jpeg,image/webp" required style={input}/></label>
          <label>Song or audio <span style={{color:'#888'}}>(we connect this after motion works)</span><input name="song" type="file" accept="audio/*" style={input}/></label>
          <label>Style<select name="style" style={input}><option>Funny</option><option>Cute</option><option>Cinematic</option><option>Pop Star</option><option>Country</option><option>Rap</option></select></label>
          <label>What should the character do?<textarea name="motion" placeholder="Example: dances excitedly, looks into the camera, bounces to the beat and gives a sassy head tilt" rows="4" style={input}/></label>
          <button disabled={busy} style={{padding:16,border:0,borderRadius:14,fontWeight:800,fontSize:16,cursor:busy?'wait':'pointer',opacity:busy?.65:1}}>
            {busy ? 'GENERATING...' : mode === 'free' ? 'GENERATE FREE AI VIDEO' : 'GENERATE PREMIUM AI VIDEO'}
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
