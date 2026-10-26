import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class SetRolePermissionsDto {
	/**
	The full set the role should have after the call; an empty array removes all.
	*/
	@IsArray()
	@ArrayMaxSize(500)
	@IsUUID('all', { each: true })
	permissionIds: string[];
}
