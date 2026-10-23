/** Доступные типы анимаций */
export const ANIMATION_NAMES = [
	'fade',
	'slide-up',
	'slide-down',
	'slide-left',
	'slide-right',
	'scale',
	'bounce',
	'rotate',
	'flip',
	'zoom',
	'collapse',
	'list',
] as const

/** Режимы анимации */
export const ANIMATION_MODES = ['out-in', 'in-out', 'default'] as const

export type TransitionName = (typeof ANIMATION_NAMES)[number]

import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Части обёртки для пропа `ui` (БЭМ-элементы `.base-animation__<часть>`, `root` — сама обёртка, в `isGroup` — контейнер списка):
 * inner — внутренний блок `collapse`, который раскрывается по высоте.
 */
export const ANIMATION_PARTS = ['inner'] as const

export type BaseAnimationPart = (typeof ANIMATION_PARTS)[number]

/** Обёртка анимации без своего вида: из общих пропсов — только `customClass` (`variant`, `sizeScale` и `color` удалены в 2.0) */
export interface BaseAnimationProps extends Pick<BaseComponentProps<string, 'root'>, 'customClass'> {
	/** Показывать содержимое. Переключение запускает анимацию появления или исчезновения. По умолчанию `true`. */
	show?: boolean
	/**
	 * Анимация: `fade`, `slide-up`/`-down`/`-left`/`-right`, `scale`, `bounce`, `rotate`, `flip`, `zoom`, `collapse`;
	 * `list` — для списков (`isGroup`). Длительности, сдвиг и масштаб — токены движения (`--rise-duration*`,
	 * `--rise-motion-distance`, `--rise-motion-scale-from`), поэтому пресет `data-rise-motion` меняет и их; при «уменьшить
	 * движение» и пресете `none` переход мгновенный. `collapse` раскрывает по высоте через строку сетки `0fr ↔ 1fr`
	 * (содержимое обёрнуто в `.base-animation__inner`).
	 */
	name?: TransitionName
	/**
	 * Порядок смены старого и нового содержимого (`mode` у Transition): `out-in` — сначала исчезает старое.
	 * Имеет значение, когда `show` переключают, пока ещё идёт анимация.
	 */
	mode?: (typeof ANIMATION_MODES)[number]
	/** Режим списка (TransitionGroup): каждый дочерний элемент анимируется отдельно и должен иметь `key`. */
	isGroup?: boolean
	/** Тег контейнера списка в режиме `isGroup`: `div`, `ul`, `ol`… */
	tag?: string
	/**
	 * Классы частей обёртки (`root`, `inner`) — добавляются к классам кита. Своего вида у обёртки нет, поэтому токенов
	 * `--rise-animation-*` нет: движение настраивают общие токены `--rise-duration*`, `--rise-ease*`, `--rise-motion-*`.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseAnimation: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseAnimation name="collapse" :show="isOpen" :ui="{ root: 'my-panel', inner: 'my-panel-inner' }">…</BaseAnimation>
	 */
	ui?: UiProp<BaseAnimationPart>
}

export interface BaseAnimationEmits {
	/** Анимация появления завершилась (в режиме `isGroup` — для каждого элемента списка). */
	(event: 'after-enter'): void
	/** Анимация исчезновения завершилась (в режиме `isGroup` — для каждого элемента списка). */
	(event: 'after-leave'): void
}

export interface BaseAnimationSlots {
	/** Анимируемое содержимое; в режиме `isGroup` — элементы списка с `key`. */
	default?: () => unknown
}
