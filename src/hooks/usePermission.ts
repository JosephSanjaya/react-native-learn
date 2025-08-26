import { useServices } from '../context/ServiceContext';

export const usePermission = () => {
  const { permissionService } = useServices();
  return permissionService;
};