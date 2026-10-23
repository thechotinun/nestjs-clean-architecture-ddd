import { Role, RoleNameAlreadyExistsException, RoleNotFoundException } from '../../domain';
import { InMemoryRoleStore } from '../../testing/in-memory-role.store';
import { CreateRoleUseCase } from './create-role.use-case';
import { DeleteRoleUseCase } from './delete-role.use-case';
import { GetRoleUseCase } from './get-role.use-case';
import { ListRolesUseCase } from './list-roles.use-case';
import { UpdateRoleUseCase } from './update-role.use-case';

describe('Role use cases', () => {
	let store: InMemoryRoleStore;

	beforeEach(() => {
		store = new InMemoryRoleStore();
	});

	const seed = async (name = 'A', description: string | null = null) => {
		const role = Role.create({ name, description });
		await store.repository.save(role);
		return role;
	};

	it('CreateRole should save the aggregate and return its view', async () => {
		const view = await new CreateRoleUseCase(store.repository, store.query).execute({
			name: ' A ',
		});

		expect(view).toMatchObject({
			name: 'A',
			description: null,
			isActive: true,
		});
		expect(store.rows.has(view.id)).toBe(true);
	});

	it('CreateRole should throw when the name already exists and not save', async () => {
		await seed('A');
		const save = jest.spyOn(store.repository, 'save');

		await expect(
			new CreateRoleUseCase(store.repository, store.query).execute({ name: 'A' }),
		).rejects.toThrow(RoleNameAlreadyExistsException);
		expect(save).not.toHaveBeenCalled();
	});

	it('GetRole should return the view or throw when missing', async () => {
		const role = await seed();
		const useCase = new GetRoleUseCase(store.query);

		await expect(useCase.execute(role.id)).resolves.toMatchObject({
			id: role.id,
		});
		await expect(useCase.execute('missing')).rejects.toThrow(RoleNotFoundException);
	});

	it('ListRoles should page through the query service', async () => {
		await seed('A');
		await seed('B');

		const page = await new ListRolesUseCase(store.query).execute({
			page: 2,
			perPage: 1,
		});

		expect(page).toMatchObject({ totalItems: 2, page: 2, perPage: 1 });
		expect(page.items).toHaveLength(1);
	});

	it('UpdateRole should change the aggregate, save, and return the view', async () => {
		const role = await seed('A', 'd');

		const view = await new UpdateRoleUseCase(store.repository, store.query).execute({
			id: role.id,
			name: 'B',
		});

		expect(view).toMatchObject({ name: 'B', description: 'd' });
	});

	it('UpdateRole should throw when the new name already exists and not save', async () => {
		await seed('A');
		const role = await seed('B');
		const save = jest.spyOn(store.repository, 'save');

		await expect(
			new UpdateRoleUseCase(store.repository, store.query).execute({
				id: role.id,
				name: 'A',
			}),
		).rejects.toThrow(RoleNameAlreadyExistsException);
		expect(save).not.toHaveBeenCalled();
	});

	it('UpdateRole should allow saving the same name it already has', async () => {
		const role = await seed('A', 'd');

		const view = await new UpdateRoleUseCase(store.repository, store.query).execute({
			id: role.id,
			name: 'A',
			description: 'd2',
		});

		expect(view).toMatchObject({ name: 'A', description: 'd2' });
	});

	it('UpdateRole should throw when missing and not save', async () => {
		const save = jest.spyOn(store.repository, 'save');

		await expect(
			new UpdateRoleUseCase(store.repository, store.query).execute({
				id: 'missing',
				name: 'B',
			}),
		).rejects.toThrow(RoleNotFoundException);
		expect(save).not.toHaveBeenCalled();
	});

	it('DeleteRole should load the aggregate, run its rule, then delete', async () => {
		const role = await seed();
		const loaded = (await store.repository.findById(role.id))!;
		const rule = jest.spyOn(loaded, 'delete');
		jest.spyOn(store.repository, 'findById').mockResolvedValueOnce(loaded);
		const remove = jest.spyOn(store.repository, 'delete');

		await new DeleteRoleUseCase(store.repository).execute(role.id);

		expect(rule).toHaveBeenCalled();
		expect(remove).toHaveBeenCalledWith(loaded);
		await expect(store.query.findById(role.id)).resolves.toBeNull();
	});

	it('DeleteRole should throw when missing', async () => {
		await expect(new DeleteRoleUseCase(store.repository).execute('missing')).rejects.toThrow(
			RoleNotFoundException,
		);
	});
});
