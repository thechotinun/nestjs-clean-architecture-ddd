import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { resolveErrorKey } from '../../../error-codes';
import { Permission, PERMISSION_REPOSITORY } from '@/modules/permission/domain';
import { InMemoryPermissionStore } from '@/modules/permission/testing/in-memory-permission.store';
import {
	ApiResponseInterceptor,
	createValidationPipe,
	ERROR_KEY_RESOLVER,
	HttpExceptionFilter,
} from '@/shared/presentation';
import {
	CreateRoleUseCase,
	DeleteRoleUseCase,
	GetRoleUseCase,
	ListRolesUseCase,
	SetRolePermissionsUseCase,
	UpdateRoleUseCase,
	ROLE_QUERY_SERVICE,
} from '../application';
import { Role, ROLE_REPOSITORY } from '../domain';
import { InMemoryRoleStore } from '../testing/in-memory-role.store';
import { RoleController } from './role.controller';

const seedRoleIn = async (store: InMemoryRoleStore) => {
	const role = Role.create({ name: 'A' });
	await store.repository.save(role);
	return role;
};

const seedPermissionIn = async (
	store: InMemoryPermissionStore,
	action: string,
	isGlobal = false,
) => {
	const permission = Permission.create({ name: action, resource: 'order', action, isGlobal });
	await store.repository.save(permission);
	return permission;
};

describe('RoleController (HTTP)', () => {
	let app: INestApplication;
	let store: InMemoryRoleStore;
	let permissionStore: InMemoryPermissionStore;
	const url = '/api/v1/roles';

	beforeEach(async () => {
		store = new InMemoryRoleStore();
		permissionStore = new InMemoryPermissionStore();
		const moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					ignoreEnvFile: true,
					load: [() => ({ PER_PAGE: 10 })],
				}),
			],
			controllers: [RoleController],
			providers: [
				{ provide: ROLE_REPOSITORY, useValue: store.repository },
				{ provide: ROLE_QUERY_SERVICE, useValue: store.query },
				{ provide: PERMISSION_REPOSITORY, useValue: permissionStore.repository },
				CreateRoleUseCase,
				GetRoleUseCase,
				ListRolesUseCase,
				UpdateRoleUseCase,
				DeleteRoleUseCase,
				SetRolePermissionsUseCase,
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

	it('POST should create and return the resource', async () => {
		const res = await request(app.getHttpServer())
			.post(url)
			.send({ name: 'Buy milk', description: '2 bottles' });

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
				name: 'Buy milk',
				description: '2 bottles',
				permissionIds: [],
			},
			status: { code: 201, message: 'Created' },
		});
	});

	it('POST should reject invalid body and unknown fields', async () => {
		const res = await request(app.getHttpServer()).post(url).send({ name: '', foo: 1 });

		expect(res.status).toBe(400);
		expect(res.body.error).toMatchObject({
			code: 900422,
			message: 'VALIDATE_ERROR',
		});
		expect(res.body.error.errors).toEqual(
			expect.arrayContaining(['property foo should not exist', 'name should not be empty']),
		);
	});

	it('GET list should paginate with default perPage from config', async () => {
		await store.repository.save(Role.create({ name: 'A' }));

		const res = await request(app.getHttpServer()).get(url);

		expect(res.body.meta).toEqual({
			totalItems: 1,
			itemCount: 1,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
		});
		expect(res.body.data[0].name).toBe('A');
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
			code: 100201,
			message: 'ROLE_NOT_FOUND',
			errors: [],
		});
	});

	it('GET one should reject non-uuid id as BAD_REQUEST', async () => {
		const res = await request(app.getHttpServer()).get(`${url}/abc`);

		expect(res.status).toBe(400);
		expect(res.body.error).toEqual({
			code: 900423,
			message: 'BAD_REQUEST',
			errors: [],
		});
	});

	it('POST should map the domain title rule to its catalog code', async () => {
		const res = await request(app.getHttpServer())
			.post(url)
			.send({ name: ' '.repeat(3) });

		expect(res.status).toBe(400);
		expect(res.body.error).toEqual({
			code: 100206,
			message: 'INVALID_ROLE_NAME',
			errors: [],
		});
	});

	it('PATCH should update and allow clearing description', async () => {
		const role = Role.create({ name: 'A', description: 'd' });
		await store.repository.save(role);

		const res = await request(app.getHttpServer())
			.patch(`${url}/${role.id}`)
			.send({ description: null });

		expect(res.status).toBe(200);
		expect(res.body.data).toMatchObject({ name: 'A', description: null });
	});

	describe('PUT :id/permissions', () => {
		it('should replace the permission set and return it in the view', async () => {
			const role = await seedRoleIn(store);
			const read = await seedPermissionIn(permissionStore, 'read');
			const create = await seedPermissionIn(permissionStore, 'create');

			const res = await request(app.getHttpServer())
				.put(`${url}/${role.id}/permissions`)
				.send({ permissionIds: [read.id, create.id, read.id] });

			expect(res.status).toBe(200);
			expect(res.body.data.permissionIds).toEqual([read.id, create.id]);

			const cleared = await request(app.getHttpServer())
				.put(`${url}/${role.id}/permissions`)
				.send({ permissionIds: [] });
			expect(cleared.body.data.permissionIds).toEqual([]);
		});

		it('should return 404 for an unknown permission', async () => {
			const role = await seedRoleIn(store);

			const res = await request(app.getHttpServer())
				.put(`${url}/${role.id}/permissions`)
				.send({ permissionIds: ['1c6d5a24-7453-4e46-8b7f-f56ef1d564e6'] });

			expect(res.status).toBe(404);
			expect(res.body.error).toMatchObject({ code: 100301, message: 'PERMISSION_NOT_FOUND' });
		});

		it('should map the global permission rule to its catalog code', async () => {
			const role = await seedRoleIn(store);
			const global = await seedPermissionIn(permissionStore, 'read', true);

			const res = await request(app.getHttpServer())
				.put(`${url}/${role.id}/permissions`)
				.send({ permissionIds: [global.id] });

			expect(res.body.error).toMatchObject({
				code: 100207,
				message: 'GLOBAL_PERMISSION_NOT_ASSIGNABLE',
			});
		});

		it('should reject a body that is not a uuid array', async () => {
			const role = await seedRoleIn(store);

			const res = await request(app.getHttpServer())
				.put(`${url}/${role.id}/permissions`)
				.send({ permissionIds: ['nope'] });

			expect(res.status).toBe(400);
		});
	});

	it('DELETE should return 204 then 404', async () => {
		const role = Role.create({ name: 'A' });
		await store.repository.save(role);

		await request(app.getHttpServer()).delete(`${url}/${role.id}`).expect(204);
		await request(app.getHttpServer()).delete(`${url}/${role.id}`).expect(404);
	});
});
