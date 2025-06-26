import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

const token = process.env.NEXT_PUBLIC_SANITY_TOKEN || ""

export const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true,
})

// Alternative approach: Use regular client but with specific request options
export const sanityWrite = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  // Remove any credential-related settings that might cause CORS issues
})
