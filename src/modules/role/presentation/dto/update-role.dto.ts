import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ROLE_NAME_MAX_LENGTH } from '../../domain';

export class UpdateRoleDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(ROLE_NAME_MAX_LENGTH)
	name?: string;

	/**
	Send `null` to clear.
	*/
	@IsOptional()
	@IsString()
	description?: string | null;
}
