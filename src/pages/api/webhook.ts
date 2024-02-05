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

    console.log('req.body', req.body)
    const rawBody = (await buffer(req)).toString()
    const data = JSON.parse(rawBody)
    const signature = req.headers['x-kc-signature']?.toString() || ''

    console.log('WEBHOOK', rawBody, 'data', data, 'signature', signature)

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

    // Process the webhook payload
    console.log('Valid signature. Processing webhook payload...')
    // Your webhook processing logic here

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
