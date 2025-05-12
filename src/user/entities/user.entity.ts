import {
  AllowNull,
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @AutoIncrement
  @PrimaryKey
  @Unique
  @Column
  declare user_id: number;

  @Column
  declare firstName: string;

  @AllowNull
  @Column
  declare lastName: string;

  @Column
  declare email: string;

  @Column
  declare password: string;

  @AllowNull
  @Column
  declare profilePhoto: string;

  @AllowNull
  @Column
  declare bio: string;

  @Column
  declare userName: string;
}
