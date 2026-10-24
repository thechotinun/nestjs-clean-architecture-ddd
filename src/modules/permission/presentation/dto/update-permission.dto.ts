import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {
	PERMISSION_ACTION_MAX_LENGTH,
	PERMISSION_NAME_MAX_LENGTH,
	PERMISSION_RESOURCE_MAX_LENGTH,
} from '../../domain';

export class UpdatePermissionDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(PERMISSION_NAME_MAX_LENGTH)
	name?: string;

	/**
	Send `null` to clear.
	*/
	@IsOptional()
	@IsString()
	description?: string | null;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(PERMISSION_RESOURCE_MAX_LENGTH)
	resource?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(PERMISSION_ACTION_MAX_LENGTH)
	action?: string;

	@IsOptional()
	@IsBoolean()
	isGlobal?: boolean;
}
