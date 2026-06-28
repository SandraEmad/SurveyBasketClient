export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  rePassword?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  photo?: string;
  isActive?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
