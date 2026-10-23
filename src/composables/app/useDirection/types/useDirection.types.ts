import type { ComputedRef, Ref } from 'vue'

/** Направление компонента и функция пересчёта */
export interface UseDirectionReturn {
	/** Компонент пишется справа налево; до монтирования — `false` */
	isRtl: Readonly<Ref<boolean>>
	/** 1 в LTR, −1 в RTL */
	sign: ComputedRef<1 | -1>
	/** Прочитать направление заново (после смены `dir` на странице) */
	update: () => void
}
