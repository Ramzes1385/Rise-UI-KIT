function locate(lengths: readonly number[], index: number): { section: number; position: number; offset: number } {
	let offset = 0
	let section = 0
	while (section < lengths.length - 1 && index >= offset + lengths[section]) {
		offset += lengths[section]
		section += 1
	}
	return { section, position: index - offset, offset }
}

function moveDown(lengths: readonly number[], index: number, columns: number): number {
	const { section, position, offset } = locate(lengths, index)
	const length = lengths[section]
	if (position + columns < length) return index + columns
	if (Math.floor(position / columns) < Math.floor((length - 1) / columns)) return offset + length - 1
	if (section + 1 >= lengths.length) return index
	return offset + length + Math.min(position % columns, lengths[section + 1] - 1)
}

function moveUp(lengths: readonly number[], index: number, columns: number): number {
	const { section, position, offset } = locate(lengths, index)
	if (position >= columns) return index - columns
	if (section === 0) return index
	const previous = lengths[section - 1]
	const lastRowStart = Math.floor((previous - 1) / columns) * columns
	return offset - previous + Math.min(lastRowStart + position, previous - 1)
}

export function nextEmojiIndex(key: string, index: number, layout: { lengths: readonly number[]; columns: number }): number | null {
	const total = layout.lengths.reduce((sum, length) => sum + length, 0)
	const moves: Record<string, () => number> = {
		ArrowRight: () => Math.min(total - 1, index + 1),
		ArrowLeft: () => Math.max(0, index - 1),
		ArrowDown: () => moveDown(layout.lengths, index, layout.columns),
		ArrowUp: () => moveUp(layout.lengths, index, layout.columns),
		Home: () => 0,
		End: () => total - 1,
	}
	return total > 0 && key in moves ? moves[key]() : null
}
