import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'

export interface UseSlidingIndicatorOptions {
	/**
	 * Селектор пунктов внутри контейнера; индекс `activeIndex` считается среди них. По умолчанию `[data-indicator-item]`
	 */
	itemSelector?: string
}

/** Положение и размер активного пункта относительно контейнера (с учётом его прокрутки), в пикселях */
export interface SlidingIndicatorRect {
	x: number
	y: number
	width: number
	height: number
}

export interface UseSlidingIndicatorReturn {
	/** Замер активного пункта; `null` — активного пункта нет */
	rect: Readonly<Ref<SlidingIndicatorRect | null>>
	/** CSS-переменные `--indicator-x/-y/-w/-h` для контейнера; пусто, пока активного пункта нет */
	style: ComputedRef<Record<string, string>>
	/** Есть активный пункт — индикатор показывать */
	isVisible: ComputedRef<boolean>
	/** Первый замер после появления индикатора: ставить без перехода, чтобы он не въезжал из угла */
	isInstant: Readonly<Ref<boolean>>
	/** Замерить заново — после изменений, которых не видит ResizeObserver (например, смена текста без смены размера) */
	update: () => void
}

/** Контейнер индикатора: ref, геттер или элемент */
export type SlidingIndicatorContainer = MaybeRefOrGetter<HTMLElement | null | undefined>

/** Индекс активного пункта; `null`, `undefined` или отрицательный — активного нет */
export type SlidingIndicatorIndex = MaybeRefOrGetter<number | null | undefined>
