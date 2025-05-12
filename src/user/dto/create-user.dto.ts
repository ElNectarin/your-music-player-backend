export class CreateUserDto {
  firstName!: string;
  lastName?: string;
  email!: string;
  password!: string;
  profilePhoto?: string;
  bio?: string;
  userName?: string;
}
