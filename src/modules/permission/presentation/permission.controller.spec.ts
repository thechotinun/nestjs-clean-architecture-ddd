import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { resolveErrorKey } from '../../../error-codes';
import {
	ApiResponseInterceptor,
	createValidationPipe,
	ERROR_KEY_RESOLVER,
	HttpExceptionFilter,
} from '@/shared/presentation';
import {
	CreatePermissionUseCase,
	DeletePermissionUseCase,
	GetPermissionUseCase,
	ListPermissionsUseCase,
	PERMISSION_QUERY_SERVICE,
	UpdatePermissionUseCase,
} from '../application';
import { Permission, PERMISSION_REPOSITORY } from '../domain';
import { InMemoryPermissionStore } from '../testing/in-memory-permission.store';
import { PermissionController } from './permission.controller';

describe('PermissionController (HTTP)', () => {
	let app: INestApplication;
	let store: InMemoryPermissionStore;
	const url = '/api/v1/permissions';
	const body = { name: 'Create todo', resource: 'todo', action: 'create' };

	beforeEach(async () => {
		store = new InMemoryPermissionStore();
		const moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					ignoreEnvFile: true,
					load: [() => ({ PER_PAGE: 10 })],
				}),
			],
			controllers: [PermissionController],
			providers: [
				{ provide: PERMISSION_REPOSITORY, useValue: store.repository },
				{ provide: PERMISSION_QUERY_SERVICE, useValue: store.query },
				CreatePermissionUseCase,
				GetPermissionUseCase,
				ListPermissionsUseCase,
				UpdatePermissionUseCase,
				DeletePermissionUseCase,
				{ provide: APP_PIPE, useFactory: createValidationPipe },
				{ provide: APP_INTERCEPTOR, useClass: ApiResponseInterceptor },
				{ provide: APP_FILTER, useClass: HttpExceptionFilter },
				{
					provide: ERROR_KEY_RESOLVER,
					useValue: resolveErrorKey,
				},
			],
		}).compile();

		app = moduleRef.createNestApplication({ logger: false });
		app.setGlobalPrefix('api');
		app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it('POST should create and return the resource, isGlobal defaulting to false', async () => {
		const res = await request(app.getHttpServer())
			.post(url)
			.send({ ...body, description: 'Can create todos' });

		expect(res.status).toBe(201);
		expect(res.body).toEqual({
			data: {
				id: expect.any(String),
				isActive: true,
				createdDate: expect.any(String),
				createdBy: null,
				updatedDate: expect.any(String),
				updatedBy: null,
				deletedDate: null,
				deletedBy: null,
				name: 'Create todo',
				description: 'Can create todos',
				resource: 'todo',
				action: 'create',
				isGlobal: false,
			},
			status: { code: 201, message: 'Created' },
		});
	});

	it('POST should lowercase resource and action', async () => {
		const res = await request(app.getHttpServer())
			.post(url)
			.send({ ...body, resource: 'Todo', action: 'CREATE' });

		expect(res.status).toBe(201);
		expect(res.body.data).toMatchObject({ resource: 'todo', action: 'create' });
	});

	it('POST should reject missing fields, wrong types and unknown fields', async () => {
		const res = await request(app.getHttpServer())
			.post(url)
			.send({ name: '', isGlobal: 'yes', foo: 1 });

		expect(res.status).toBe(400);
		expect(res.body.error).toMatchObject({ code: 900422, message: 'VALIDATE_ERROR' });
		expect(res.body.error.errors).toEqual(
			expect.arrayContaining([
				'property foo should not exist',
				'name should not be empty',
				'resource should not be empty',
				'action should not be empty',
				'isGlobal must be a boolean value',
			]),
		);
	});

	it('POST should return 409 with business code when resource + action already exist', async () => {
		await store.repository.save(Permission.create(body));

		const res = await request(app.getHttpServer())
			.post(url)
			.send({ ...body, name: 'Another name', resource: 'TODO' });

		expect(res.status).toBe(409);
		expect(res.body.error).toEqual({
			code: 100302,
			message: 'PERMISSION_ALREADY_EXISTS',
			errors: [],
		});
	});

	it('POST should map blank domain values to their catalog codes', async () => {
		const blank = ' '.repeat(3);
		const cases: [Record<string, string>, number, string][] = [
			[{ ...body, name: blank }, 100306, 'INVALID_PERMISSION_NAME'],
			[{ ...body, resource: blank }, 100307, 'INVALID_PERMISSION_RESOURCE'],
			[{ ...body, action: blank }, 100308, 'INVALID_PERMISSION_ACTION'],
		];

		for (const [payload, code, message] of cases) {
			const res = await request(app.getHttpServer()).post(url).send(payload);

			expect(res.status).toBe(400);
			expect(res.body.error).toEqual({ code, message, errors: [] });
		}
	});

	it('GET list should paginate with default perPage from config', async () => {
		await store.repository.save(Permission.create(body));

		const res = await request(app.getHttpServer()).get(url);

		expect(res.body.meta).toEqual({
			totalItems: 1,
			itemCount: 1,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
		});
		expect(res.body.data[0]).toMatchObject({ resource: 'todo', action: 'create' });
	});

	it('GET list should reject invalid pagination query', async () => {
		const res = await request(app.getHttpServer()).get(`${url}?perPage=0`);

		expect(res.status).toBe(400);
	});

	it('GET one should return 404 with business code when missing', async () => {
		const res = await request(app.getHttpServer()).get(
			`${url}/1c6d5a24-7453-4e46-8b7f-f56ef1d564e6`,
		);

		expect(res.status).toBe(404);
		expect(res.body.error).toEqual({
			code: 100301,
			message: 'PERMISSION_NOT_FOUND',
			errors: [],
		});
	});

	it('GET one should reject non-uuid id as BAD_REQUEST', async () => {
		const res = await request(app.getHttpServer()).get(`${url}/abc`);

		expect(res.status).toBe(400);
		expect(res.body.error).toEqual({ code: 900423, message: 'BAD_REQUEST', errors: [] });
	});

	it('PATCH should update, toggle isGlobal and allow clearing description', async () => {
		const permission = Permission.create({ ...body, description: 'd' });
		await store.repository.save(permission);

		const res = await request(app.getHttpServer())
			.patch(`${url}/${permission.id}`)
			.send({ description: null, isGlobal: true });

		expect(res.status).toBe(200);
		expect(res.body.data).toMatchObject({
			name: 'Create todo',
			description: null,
			isGlobal: true,
		});
	});

	it('PATCH should return 409 when moving onto an existing resource + action', async () => {
		await store.repository.save(Permission.create(body));
		const other = Permission.create({ ...body, action: 'read' });
		await store.repository.save(other);

		const res = await request(app.getHttpServer())
			.patch(`${url}/${other.id}`)
			.send({ action: 'create' });

		expect(res.status).toBe(409);
		expect(res.body.error.code).toBe(100302);
	});

	it('DELETE should return 204 then 404', async () => {
		const permission = Permission.create(body);
		await store.repository.save(permission);

		await request(app.getHttpServer()).delete(`${url}/${permission.id}`).expect(204);
		await request(app.getHttpServer()).delete(`${url}/${permission.id}`).expect(404);
	});
});
