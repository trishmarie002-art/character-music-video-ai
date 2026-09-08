'use client'

import { useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setVideoUrl('')
    setBusy(true)
    setStatus('Uploading your character and starting the AI video...')

    try {
      const form = new FormData(e.currentTarget)
      const res = await fetch('/api/generate', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not start generation.')

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
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24}}>
      <section style={{width:'100%',maxWidth:760,background:'#151522',border:'1px solid #2b2b3d',borderRadius:24,padding:28,boxShadow:'0 20px 60px rgba(0,0,0,.35)'}}>
        <p style={{margin:0,color:'#aaa'}}>AI CHARACTER VIDEO STUDIO — LIVE TEST</p>
        <h1 style={{fontSize:42,margin:'8px 0 10px'}}>Bring your character to life.</h1>
        <p style={{color:'#bbb',lineHeight:1.6}}>Upload one character image and generate a real 5-second AI animation. Once this works, we’ll connect your song and lip-sync as the next stage.</p>

        <form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}>
          <label>Character image<input name="character" type="file" accept="image/png,image/jpeg,image/webp" required style={input}/></label>
          <label>Style<select name="style" style={input}><option>Funny</option><option>Cute</option><option>Cinematic</option><option>Pop Star</option><option>Country</option><option>Rap</option></select></label>
          <label>What should the character do?<textarea name="motion" placeholder="Example: dances excitedly, looks into the camera, bounces to the beat and gives a sassy head tilt" rows="4" style={input}/></label>
          <button disabled={busy} style={{padding:16,border:0,borderRadius:14,fontWeight:800,fontSize:16,cursor:busy?'wait':'pointer',opacity:busy?.65:1}}>{busy ? 'GENERATING...' : 'GENERATE CHARACTER VIDEO'}</button>
        </form>

        {status && <p style={{marginTop:18,color:'#c7c7ff'}}>{status}</p>}

        {videoUrl && (
          <div style={{marginTop:24}}>
            <h2>Your video is ready 🎉</h2>
            <video src={videoUrl} controls playsInline style={{width:'100%',maxHeight:640,borderRadius:18,background:'#000'}} />
            <a href={videoUrl} target="_blank" rel="noreferrer" style={{display:'inline-block',marginTop:14,color:'#fff'}}>Open full video ↗</a>
          </div>
        )}
      </section>
    </main>
  )
}

const input = {display:'block',width:'100%',boxSizing:'border-box',marginTop:8,padding:12,borderRadius:10,border:'1px solid #34344c',background:'#0f0f19',color:'#fff'}
