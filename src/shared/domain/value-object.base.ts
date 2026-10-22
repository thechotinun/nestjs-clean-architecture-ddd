export abstract class ValueObject<TProperties extends object> {
	protected readonly props: Readonly<TProperties>;

	protected constructor(properties: TProperties) {
		this.props = Object.freeze({ ...properties });
	}

	equals(other?: ValueObject<TProperties>): boolean {
		if (!other) return false;
		if (this === other) return true;
		if (other.constructor !== this.constructor) return false;

		const keys = Object.keys(this.props) as (keyof TProperties)[];
		return keys.length === Object.keys(other.props).length
			? keys.every((key) => isEqual(this.props[key], other.props[key]))
			: false;
	}
}

function isEqual(a: unknown, b: unknown): boolean {
	if (a instanceof ValueObject && b instanceof ValueObject) return a.equals(b);
	return a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : Object.is(a, b);
}
