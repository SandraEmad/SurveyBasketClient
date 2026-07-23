export interface IRole {
  id?: string;
  name: string;
  isDeleted?: boolean;
  permissions: string[];
}
