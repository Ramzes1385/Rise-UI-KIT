/**
 * Остановка часов истории: `new Date()` без аргументов и `Date.now()` возвращают `STORY_TODAY`, пока не вызвана функция,
 * которую вернул `freezeStoryClock`. Для `beforeEach` историй, где компонент сам берёт «сегодня» (готовые периоды диапазона).
 * Таймеры не затрагиваются: анимации и задержки идут как обычно. В «Show code» не попадает.
 */
import { STORY_TODAY } from './fixtures'

export function freezeStoryClock(now: Date = STORY_TODAY): () => void {
	const RealDate = Date
	const fixed = now.getTime()

	class FrozenDate extends RealDate {
		constructor(...args: [] | [number | string | Date] | [number, number, ...number[]]) {
			if (args.length === 0) super(fixed)
			else super(...(args as ConstructorParameters<DateConstructor>))
		}

		static override now(): number {
			return fixed
		}
	}

	globalThis.Date = FrozenDate as DateConstructor
	return () => {
		globalThis.Date = RealDate
	}
}
