import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const port = configService.get<number>('PORT') ?? 3000;
	app.enableCors({
		origin: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		credentials: true,
	});

	app.setGlobalPrefix('api');
	app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
	app.enableShutdownHooks();

	await app.listen(port);
}
void bootstrap();
