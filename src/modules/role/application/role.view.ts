import type { BaseView } from '@/shared/application';

/**
Read model returned by role use cases (and by the API as-is).
*/
export interface RoleView extends BaseView {
	name: string;
	description: string | null;
	// Details of each permission come from the permission read side.
	permissionIds: string[];
}
