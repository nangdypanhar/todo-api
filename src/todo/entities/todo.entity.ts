import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
