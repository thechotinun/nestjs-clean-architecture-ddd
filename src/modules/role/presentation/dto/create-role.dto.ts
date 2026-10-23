import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ROLE_NAME_MAX_LENGTH } from '../../domain';

export class CreateRoleDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(ROLE_NAME_MAX_LENGTH)
	name: string;

	@IsOptional()
	@IsString()
	description?: string | null;
}
