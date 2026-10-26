import { AggregateRoot } from '@/shared/domain';
import { RoleName } from './value-objects';

export interface RoleProps {
	name: RoleName;
	description: string | null;
	// Other aggregate, so referenced by id only. A set keeps each permission once.
	permissionIds: Set<string>;
}

export class Role extends AggregateRoot<RoleProps> {
	static create(input: { name: string; description?: string | null }): Role {
		return new Role({
			name: RoleName.create(input.name),
			description: input.description ?? null,
			permissionIds: new Set(),
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

	get permissionIds(): ReadonlySet<string> {
		return this.props.permissionIds;
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
	Replaces the whole set. The caller checks the ids exist and are assignable
	(that needs the Permission aggregate, which this one must not load).
	*/
	setPermissions(permissionIds: Iterable<string>): void {
		this.props.permissionIds = new Set(permissionIds);
	}

	/**
	Call before `repository.delete(role)`. Deletion rules (e.g. "completed roles can't be deleted") go here.
	*/
	delete(): void {}
}
