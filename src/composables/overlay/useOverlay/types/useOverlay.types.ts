import type { Component, Ref } from 'vue'

/** Props оверлея: передаются в компонент как есть, кроме `isOpen`, которым управляет хранилище */
export type OverlayProps = Record<string, unknown>

/** Оверлей в хранилище BaseApp */
export interface OverlayEntry {
	id: number
	component: Component
	props: OverlayProps
	isOpen: boolean
	/** Удалить компонент из DOM после закрытия (после анимации) */
	destroyOnClose: boolean
}

export interface OverlayCreateOptions {
	/** Начальные props компонента */
	props?: OverlayProps
	/** Удалять компонент после закрытия, чтобы при следующем открытии он создавался заново. По умолчанию true */
	destroyOnClose?: boolean
}

export interface OverlayHandle<TResult = unknown> {
	/** Открыт ли оверлей сейчас */
	readonly isOpen: boolean
	/**
	 * Открывает оверлей, дополняя props. Промис разрешается результатом закрытия: значением из события `close`
	 * компонента или из `handle.close(value)`; при закрытии без результата — undefined
	 */
	open: (props?: OverlayProps) => Promise<TResult | undefined>
	/** Закрывает оверлей с результатом */
	close: (result?: TResult) => void
	/** Меняет props открытого оверлея */
	patch: (props: OverlayProps) => void
	/** Удаляет компонент из DOM сразу */
	destroy: () => void
}

/** Хранилище оверлеев одного BaseApp */
export interface OverlayStore {
	entries: Ref<OverlayEntry[]>
	/** Добавляет оверлей (закрытым) и возвращает его id */
	register: (component: Component, options: Required<OverlayCreateOptions>) => number
	/** Открывает оверлей: промис разрешается при закрытии */
	open: <TResult>(id: number, props?: OverlayProps) => Promise<TResult | undefined>
	/** Закрывает оверлей. Повторное закрытие ничего не меняет: побеждает первый результат */
	close: (id: number, result?: unknown) => void
	patch: (id: number, props: OverlayProps) => void
	/** Удаляет оверлей из DOM, если он закрыт (после анимации закрытия) */
	destroyIfClosed: (id: number) => void
	destroy: (id: number) => void
	closeAll: () => void
	isOpen: (id: number) => boolean
}

export interface UseOverlayReturn {
	/**
	 * Создаёт управляемый оверлей из компонента. Компонент получает props и `isOpen`,
	 * закрывается событием `update:isOpen` (false) или `close` (с результатом или без)
	 */
	create: <TResult = unknown>(component: Component, options?: OverlayCreateOptions) => OverlayHandle<TResult>
	/** Закрывает все открытые оверлеи */
	closeAll: () => void
}
