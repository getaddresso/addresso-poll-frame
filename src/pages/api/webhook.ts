import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import { signatureHelper } from '@kentico/kontent-webhook-helper'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' })
      return
    }

    const rawBody = (await buffer(req)).toString()
    const data = JSON.parse(rawBody)

    const signatureHeader = req.headers['Syndicate-Signature']?.toString() || ''
    const pairs = signatureHeader.split(',')
    const signatureData: Record<string, string> = {}
    pairs.forEach((pair) => {
      const [prefix, value] = pair.trim().split('=')
      signatureData[prefix] = value
    })
    const signature = signatureData.s

    console.log('data', data, 'signature', signature)

    // Validate the signature
    const isValidSignature = signatureHelper.isValidSignatureFromString(
      rawBody,
      process.env.WEBHOOK_SECRET || '',
      signature
    )

    if (!isValidSignature) {
      console.error('Invalid signature')
      return res.status(401).end()
    }

    console.log('Valid signature. Processing webhook payload...')

    res.status(200).end()
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).end()
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
