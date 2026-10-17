/** Утилиты: стили ползунков, меток и сегментов заполнения range-слайдера по процентам трека */

/** Описание: позиция ползунка или метки на треке; у вертикального трека — от низа, у горизонтального — от начала строки (справа в RTL) */
function positionStyle(percentValue: number, isVertical: boolean | undefined): Record<string, string> {
	if (isVertical) return { bottom: `${percentValue}%` }
	return { insetInlineStart: `${percentValue}%` }
}

/** Описание: сегмент заполнения между двумя точками трека, в процентах; порядок точек не важен */
function fillSegmentStyle(fromPercent: number, toPercentValue: number, isVertical: boolean | undefined): Record<string, string> {
	const start = Math.min(fromPercent, toPercentValue)
	const size = Math.abs(toPercentValue - fromPercent)
	if (isVertical) return { bottom: `${start}%`, height: `${size}%` }
	return { insetInlineStart: `${start}%`, width: `${size}%` }
}

/** Описание: сегменты заполнения: у одиночного значения — от начала трека, иначе — между соседними точками */
function buildFillSegments(percents: number[], isSingle: boolean, isVertical: boolean | undefined): Record<string, string>[] {
	if (isSingle) return [fillSegmentStyle(0, percents[0], isVertical)]
	return percents.slice(0, -1).map((fromPercent, i) => fillSegmentStyle(fromPercent, percents[i + 1], isVertical))
}

export { buildFillSegments, positionStyle }
