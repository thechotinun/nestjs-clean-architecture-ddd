export interface PaginationParams {
	page: number;
	perPage: number;
}

export class Paginated<T> {
	constructor(
		readonly items: T[],
		readonly totalItems: number,
		readonly page: number,
		readonly perPage: number,
	) {}

	get totalPages(): number {
		return Math.ceil(this.totalItems / this.perPage);
	}

	map<R>(function_: (item: T) => R): Paginated<R> {
		return new Paginated(this.items.map(function_), this.totalItems, this.page, this.perPage);
	}
}
