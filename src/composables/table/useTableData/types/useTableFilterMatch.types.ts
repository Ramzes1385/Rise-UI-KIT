/** Промежуток значений, который занимает граница фильтра: число — точка, дата — целые сутки (UTC) */
export type FilterSpan = [from: number, to: number]

/** Проверка значения ячейки относительно границы и верхней границы фильтра */
export type FilterCheck = (value: number, bound: FilterSpan, upper: FilterSpan) => boolean
