import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDB1792899314485 implements MigrationInterface {
	name = 'InitDB1792899314485';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "rel_role_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_bdb51beee510cdb44552939b0a2" PRIMARY KEY ("role_id", "permission_id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_4d6e3fbb4414b1fedfd4ce6323" ON "rel_role_permissions"  ("role_id") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_54f659ce0f3c057bd1b83d9bd2" ON "rel_role_permissions"  ("permission_id") `,
		);
		await queryRunner.query(
			`ALTER TABLE "rel_role_permissions" ADD CONSTRAINT "FK_4d6e3fbb4414b1fedfd4ce6323e" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "rel_role_permissions" ADD CONSTRAINT "FK_54f659ce0f3c057bd1b83d9bd2e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "rel_role_permissions" DROP CONSTRAINT "FK_54f659ce0f3c057bd1b83d9bd2e"`,
		);
		await queryRunner.query(
			`ALTER TABLE "rel_role_permissions" DROP CONSTRAINT "FK_4d6e3fbb4414b1fedfd4ce6323e"`,
		);
		await queryRunner.query(`DROP INDEX "public"."IDX_54f659ce0f3c057bd1b83d9bd2"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_4d6e3fbb4414b1fedfd4ce6323"`);
		await queryRunner.query(`DROP TABLE "rel_role_permissions"`);
	}
}
