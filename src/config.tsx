import { SyndicateClient } from '@syndicateio/syndicate-node'

export const syndicate = new SyndicateClient({
  token: () => {
    const syndicateApiKey = process.env.SYNDICATE_API_KEY
    if (typeof syndicateApiKey === 'undefined') {
      // If you receive this error, you need to define the SYNDICATE_API_KEY in
      // your Vercel environment variables. You can find the API key in your
      // Syndicate project settings under the "API Keys" tab.
      throw new Error(
        'SYNDICATE_API_KEY is not defined in environment variables.'
      )
    }
    return syndicateApiKey
  },
})
