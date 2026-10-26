import type {
	FindOptionsOrder,
	FindOptionsRelations,
	FindOptionsWhere,
	Repository as OrmRepository,
} from 'typeorm';
import {
	type BaseView,
	Paginated,
	type PaginationParams as PaginationParameters,
	type QueryService,
} from '../../application';
import type { BaseOrmEntity } from './base.orm-entity';

export const toBaseView = (record: BaseOrmEntity): BaseView => ({
	id: record.id,
	isActive: record.isActive,
	createdDate: record.createdDate ?? null,
	createdBy: record.createdBy ?? null,
	updatedDate: record.updatedDate ?? null,
	updatedBy: record.updatedBy ?? null,
	deletedDate: record.deletedDate ?? null,
	deletedBy: record.deletedBy ?? null,
});

/**
Generic TypeORM implementation of the application `QueryService` port (read side).
Module query services extend it, implement `toView`, and add their own queries.
*/
export abstract class TypeOrmBaseQueryService<
	TOrmEntity extends BaseOrmEntity,
	TView,
> implements QueryService<TView> {
	protected readonly defaultOrder = {
		createdDate: 'DESC',
	} as FindOptionsOrder<TOrmEntity>;

	/**
	Relations loaded with every record, for views that embed related ids.
	*/
	protected readonly relations?: FindOptionsRelations<TOrmEntity>;

	protected constructor(protected readonly repository: OrmRepository<TOrmEntity>) {}

	protected abstract toView(record: TOrmEntity): TView;

	async findById(id: string): Promise<TView | null> {
		const record = await this.repository.findOne({
			where: { id } as FindOptionsWhere<TOrmEntity>,
			relations: this.relations,
		});
		return record ? this.toView(record) : null;
	}

	async findAll({ page, perPage }: PaginationParameters): Promise<Paginated<TView>> {
		const [records, total] = await this.repository.findAndCount({
			order: this.defaultOrder,
			relations: this.relations,
			skip: (page - 1) * perPage,
			take: perPage,
		});
		return new Paginated(
			records.map((record) => this.toView(record)),
			total,
			page,
			perPage,
		);
	}
}
