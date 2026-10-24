import { AggregateRoot } from '@/shared/domain';
import { PermissionAction, PermissionName, PermissionResource } from './value-objects';

export interface PermissionProps {
	name: PermissionName;
	description: string | null;
	resource: PermissionResource;
	action: PermissionAction;
	isGlobal: boolean;
}

export class Permission extends AggregateRoot<PermissionProps> {
	static create(input: {
		name: string;
		description?: string | null;
		resource: string;
		action: string;
		isGlobal?: boolean;
	}): Permission {
		return new Permission({
			name: PermissionName.create(input.name),
			description: input.description ?? null,
			resource: PermissionResource.create(input.resource),
			action: PermissionAction.create(input.action),
			isGlobal: input.isGlobal ?? false,
		});
	}

	static restore(props: PermissionProps, id: string, isActive: boolean): Permission {
		return new Permission(props, id, isActive);
	}

	get name(): PermissionName {
		return this.props.name;
	}

	get description(): string | null {
		return this.props.description;
	}

	get resource(): PermissionResource {
		return this.props.resource;
	}

	get action(): PermissionAction {
		return this.props.action;
	}

	get isGlobal(): boolean {
		return this.props.isGlobal;
	}

	/**
	`undefined` keeps the current value; `null` clears description.
	*/
	update(input: {
		name?: string;
		description?: string | null;
		resource?: string;
		action?: string;
		isGlobal?: boolean;
	}): void {
		if (input.name !== undefined) {
			this.props.name = PermissionName.create(input.name);
		}
		if (input.description !== undefined) {
			this.props.description = input.description;
		}
		if (input.resource !== undefined) {
			this.props.resource = PermissionResource.create(input.resource);
		}
		if (input.action !== undefined) {
			this.props.action = PermissionAction.create(input.action);
		}
		if (input.isGlobal !== undefined) {
			this.props.isGlobal = input.isGlobal;
		}
	}

	/**
	Call before `repository.delete(permission)`. Deletion rules go here.
	*/
	delete(): void {}
}
