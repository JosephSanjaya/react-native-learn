import { database } from '../db';
import { IPostRepository } from './interfaces/IPostRepository.ts';

export class PostRepository implements IPostRepository {
  async createPost(title: string): Promise<void> {
    const postsCollection = database.collections.get('posts');
    await database.write(async () => {
      await postsCollection.create(post => {
        post.title = title;
      });
    });
  }

  async getAllPosts(): Promise<any[]> {
    const postsCollection = database.collections.get('posts');
    return await postsCollection.query().fetch();
  }

  async deletePost(id: string): Promise<void> {
    const postsCollection = database.collections.get('posts');
    const post = await postsCollection.find(id);
    await database.write(async () => {
      await post.destroyPermanently();
    });
  }
}