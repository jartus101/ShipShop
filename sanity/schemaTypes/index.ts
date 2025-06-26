import { type SchemaTypeDefinition } from 'sanity'
import { userType } from './user'
import { videoType } from './video'
import { likeType } from './like'
import { commentType } from './comments'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [userType, videoType, likeType, commentType],
}
