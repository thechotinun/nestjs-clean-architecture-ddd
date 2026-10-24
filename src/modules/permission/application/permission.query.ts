import type { QueryService } from '@/shared/application';
import { PermissionNotFoundException } from '../domain';
import type { PermissionView } from './permission.view';

export const PERMISSION_QUERY_SERVICE = Symbol('PERMISSION_QUERY_SERVICE');

// Add permission-specific read queries here (filters, search, ...).
export interface PermissionQueryService extends QueryService<PermissionView> {}

export async function getPermissionViewOrThrow(
	query: PermissionQueryService,
	id: string,
): Promise<PermissionView> {
	const view = await query.findById(id);
	if (!view) throw new PermissionNotFoundException();
	return view;
}
