import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity.js";

@Entity()
export class Todo {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    title: string;
    @Column()
    status: string;
    @Column()
    starred: boolean;
    @Column({ nullable: true })
    userId: number;
    @ManyToOne(() => User, (user) => user.todos, { onDelete: 'CASCADE' })
    user: User;
}
