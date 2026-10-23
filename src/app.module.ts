import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import configuration, { envFilePath } from './config/configuration';
import { resolveErrorKey } from './error-codes';
import { DatabaseModule } from './shared/infrastructure/database';
import {
	ApiResponseInterceptor,
	createValidationPipe,
	ERROR_KEY_RESOLVER,
	HttpExceptionFilter,
} from './shared/presentation';
import { TodoModule } from './modules/todo/todo.module';
import { RoleModule } from './modules/role/role.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
			envFilePath,
		}),
		DatabaseModule,
		TodoModule,
		RoleModule,
	],
	providers: [
		{
			provide: ERROR_KEY_RESOLVER,
			useValue: resolveErrorKey,
		},
		{ provide: APP_PIPE, useFactory: createValidationPipe },
		{ provide: APP_INTERCEPTOR, useClass: ApiResponseInterceptor },
		{ provide: APP_FILTER, useClass: HttpExceptionFilter },
	],
})
export class AppModule {}
