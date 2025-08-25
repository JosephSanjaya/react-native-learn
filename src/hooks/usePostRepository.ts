import { useServices } from '../context/ServiceContext';

export const usePostRepository = () => {
  const { postRepository } = useServices();
  return postRepository;
};