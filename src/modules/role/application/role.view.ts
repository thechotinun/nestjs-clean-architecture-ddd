import type { BaseView } from '@/shared/application';

/**
Read model returned by role use cases (and by the API as-is).
*/
export interface RoleView extends BaseView {
	name: string;
	description: string | null;
}
