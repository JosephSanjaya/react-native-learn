export interface IPostRepository {
  createPost(title: string): Promise<void>;
  getAllPosts(): Promise<any[]>;
  deletePost(id: string): Promise<void>;
}