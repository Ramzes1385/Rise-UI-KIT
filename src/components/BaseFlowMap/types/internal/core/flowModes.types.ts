import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { FlowEditing } from '../edit/flowEditApi.types'
import type { BaseFlowMapProps } from '../../BaseFlowMap.types'
import type { FlowReviewState } from '../review/reviewState.types'
import type { FlowModelInternal } from './flowRenderInternal.types'
import type { FlowMapContext, FlowModelProps } from '../flowModel.types'

/** Что нужно загрузчику «Правки»: модель, контекст карты, корень и пропсы */
export interface FlowEditLoaderParts {
	/** Модель карты */
	model: FlowModelInternal
	/** Контекст карты */
	map: FlowMapContext
	/** Корневой элемент карты */
	element: Readonly<Ref<HTMLElement | null>>
	/** Пропсы карты */
	props: Pick<BaseFlowMapProps, 'savedAt'>
	/** Догрузить интерфейс «Правки» вместе с моделью: вид меняется целиком */
	preload?: () => Promise<unknown>
}

/** Что нужно загрузчику «Правок» */
export interface FlowReviewLoaderParts {
	/** Модель карты */
	model: FlowModelInternal
	/** Пропсы карты */
	props: FlowModelProps
	/** Сообщить в live-регион */
	announce: (text: string) => void
	/** Догрузить интерфейс «Правок» вместе с моделью */
	preload?: () => Promise<unknown>
}

/** Ленивая часть режима: создаётся один раз по первому запросу, в области компонента */
export interface FlowModeLoader<State> {
	/** Созданная часть; null — ещё не загружена */
	part: ShallowRef<State | null>
	/** Часть загружена и создана */
	isLoaded: ComputedRef<boolean>
	/** Загрузить часть (повторный вызов — тот же `import()`) */
	load: () => Promise<State | null>
}

/** Загрузчик «Правки» */
export type FlowEditLoader = FlowModeLoader<FlowEditing>

/** Загрузчик «Правок» */
export type FlowReviewLoader = FlowModeLoader<FlowReviewState>

/** Лёгкое состояние режимов в ядре: признаки включаются, когда ленивая часть загружена */
export interface FlowModesState {
	/** «Правка» включена и загружена */
	isEditing: ComputedRef<boolean>
	/** «Правки» включены и загружены */
	isReviewing: ComputedRef<boolean>
	/** Сетка правки включена (до загрузки правки — да) */
	isGridOn: ComputedRef<boolean>
	/** Код «Правки» загружен: её слои и панели можно показывать */
	isEditLoaded: ComputedRef<boolean>
	/** Код «Правок» загружен */
	isReviewLoaded: ComputedRef<boolean>
}
