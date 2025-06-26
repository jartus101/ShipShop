import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

const token = process.env.NEXT_PUBLIC_SANITY_TOKEN || ""

export const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})
