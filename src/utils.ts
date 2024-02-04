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
         <meta property="fc:frame:button:2" content="Mint (34 remaining)" />`
    }
      <meta property="fc:frame:post_url" content="${BASE_URL}/api/post" />
    </head>
    <body>
      
    </body>
    </html>
  `
}
