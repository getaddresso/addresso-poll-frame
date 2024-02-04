import type { NextApiRequest, NextApiResponse, Metadata } from 'next'
import { sql } from '@vercel/postgres'

import { BASE_URL, generateFarcasterFrame, mintWithSyndicate } from '@/utils'
import { validateMessage } from '@/validate'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Getting here! ooo')
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  console
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
  console.log(signedMessage, 'signed msg?')

  const isMessageValid = await validateMessage(
    signedMessage.trustedData?.messageBytes
  )

  console.log('signedMessage', signedMessage)

  if (!isMessageValid) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  const ud = signedMessage.untrustedData
  const textInput = signedMessage.untrustedData.inputText
  const buttonId = signedMessage.untrustedData.buttonIndex

  let html: string = ''

  switch (buttonId) {
    case 1:
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

    case 2:
      // do the mint
      if (signedMessage.trustedData?.messageBytes) {
        await mintWithSyndicate(signedMessage.trustedData.messageBytes)
      }
  }

  return res.status(200).setHeader('Content-Type', 'text/html').send(html)
}
