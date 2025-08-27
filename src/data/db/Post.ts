import { Model } from '@nozbe/watermelondb'
import { field, text } from '@nozbe/watermelondb/decorators'

export default class Post extends Model {
  static table = 'posts'

  @text('title') title!: string
  @text('body') body!: string
  @field('created_at') createdAt!: number
  @field('updated_at') updatedAt!: number
}