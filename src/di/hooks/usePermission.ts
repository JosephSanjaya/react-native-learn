import { useServices } from '../context/ServiceContext.tsx';

export const usePermission = () => {
  const { permissionService } = useServices();
  return permissionService;
};