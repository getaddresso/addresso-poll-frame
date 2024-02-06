import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import { signatureHelper } from '@kentico/kontent-webhook-helper'
import { BASE_URL, generateFarcasterFrame } from '@/utils'

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

    // @dev WIP because server cannot modify client session
    /**
		let frame
		const status = data.data.status
		const isSuccess = data.data.status === 'SUBMITTED'
		const isLoading = data.data.status === 'PENDING' || 'PROCESSED'

		const currentPath = req.url || ''
		const isOnSamePath = currentPath === ''


		switch (status && !isOnSamePath) {
		case isSuccess:
			frame = generateFarcasterFrame(`${BASE_URL}/redirect.png`, 'redirect')
			break
		case isLoading:
			frame = generateFarcasterFrame(`${BASE_URL}/loading.png`, 'error')
			break
		default:
			frame = generateFarcasterFrame(`${BASE_URL}/error.png`, 'error')
		}

		return res.status(200).send(frame)
	*/
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
