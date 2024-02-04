import { BASE_URL } from '@/utils'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <meta property="og:title" content="Frame" />
        <meta property="og:image" content={`${BASE_URL}/question.svg`} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${BASE_URL}/question.svg`} />
        <meta property="fc:frame:input:text" content="Type something here..." />
        <meta property="fc:frame:button:1" content="Submit" />
        <meta
          property="fc:frame:post_url"
          content={`${BASE_URL}/api/post?data=start`}
        />
      </Head>
    </>
  )
}
