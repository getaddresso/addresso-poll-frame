import { syndicate } from './config'

export const BASE_URL = process.env.BASE_URL

// generate an html page with the relevant opengraph tags
export function generateFarcasterFrame(image: string, isMint?: boolean) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta property="fc:frame" content="vNext" />
	  ${
      isMint &&
      `<meta property="fc:frame:image" content="${image}" />
         <meta property="fc:frame:button:1" content="Mint (34 remaining)" />`
    }
      <meta property="fc:frame:post_url" content="${BASE_URL}/api/post?data=${
    isMint ? 'mint' : 'start'
  }" />
    </head>
    <body>
      
    </body>
    </html>
  `
}

export async function mintWithSyndicate(fid: number) {
  const syndicateMintTx = await syndicate.transact.sendTransaction({
    projectId: 'b344b207-4add-4dbe-bc55-3e4487c0dadc',
    contractAddress: '0x930A544c651c8a137B60C0505415f3900CC143fc',
    chainId: 84532,
    functionSignature: 'mint(address to)',
    args: {
      to: getAddrByFid(fid),
    },
  })
  console.log('Syndicate Transaction ID: ', syndicateMintTx.transactionId)
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
