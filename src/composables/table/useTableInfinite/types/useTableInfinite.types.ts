import type { Ref } from 'vue'

export interface UseTableInfiniteOptions {
	/** Метка в конце списка: попадание в видимую область означает «пора подгружать» */
	sentinelRef: Ref<HTMLElement | null>
	/** Прокручиваемая обёртка таблицы: корень наблюдателя, когда у таблицы задана высота */
	rootRef: Ref<HTMLElement | null>
	/** Подгрузка прокруткой включена (`loadMode: 'infinite'`) */
	isActive: () => boolean
	/** Прокручивается обёртка (задан `height`): корень — она, иначе — окно браузера */
	hasOwnScroll: () => boolean
	/** Запас до конца списка, px: подгрузка начинается заранее */
	distance: number
	/** Конец списка в видимой области */
	onReach: () => void
	/** Значение, изменение которого заново проверяет метку: число показанных строк. Так список, не заполнивший область, дополняется */
	rearm: () => unknown
}

export interface UseTableInfiniteReturn {
	/** Наблюдатель работает: прокрутку обёртки слушать не нужно. Без IntersectionObserver (SSR, старый браузер) — `false` */
	isObserving: Ref<boolean>
}
