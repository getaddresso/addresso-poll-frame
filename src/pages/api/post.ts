import type { NextApiRequest, NextApiResponse, Metadata } from 'next'

import { BASE_URL, generateFarcasterFrame } from '@/utils'
import { validateMessage } from '@/validate'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const signedMessage = req.body as {
    untrustedData: {
      fid: number
      url: string
      messageHash: string
      timestamp: number
      network: number
      inputText: string
      buttonIndex: number
      castId: { fid: number; hash: string }
    }
    trustedData?: {
      messageBytes: string
    }
  }

  const isMessageValid = await validateMessage(
    signedMessage.trustedData?.messageBytes
  )

  console.log('signedMessage', signedMessage)

  if (!isMessageValid) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  const textInput = signedMessage.untrustedData.inputText

  let html: string = ''

  if (textInput && textInput.length > 0) {
    // show mint btn
    html = generateFarcasterFrame(`${BASE_URL}/mint.webp`, true)
  } else {
    // show default
    html = generateFarcasterFrame(`${BASE_URL}/question.webp`, false)
  }

  return res.status(200).setHeader('Content-Type', 'text/html').send(html)
}
