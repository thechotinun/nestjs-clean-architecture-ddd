// Test-only in-memory adapters. Repository and query share one store,
// so a write is immediately visible to reads (like the real DB).
import { Paginated } from '@/shared/application';
import type { PermissionQueryService, PermissionView } from '../application';
import type { Permission, PermissionRepository } from '../domain';

export class InMemoryPermissionStore {
	readonly rows = new Map<string, PermissionView>();
	private readonly aggregates = new Map<string, Permission>();

	readonly repository: PermissionRepository = {
		findById: async (id) =>
			this.rows.get(id)?.deletedDate ? null : (this.aggregates.get(id) ?? null),
		findByIds: async (ids) => {
			const found: Permission[] = [];
			for (const id of ids) {
				const aggregate = this.aggregates.get(id);
				if (aggregate && !this.rows.get(id)?.deletedDate) found.push(aggregate);
			}
			return found;
		},
		findByResourceAndAction: async (resource, action) => {
			for (const row of this.rows.values()) {
				if (!row.deletedDate && row.resource === resource && row.action === action) {
					return this.aggregates.get(row.id) ?? null;
				}
			}
			return null;
		},
		save: async (permission) => {
			const now = new Date();
			const existing = this.rows.get(permission.id);
			this.aggregates.set(permission.id, permission);
			this.rows.set(permission.id, {
				id: permission.id,
				isActive: permission.isActive,
				createdDate: existing?.createdDate ?? now,
				createdBy: existing?.createdBy ?? null,
				updatedDate: now,
				updatedBy: existing?.updatedBy ?? null,
				deletedDate: null,
				deletedBy: null,
				name: permission.name.value,
				description: permission.description,
				resource: permission.resource.value,
				action: permission.action.value,
				isGlobal: permission.isGlobal,
			});
		},
		delete: async (permission) => {
			const row = this.rows.get(permission.id);
			if (row) row.deletedDate = new Date();
		},
	};

	readonly query: PermissionQueryService = {
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
