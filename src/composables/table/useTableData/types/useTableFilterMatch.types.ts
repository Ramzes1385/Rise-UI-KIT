import type { FilterKind } from '@composables/table/useTableFilter/types/useTableFilter.types'

/** Промежуток значений, который занимает граница фильтра: число — точка, дата — сутки (номер дня) */
export type FilterSpan = [from: number, to: number]

/** Проверка значения ячейки относительно границы и верхней границы фильтра */
export type FilterCheck = (value: number, bound: FilterSpan, upper: FilterSpan) => boolean

/** Как сравнивать: тип значений (`number`, `date`…) и пояс для суток дат */
export interface OrderedMode {
	kind: FilterKind
	timeZone?: string
}
