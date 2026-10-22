// DataSource for the TypeORM CLI (migrations). Runs outside Nest against compiled output in dist/.
// synchronize follows DATABASE_SYNC; migration:generate/run/revert force it off on their own.
import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import config_, { envFilePath as environmentFilePath } from '../../../config/configuration';
import { buildConnectionOptions } from './typeorm.config';
import { join } from 'node:path';

config({ path: environmentFilePath, quiet: true });

export default new DataSource({
	...buildConnectionOptions(config_().database),
	// The CLI does not know about forFeature(), so entities are discovered by file name.
	entities: [join(__dirname, '../../../**/*.orm-entity.js')],
	migrations: [join(__dirname, './migrations/*.js')],
});
