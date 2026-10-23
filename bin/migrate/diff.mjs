/** Унифицированный diff без зависимостей: общие начало и конец отрезаются, середина сравнивается по LCS. */

const MAX_CELLS = 4_000_000

function diffMiddle(a, b) {
	if (!a.length) return b.map(line => ['+', line])
	if (!b.length) return a.map(line => ['-', line])
	if (a.length * b.length > MAX_CELLS) return [...a.map(line => ['-', line]), ...b.map(line => ['+', line])]
	const n = a.length
	const m = b.length
	const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
	}
	const ops = []
	let i = 0
	let j = 0
	while (i < n && j < m) {
		if (a[i] === b[j]) {
			ops.push([' ', a[i]])
			i++
			j++
		} else if (table[i + 1][j] >= table[i][j + 1]) {
			ops.push(['-', a[i++]])
		} else {
			ops.push(['+', b[j++]])
		}
	}
	while (i < n) ops.push(['-', a[i++]])
	while (j < m) ops.push(['+', b[j++]])
	return ops
}

/** Diff двух текстов в формате unified (контекст — 3 строки). Пустая строка, если тексты равны. */
export function unifiedDiff(name, before, after, context = 3) {
	if (before === after) return ''
	const a = before.split('\n').map(l => l.replace(/\r$/, ''))
	const b = after.split('\n').map(l => l.replace(/\r$/, ''))
	let head = 0
	while (head < a.length && head < b.length && a[head] === b[head]) head++
	let tail = 0
	while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++
	const ops = [
		...a.slice(0, head).map(line => [' ', line]),
		...diffMiddle(a.slice(head, a.length - tail), b.slice(head, b.length - tail)),
		...a.slice(a.length - tail).map(line => [' ', line]),
	]
	const starts = []
	let aLine = 1
	let bLine = 1
	for (const [type] of ops) {
		starts.push([aLine, bLine])
		if (type !== '+') aLine++
		if (type !== '-') bLine++
	}
	const changed = ops.flatMap(([type], index) => (type === ' ' ? [] : [index]))
	const ranges = []
	for (const index of changed) {
		const from = Math.max(0, index - context)
		const to = Math.min(ops.length, index + context + 1)
		const last = ranges[ranges.length - 1]
		if (last && from <= last[1]) last[1] = to
		else ranges.push([from, to])
	}
	const out = [`--- a/${name}`, `+++ b/${name}`]
	for (const [from, to] of ranges) {
		const slice = ops.slice(from, to)
		const aCount = slice.filter(([t]) => t !== '+').length
		const bCount = slice.filter(([t]) => t !== '-').length
		out.push(`@@ -${starts[from][0]},${aCount} +${starts[from][1]},${bCount} @@`)
		for (const [type, line] of slice) out.push(type + line)
	}
	return out.join('\n')
}
