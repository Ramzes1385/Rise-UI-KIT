import type { Ref } from 'vue'

/** Состояния полосы загрузки */
export const LOADING_BAR_STATUSES = ['idle', 'loading', 'done', 'error'] as const

/**
 * Состояние полосы: `idle` — скрыта, `loading` — идёт загрузка, `done` — загрузка завершена и полоса исчезает,
 * `error` — загрузка не удалась и полоса исчезает в цвете ошибки
 */
export type LoadingBarStatus = (typeof LOADING_BAR_STATUSES)[number]

/** Хранилище полосы загрузки: одно на страницу, его показывает BaseApp */
export interface LoadingBarStore {
	/** Состояние полосы */
	status: Readonly<Ref<LoadingBarStatus>>
	/** Заполнение полосы от 0 до 1. Оценочное: настоящий ход загрузки браузер не сообщает */
	progress: Readonly<Ref<number>>
	/** Начать загрузку. Повторный вызов во время загрузки ничего не меняет */
	start: () => void
	/** Завершить загрузку: полоса заполняется и исчезает. Без начатой загрузки ничего не делает */
	finish: () => void
	/** Загрузка не удалась: полоса заполняется в цвете ошибки и исчезает. Без начатой загрузки ничего не делает */
	error: () => void
	/** Сбросить полосу сразу, без завершения: для тестов и смены страницы */
	reset: () => void
}

/** Что возвращает `useLoadingBar()` */
export interface UseLoadingBarReturn extends Omit<LoadingBarStore, 'reset'> {
	/** Идёт загрузка (`status === 'loading'`): например, для `aria-busy` у основной области страницы */
	isLoading: Readonly<Ref<boolean>>
}
