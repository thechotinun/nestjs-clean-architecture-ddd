import { AggregateRoot } from '@/shared/domain';
import { RoleName } from './value-objects';

export interface RoleProps {
	name: RoleName;
	description: string | null;
}

export class Role extends AggregateRoot<RoleProps> {
	static create(input: { name: string; description?: string | null }): Role {
		return new Role({
			name: RoleName.create(input.name),
			description: input.description ?? null,
		});
	}

	static restore(props: RoleProps, id: string, isActive: boolean): Role {
		return new Role(props, id, isActive);
	}

	get name(): RoleName {
		return this.props.name;
	}

	get description(): string | null {
		return this.props.description;
	}

	/**
	`undefined` keeps the current value; `null` clears description.
	*/
	update(input: { name?: string; description?: string | null }): void {
		if (input.name !== undefined) {
			this.props.name = RoleName.create(input.name);
		}
		if (input.description !== undefined) {
			this.props.description = input.description;
		}
	}

	/**
	Call before `repository.delete(role)`. Deletion rules (e.g. "completed roles can't be deleted") go here.
	*/
	delete(): void {}
}
