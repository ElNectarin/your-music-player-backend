import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';

import * as bcrypt from 'bcrypt';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async createUser(createUserDto: Partial<CreateUserDto>): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'Пользователь с таким email уже существует!',
        );
      }
      if (!createUserDto.password) {
        throw new BadRequestException('Пароль обязателен!');
      }

      const saltRounds = parseInt(process.env.HASH_CRYPT || '10');
      const userPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      const user = new User({ ...createUserDto, password: userPassword });
      return await user.save();
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Ошибка при создании пользователя:', error);
      throw new InternalServerErrorException('Не удалось создать пользователя');
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      const foundedUsers = await this.userModel.findAll();
      if (!foundedUsers) {
        throw new BadRequestException('Не удалось найти пользователей');
      }
      return foundedUsers;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Ошибка при поиске пользователей:', error);
      throw new InternalServerErrorException('Не удалось найти пользователей');
    }
  }

  async findOneUser(id: number): Promise<User> {
    try {
      const foundedUser = await this.userModel.findByPk(id);
      if (!foundedUser) {
        throw new BadRequestException('Не удалось найти пользователя');
      }
      return foundedUser;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Ошибка при поиске пользователя:', error);
      throw new InternalServerErrorException('Не удалось найти пользователя');
    }
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async removeUser(id: number) {
    return this.userModel.destroy({ where: { id } });
  }
}
