import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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

  private async handleUserSearch(
    searchPromise: Promise<User | null>,
    notFoundMessage: string,
  ): Promise<User> {
    try {
      const foundedUser = await searchPromise;
      if (!foundedUser) {
        throw new BadRequestException(notFoundMessage);
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

      if (!createUserDto.userName) {
        throw new BadRequestException('Юзернейм обязателен!');
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
    return this.handleUserSearch(
      this.userModel.findByPk(id),
      'Не удалось найти пользователя по id',
    );
  }

  async findOneUserByUsername(userName: string): Promise<User> {
    return this.handleUserSearch(
      this.userModel.findOne({
        where: {
          userName: userName,
        },
      }),
      'Не удалось найти пользователя по юзернейм',
    );
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async removeUser(id: number): Promise<number> {
    try {
      const deletedCount = await this.userModel.destroy({ where: { id } });
      if (deletedCount === 0) {
        throw new NotFoundException('Пользователь не найден');
      }
      return deletedCount;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Ошибка при удалении пользователя');
      throw new InternalServerErrorException('Не удалось удалить пользователя');
    }
  }
}
