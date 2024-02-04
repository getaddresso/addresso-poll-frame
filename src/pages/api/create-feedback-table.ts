import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const result = await sql`CREATE TABLE IF NOT EXISTS "Feedback" ( 
		Id SERIAL PRIMARY KEY,
		Fid BIGINT NOT NULL, 
		Text VARCHAR(255) NOT NULL,
		isMinted BOOLEAN NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

    return response.status(200).json({ result })
  } catch (error) {
    return response.status(500).json({ error })
  }
}
