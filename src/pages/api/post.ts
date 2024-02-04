import type { NextApiRequest, NextApiResponse, Metadata } from 'next'
import { sql } from '@vercel/postgres'

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

  const ud = signedMessage.untrustedData
  const textInput = signedMessage.untrustedData.inputText

  let html: string = ''

  if (textInput && textInput.length > 0) {
    const existingFeedback = await sql`
        SELECT * FROM Feedback WHERE Fid = ${ud.fid}
    `
    console.log('existingFeedback', existingFeedback)

    if (existingFeedback) {
      console.log('Feedback already submitted by fid:', ud.fid)
    } else {
      await sql`INSERT INTO Feedback (Fid, Text, isMinted) VALUES (${ud.fid}, ${textInput}, false);`
    }

    // show mint btn
    html = generateFarcasterFrame(`${BASE_URL}/mint.svg`, true)
  } else {
    // show default
    html = generateFarcasterFrame(`${BASE_URL}/question.svg`, false)
  }

  return res.status(200).setHeader('Content-Type', 'text/html').send(html)
}
