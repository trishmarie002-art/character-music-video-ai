import { fal } from '@fal-ai/client'

const MODEL = 'fal-ai/kling-video/v2.5-turbo/standard/image-to-video'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('id')

    if (!requestId) {
      return Response.json({ ok: false, error: 'Missing generation id.' }, { status: 400 })
    }

    const status = await fal.queue.status(MODEL, {
      requestId,
      logs: true
    })

    if (status.status !== 'COMPLETED') {
      return Response.json({
        ok: true,
        status: status.status,
        message: status.status === 'IN_QUEUE' ? 'Waiting for the AI video engine...' : 'Animating your character...'
      })
    }

    const result = await fal.queue.result(MODEL, { requestId })
    const videoUrl = result?.data?.video?.url

    if (!videoUrl) {
      return Response.json({ ok: false, error: 'Generation completed but no video URL was returned.' }, { status: 500 })
    }

    return Response.json({
      ok: true,
      status: 'COMPLETED',
      videoUrl,
      message: 'Your character video is ready!'
    })
  } catch (error) {
    console.error('Generation status failed:', error)
    return Response.json({
      ok: false,
      error: error?.message || 'Could not check video generation.'
    }, { status: 500 })
  }
}
