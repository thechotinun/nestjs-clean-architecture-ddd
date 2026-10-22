import { randomUUID } from 'node:crypto';

export abstract class Entity<TProperties extends object> {
	protected readonly props: TProperties;
	private readonly _id: string;
	private _isActive: boolean;

	protected constructor(properties: TProperties, id?: string, isActive = true) {
		this._id = id ?? randomUUID();
		this.props = properties;
		this._isActive = isActive;
	}

	get id(): string {
		return this._id;
	}

	get isActive(): boolean {
		return this._isActive;
	}

	// Protected: subclasses expose these only when the business allows it.
	protected activate(): void {
		this._isActive = true;
	}

	protected deactivate(): void {
		this._isActive = false;
	}

	equals(other?: Entity<TProperties>): boolean {
		if (!other) return false;
		if (this === other) return true;
		return other.constructor === this.constructor ? this._id === other._id : false;
	}
}
