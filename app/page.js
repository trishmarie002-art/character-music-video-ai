'use client'

import { useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('')

  async function submit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setStatus('Planning your music video...')
    const res = await fetch('/api/generate', { method: 'POST', body: form })
    const data = await res.json()
    setStatus(data.message || 'Done')
  }

  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24}}>
      <section style={{width:'100%',maxWidth:760,background:'#151522',border:'1px solid #2b2b3d',borderRadius:24,padding:28,boxShadow:'0 20px 60px rgba(0,0,0,.35)'}}>
        <p style={{margin:0,color:'#aaa'}}>AI CHARACTER MUSIC VIDEO STUDIO</p>
        <h1 style={{fontSize:42,margin:'8px 0 10px'}}>Bring your character to life.</h1>
        <p style={{color:'#bbb',lineHeight:1.6}}>Upload a character, add a song, choose a style, and generate a short AI music video.</p>

        <form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}>
          <label>Character image<input name="character" type="file" accept="image/*" required style={input}/></label>
          <label>Song<input name="song" type="file" accept="audio/*" required style={input}/></label>
          <label>Lyrics<textarea name="lyrics" placeholder="Paste lyrics here..." rows="6" style={input}/></label>
          <label>Style<select name="style" style={input}><option>Funny</option><option>Cute</option><option>Cinematic</option><option>Pop Star</option><option>Country</option><option>Rap</option></select></label>
          <label>Length<select name="length" style={input}><option value="15">15 seconds</option><option value="30">30 seconds</option><option value="60">60 seconds</option></select></label>
          <label>Format<select name="format" style={input}><option value="9:16">9:16 Reel / TikTok</option><option value="16:9">16:9 YouTube</option><option value="1:1">1:1 Square</option></select></label>
          <button style={{padding:16,border:0,borderRadius:14,fontWeight:800,fontSize:16,cursor:'pointer'}}>CREATE MUSIC VIDEO</button>
        </form>
        {status && <p style={{marginTop:18,color:'#c7c7ff'}}>{status}</p>}
      </section>
    </main>
  )
}

const input = {display:'block',width:'100%',boxSizing:'border-box',marginTop:8,padding:12,borderRadius:10,border:'1px solid #34344c',background:'#0f0f19',color:'#fff'}
