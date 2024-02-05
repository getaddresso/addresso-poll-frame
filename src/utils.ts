import { sql } from '@vercel/postgres'

import { syndicate } from './config'
import { TPostData, TUntrustedData } from './types'

export const BASE_URL = process.env.BASE_URL

// generate an html page with the relevant opengraph tags
export function generateFarcasterFrame(image: string, postData: TPostData) {
  let metaTags = ''

  switch (postData) {
    case 'mint':
      metaTags += `
		  <meta property="fc:frame:image" content="${image}" />
		  <meta property="fc:frame:button:1" content="Mint ✨ (34 remaining)" />`
      break
    case 'redirect':
      metaTags += `
		  <meta property="fc:frame:image" content="${image}" />
		  <meta property="fc:frame:button:1" content="Save your first address" />
		  <meta property="fc:frame:button:1:action" content="post_redirect" />`
      break
    case 'error':
      metaTags += `
		<meta property="fc:frame:image" content="${image}" />
		<meta property="fc:frame:button:1" content="Follow /addresso for the next drop" />
		<meta property="fc:frame:button:1:action" content="post_redirect" />`
      break
  }

  const postUrl = `${BASE_URL}/api/post?data=${postData}`

  return `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		<meta property="fc:frame" content="vNext" />
		${metaTags}
		<meta property="fc:frame:post_url" content="${postUrl}" />
	  </head>
	  <body>
	  </body>
	  </html>
	`
}

export async function saveTextInput(ud: TUntrustedData) {
  const existingFeedback =
    await sql`SELECT * FROM "Feedback" WHERE Fid = ${ud.fid}`
  console.log('existingFeedback', existingFeedback)

  if (existingFeedback.rowCount > 0) {
    console.log('Feedback already submitted by fid:', ud.fid)
    return generateFarcasterFrame(`${BASE_URL}/error.png`, 'error')
  } else {
    await sql`INSERT INTO "Feedback" (Fid, Text, isMinted) VALUES (${ud.fid}, ${ud.inputText}, false);`
    return generateFarcasterFrame(`${BASE_URL}/mint.png`, 'mint')
  }
}

export async function mintWithSyndicate(fid: number) {
  const syndicateMintTx = await syndicate.transact.sendTransaction({
    projectId: '6ebd9b38-1d9a-41af-851d-ba796f882639',
    contractAddress: '0x930A544c651c8a137B60C0505415f3900CC143fc',
    chainId: 84532,
    functionSignature: 'mint(address to)',
    args: {
      to: await getAddrByFid(fid),
    },
  })

  console.log('Syndicate Transaction ID: ', syndicateMintTx.transactionId)

  // @todo loading frame so that nft has time to mint
  return generateFarcasterFrame(`${BASE_URL}/redirect.png`, 'redirect')
}

async function getAddrByFid(fid: number): Promise<string | void> {
  console.log('Extracting address for FID: ', fid)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  }

  try {
    // Searchcaster API
    const resp = await fetch(
      `https://searchcaster.xyz/api/profiles?fid=${fid}`,
      options
    )
    if (!resp.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await resp.json()

    // Extract connected address if available, otherwise use address from body
    const connectedAddress = data[0]?.connectedAddress || data[0]?.body.address
    console.log('Connected address:', connectedAddress)

    return connectedAddress
  } catch (error) {
    return console.error('Error fetching profile data:', error)
  }
}
