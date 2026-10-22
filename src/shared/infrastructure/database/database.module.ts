import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './typeorm.config';

@Module({
	imports: [TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService })],
})
export class DatabaseModule {}
