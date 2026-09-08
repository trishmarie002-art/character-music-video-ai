export async function POST(request) {
  const form = await request.formData()
  const style = form.get('style') || 'Cinematic'
  const length = Number(form.get('length') || 15)
  const format = form.get('format') || '9:16'
  const lyrics = String(form.get('lyrics') || '')

  const sceneCount = Math.max(3, Math.ceil(length / 5))
  const scenes = Array.from({ length: sceneCount }, (_, i) => ({
    scene: i + 1,
    duration: Math.min(5, length - i * 5),
    prompt: `${style} music-video shot ${i + 1}, preserve the exact uploaded character identity, expressive performance, polished lighting, format ${format}`
  })).filter(s => s.duration > 0)

  return Response.json({
    ok: true,
    message: `Storyboard created: ${scenes.length} scenes for a ${length}s ${style} video. API generation hooks are ready to connect.`,
    project: { style, length, format, hasLyrics: Boolean(lyrics.trim()), scenes }
  })
}
