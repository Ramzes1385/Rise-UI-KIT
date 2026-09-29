/** Код для «Show code» из шаблона story: без пустой первой строки и общего отступа. */

export function templateSource(template: string): string {
	const lines = template
		.replace(/^\s*\n/, '')
		.trimEnd()
		.split('\n')
	const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.length - line.trimStart().length))
	return lines.map(line => line.slice(indent)).join('\n')
}
