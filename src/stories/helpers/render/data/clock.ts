/**
 * Остановка часов истории: `new Date()` без аргументов возвращает `STORY_TODAY`, пока не вызвана функция, которую вернул
 * `freezeStoryClock`. `Date.now()` не трогается: скриншот-тесты ставят `page.clock.setFixedTime`, а Vue по `Date.now()` решает, какие
 * обработчики всплытия пропустить (FOLLOW_UPS № 56). Для `beforeEach` историй, где компонент сам берёт «сегодня» (готовые периоды диапазона).
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
	}

	globalThis.Date = FrozenDate as DateConstructor
	return () => {
		globalThis.Date = RealDate
	}
}
