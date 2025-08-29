import { useServices } from '../context/ServiceContext.tsx';

export const usePostRepository = () => {
  const { postRepository } = useServices();
  return postRepository;
};