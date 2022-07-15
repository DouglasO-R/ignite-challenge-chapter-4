import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddColumStatementSenderID1657827631311 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'statements',
      new TableColumn({
        name: 'sender_id',
        type: 'uuid',
        isNullable: true,
      }),
    )

    await queryRunner.createForeignKey(
      'statements',
      new TableForeignKey({
        name: 'FKStatementSenderUser',
        columnNames: ['sender_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('statements', 'FKStatementSenderUser')

    await queryRunner.dropColumn('statements', 'sender_id')
  }

}
