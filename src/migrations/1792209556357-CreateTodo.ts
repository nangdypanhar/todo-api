import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTodo1792209556357 implements MigrationInterface {
    name = 'CreateTodo1792209556357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "todo" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "status" character varying NOT NULL, "starred" boolean NOT NULL, CONSTRAINT "PK_d429b7114371f6a35c5cb4776a7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "todo"`);
    }

}
