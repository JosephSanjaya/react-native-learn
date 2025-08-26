export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  BLOCKED = 'blocked',
  PROVISIONAL = 'provisional'
}

export interface IPermissionService {
  requestNotificationPermission(): Promise<PermissionStatus>;
  checkNotificationPermission(): Promise<PermissionStatus>;
}