import type { NextApiRequest, NextApiResponse, Metadata } from 'next'

import {
  BASE_URL,
  generateFarcasterFrame,
  mintWithSyndicate,
  saveTextInput,
} from '@/utils'
import { validateMessage } from '@/validate'
import { TSignedMessage, TUntrustedData } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const signedMessage = req.body as TSignedMessage

  const reqId = req.query.data
  console.log('request query: ', reqId)

  const isMessageValid = await validateMessage(
    signedMessage.trustedData?.messageBytes
  )

  console.log('signedMessage: ', signedMessage)

  if (!isMessageValid) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  const ud: TUntrustedData = signedMessage.untrustedData

  let html: string = ''
  let statusCode: number = 200
  let locationHeader: string = ''

  switch (reqId) {
    case 'start':
      if (ud.inputText && ud.inputText.length > 0) {
        // html = await saveTextInput(ud)
        html = generateFarcasterFrame(`${BASE_URL}/mint.svg`, 'mint')
      } else {
        html = generateFarcasterFrame(`${BASE_URL}/question.svg`, 'start')
      }
      break
    case 'mint':
      html = await mintWithSyndicate(ud.fid)
      statusCode = 302
      locationHeader = 'https://app.addresso.com/'
      break
    default:
      html = generateFarcasterFrame(`${BASE_URL}/question.svg`, 'start')
      break
  }

  const response = res.status(statusCode).setHeader('Content-Type', 'text/html')
  if (locationHeader && statusCode === 302) {
    response.setHeader('Location', locationHeader)
  }
  return response.send(html)
}
