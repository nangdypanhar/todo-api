import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    await this.assertEmailAvailable(createUserDto.email);
    const user = this.userRepository.create(createUserDto);
    const { passwordHash: _passwordHash, ...publicUser } = await this.userRepository.save(user);
    return publicUser;
  }

  async signUp(signUpDto: SignUpDto): Promise<Omit<User, 'passwordHash'>> {
    const { password, ...details } = signUpDto;
    await this.assertEmailAvailable(details.email);
    const user = this.userRepository.create({
      ...details,
      passwordHash: await argon2.hash(password),
    });
    const { passwordHash: _passwordHash, ...publicUser } = await this.userRepository.save(user);
    return publicUser;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    if (await this.userRepository.existsBy({ email })) {
      throw new ConflictException('Unable to create account with this email');
    }
  }
}
