import {
	Permission,
	PermissionAlreadyExistsException,
	PermissionNotFoundException,
} from '../../domain';
import { InMemoryPermissionStore } from '../../testing/in-memory-permission.store';
import { CreatePermissionUseCase } from './create-permission.use-case';
import { DeletePermissionUseCase } from './delete-permission.use-case';
import { GetPermissionUseCase } from './get-permission.use-case';
import { ListPermissionsUseCase } from './list-permissions.use-case';
import { UpdatePermissionUseCase } from './update-permission.use-case';

describe('Permission use cases', () => {
	let store: InMemoryPermissionStore;

	beforeEach(() => {
		store = new InMemoryPermissionStore();
	});

	const seed = async (action = 'create') => {
		const permission = Permission.create({ name: `${action} todo`, resource: 'todo', action });
		await store.repository.save(permission);
		return permission;
	};

	it('CreatePermission should save the aggregate and return its view', async () => {
		const view = await new CreatePermissionUseCase(store.repository, store.query).execute({
			name: ' Create todo ',
			resource: ' Todo ',
			action: 'CREATE',
		});

		expect(view).toMatchObject({
			name: 'Create todo',
			description: null,
			resource: 'todo',
			action: 'create',
			isGlobal: false,
			isActive: true,
		});
		expect(store.rows.has(view.id)).toBe(true);
	});

	it('CreatePermission should throw when resource + action already exist and not save', async () => {
		await seed('create');
		const save = jest.spyOn(store.repository, 'save');

		await expect(
			new CreatePermissionUseCase(store.repository, store.query).execute({
				name: 'Other name',
				resource: ' TODO ',
				action: 'Create',
			}),
		).rejects.toThrow(PermissionAlreadyExistsException);
		expect(save).not.toHaveBeenCalled();
	});

	it('CreatePermission should allow the same resource with another action and vice versa', async () => {
		await seed('create');
		const useCase = new CreatePermissionUseCase(store.repository, store.query);

		await expect(
			useCase.execute({ name: 'Read todo', resource: 'todo', action: 'read' }),
		).resolves.toMatchObject({ resource: 'todo', action: 'read' });
		await expect(
			useCase.execute({ name: 'Create role', resource: 'role', action: 'create' }),
		).resolves.toMatchObject({ resource: 'role', action: 'create' });
	});

	it('CreatePermission should allow re-creating a pair whose permission was deleted', async () => {
		const old = await seed('create');
		await store.repository.delete(old);

		await expect(
			new CreatePermissionUseCase(store.repository, store.query).execute({
				name: 'Create todo',
				resource: 'todo',
				action: 'create',
			}),
		).resolves.toMatchObject({ resource: 'todo', action: 'create' });
	});

	it('GetPermission should return the view or throw when missing', async () => {
		const permission = await seed();
		const useCase = new GetPermissionUseCase(store.query);

		await expect(useCase.execute(permission.id)).resolves.toMatchObject({ id: permission.id });
		await expect(useCase.execute('missing')).rejects.toThrow(PermissionNotFoundException);
	});

	it('ListPermissions should page through the query service', async () => {
		await seed('create');
		await seed('read');

		const page = await new ListPermissionsUseCase(store.query).execute({ page: 2, perPage: 1 });

		expect(page).toMatchObject({ totalItems: 2, page: 2, perPage: 1 });
		expect(page.items).toHaveLength(1);
	});

	it('UpdatePermission should change the aggregate, save, and return the view', async () => {
		const permission = await seed();

		const view = await new UpdatePermissionUseCase(store.repository, store.query).execute({
			id: permission.id,
			name: 'New name',
			description: 'd',
			isGlobal: true,
		});

		expect(view).toMatchObject({
			name: 'New name',
			description: 'd',
			resource: 'todo',
			action: 'create',
			isGlobal: true,
		});
	});

	it('UpdatePermission should throw when the new resource + action already exist and not save', async () => {
		await seed('create');
		const permission = await seed('read');
		const save = jest.spyOn(store.repository, 'save');

		await expect(
			new UpdatePermissionUseCase(store.repository, store.query).execute({
				id: permission.id,
				action: ' CREATE ',
			}),
		).rejects.toThrow(PermissionAlreadyExistsException);
		expect(save).not.toHaveBeenCalled();
	});

	it('UpdatePermission should allow moving to a free resource + action pair', async () => {
		await seed('create');
		const permission = await seed('read');

		const view = await new UpdatePermissionUseCase(store.repository, store.query).execute({
			id: permission.id,
			resource: 'role',
		});

		expect(view).toMatchObject({ resource: 'role', action: 'read' });
	});

	it('UpdatePermission should not look up duplicates when the pair is unchanged', async () => {
		const permission = await seed('create');
		const find = jest.spyOn(store.repository, 'findByResourceAndAction');

		const view = await new UpdatePermissionUseCase(store.repository, store.query).execute({
			id: permission.id,
			name: 'Renamed',
			resource: 'TODO',
			action: 'create',
		});

		expect(view).toMatchObject({ name: 'Renamed', resource: 'todo', action: 'create' });
		expect(find).not.toHaveBeenCalled();
	});

	it('UpdatePermission should throw when missing and not save', async () => {
		const save = jest.spyOn(store.repository, 'save');

		await expect(
			new UpdatePermissionUseCase(store.repository, store.query).execute({
				id: 'missing',
				name: 'X',
			}),
		).rejects.toThrow(PermissionNotFoundException);
		expect(save).not.toHaveBeenCalled();
	});

	it('DeletePermission should load the aggregate, run its rule, then delete', async () => {
		const permission = await seed();
		const loaded = (await store.repository.findById(permission.id))!;
		const rule = jest.spyOn(loaded, 'delete');
		jest.spyOn(store.repository, 'findById').mockResolvedValueOnce(loaded);
		const remove = jest.spyOn(store.repository, 'delete');

		await new DeletePermissionUseCase(store.repository).execute(permission.id);

		expect(rule).toHaveBeenCalled();
		expect(remove).toHaveBeenCalledWith(loaded);
		await expect(store.query.findById(permission.id)).resolves.toBeNull();
	});

	it('DeletePermission should throw when missing', async () => {
		await expect(new DeletePermissionUseCase(store.repository).execute('missing')).rejects.toThrow(
			PermissionNotFoundException,
		);
	});
});
