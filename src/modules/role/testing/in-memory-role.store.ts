// Test-only in-memory adapters. Repository and query share one store,
// so a write is immediately visible to reads (like the real DB).
import { Paginated } from '@/shared/application';
import type { RoleQueryService, RoleView } from '../application';
import type { Role, RoleRepository } from '../domain';

export class InMemoryRoleStore {
	readonly rows = new Map<string, RoleView>();
	private readonly aggregates = new Map<string, Role>();

	readonly repository: RoleRepository = {
		findById: async (id) =>
			this.rows.get(id)?.deletedDate ? null : (this.aggregates.get(id) ?? null),
		findByName: async (name) => {
			// eslint-disable-next-line unicorn/prefer-iterator-helpers -- lib target has no Iterator#find yet
			const row = [...this.rows.values()].find((r) => !r.deletedDate && r.name === name);
			return row ? (this.aggregates.get(row.id) ?? null) : null;
		},
		save: async (role) => {
			const now = new Date();
			const existing = this.rows.get(role.id);
			this.aggregates.set(role.id, role);
			this.rows.set(role.id, {
				id: role.id,
				isActive: role.isActive,
				createdDate: existing?.createdDate ?? now,
				createdBy: existing?.createdBy ?? null,
				updatedDate: now,
				updatedBy: existing?.updatedBy ?? null,
				deletedDate: null,
				deletedBy: null,
				name: role.name.value,
				description: role.description,
				permissionIds: [...role.permissionIds],
			});
		},
		delete: async (role) => {
			const row = this.rows.get(role.id);
			if (row) row.deletedDate = new Date();
		},
	};

	readonly query: RoleQueryService = {
		findById: async (id) => {
			const row = this.rows.get(id);
			return row && !row.deletedDate ? row : null;
		},
		findAll: async ({ page, perPage }) => {
			const live = [...this.rows.values()].filter((r) => !r.deletedDate);
			const start = (page - 1) * perPage;
			return new Paginated(live.slice(start, start + perPage), live.length, page, perPage);
		},
	};
}
