import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {
	PERMISSION_ACTION_MAX_LENGTH,
	PERMISSION_NAME_MAX_LENGTH,
	PERMISSION_RESOURCE_MAX_LENGTH,
} from '../../domain';

export class CreatePermissionDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(PERMISSION_NAME_MAX_LENGTH)
	name: string;

	@IsOptional()
	@IsString()
	description?: string | null;

	@IsString()
	@IsNotEmpty()
	@MaxLength(PERMISSION_RESOURCE_MAX_LENGTH)
	resource: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(PERMISSION_ACTION_MAX_LENGTH)
	action: string;

	@IsOptional()
	@IsBoolean()
	isGlobal?: boolean;
}
