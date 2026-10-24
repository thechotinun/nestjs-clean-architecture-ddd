import type { BaseView } from '@/shared/application';

/**
Read model returned by permission use cases (and by the API as-is).
*/
export interface PermissionView extends BaseView {
	name: string;
	description: string | null;
	resource: string;
	action: string;
	isGlobal: boolean;
}
