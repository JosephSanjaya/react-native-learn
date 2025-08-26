export interface IFCMTokenRepository {
  saveToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  removeToken(): Promise<void>;
  hasToken(): Promise<boolean>;
}