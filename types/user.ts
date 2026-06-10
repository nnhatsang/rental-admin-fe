export interface IUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  sessionId: string;
  roles: string[];
  permissions: string[];
}
