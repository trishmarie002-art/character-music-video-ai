import { fal } from '@fal-ai/client'

const MODEL = 'fal-ai/kling-video/v2.5-turbo/standard/image-to-video'

export async function POST(request) {
  try {
    if (!process.env.FAL_KEY) {
      return Response.json({ ok: false, error: 'FAL_KEY is not configured on the server.' }, { status: 500 })
    }

    const form = await request.formData()
    const character = form.get('character')
    const style = String(form.get('style') || 'Cute')
    const motion = String(form.get('motion') || '').trim()

    if (!(character instanceof File) || !character.size) {
      return Response.json({ ok: false, error: 'Please upload a character image.' }, { status: 400 })
    }

    if (!character.type.startsWith('image/')) {
      return Response.json({ ok: false, error: 'Character file must be an image.' }, { status: 400 })
    }

    const imageUrl = await fal.storage.upload(character)

    const prompt = [
      `${style} AI character music-video shot.`,
      'Preserve the exact identity, face, fur pattern, colors, proportions, clothing, and distinctive features of the uploaded character.',
      motion || 'The character performs playfully for the camera with expressive natural movement, subtle head movement, blinking, body motion, and energetic music-video attitude.',
      'Smooth natural motion, polished lighting, cinematic camera movement, high detail, no identity changes.'
    ].join(' ')

    const { request_id } = await fal.queue.submit(MODEL, {
      input: {
        prompt,
        image_url: imageUrl,
        duration: '5',
        negative_prompt: 'identity change, different character, extra limbs, duplicate body parts, deformed face, blur, distort, low quality'
      }
    })

    return Response.json({
      ok: true,
      requestId: request_id,
      message: 'Your character is being animated now.'
    })
  } catch (error) {
    console.error('Generation submit failed:', error)
    return Response.json({
      ok: false,
      error: error?.message || 'Could not start video generation.'
    }, { status: 500 })
  }
}
