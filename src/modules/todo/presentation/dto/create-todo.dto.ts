import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TODO_TITLE_MAX_LENGTH } from '../../domain';

export class CreateTodoDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(TODO_TITLE_MAX_LENGTH)
	title: string;

	@IsOptional()
	@IsString()
	description?: string | null;
}
