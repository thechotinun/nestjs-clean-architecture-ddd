import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@/shared/application';
import {
	getPermissionViewOrThrow,
	PERMISSION_QUERY_SERVICE,
	type PermissionQueryService,
} from '../permission.query';
import type { PermissionView } from '../permission.view';

@Injectable()
export class GetPermissionUseCase implements UseCase<string, PermissionView> {
	constructor(
		@Inject(PERMISSION_QUERY_SERVICE) private readonly permissionQuery: PermissionQueryService,
	) {}

	execute(id: string): Promise<PermissionView> {
		return getPermissionViewOrThrow(this.permissionQuery, id);
	}
}
