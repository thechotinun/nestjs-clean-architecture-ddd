import type { DomainEvent } from './domain-event';
import { Entity } from './entity.base';

export abstract class AggregateRoot<TProperties extends object> extends Entity<TProperties> {
	private _domainEvents: DomainEvent[] = [];

	get domainEvents(): readonly DomainEvent[] {
		return this._domainEvents;
	}

	protected addDomainEvent(event: DomainEvent): void {
		this._domainEvents.push(event);
	}

	pullDomainEvents(): DomainEvent[] {
		const events = this._domainEvents;
		this._domainEvents = [];
		return events;
	}
}
