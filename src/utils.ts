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
         <meta property="fc:frame:button:1" content="Mint" />`
    }
      <meta property="fc:frame:post_url" content="${BASE_URL}/api/post" />
    </head>
    <body>
      
    </body>
    </html>
  `
}

export async function mintWithSyndicate(trustedMessageBytes: string) {
  const tokenContract = "0x13C3189CAAC7792D10C75965C1DeFC7b0e7A5458"
   const syndicateRegisterResult = await fetch('https://frame.syndicate.io/api/register', {
  method: "POST",
  headers: {
    "content-type": "application/json",
    Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`
  },
  body: JSON.stringify({
    contractAddress: tokenContract,
    functionSignature: "mint(address,uint256)",
  })
}) 
console.log(syndicateRegisterResult, 'syndicate registration result')

const syndicateMintResult = await fetch('https://frame.syndicate.io/api/mint', {
  method: "POST",
  headers: {
    "content-type": "application/json",
    Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`
  },
  body: JSON.stringify({
    frameTrustedData: trustedMessageBytes,
    args: ["{frame-user}", 1],
    

  })
})

console.log(syndicateMintResult, 'syndicate mint resutlt')
}
