import type { StorySourceContext } from '../types/helpers.types'

const modules = import.meta.glob<Record<string, unknown>>(['/src/components/*/stories/*.stories.ts', '/src/stories/*/*/*.stories.ts'], {
	eager: true,
})

const sourceOf = (value: unknown): unknown =>
	(value as { parameters?: { docs?: { source?: unknown } } } | undefined)?.parameters?.docs?.source

const argsOf = (value: unknown): Record<string, unknown> => (value as { args?: Record<string, unknown> } | undefined)?.args ?? {}

function showCode(meta: unknown, story: unknown): string | undefined {
	const source = (sourceOf(story) ?? sourceOf(meta)) as
		{ code?: string; transform?: (code: string, context: StorySourceContext) => string } | undefined
	if (source?.transform)
		return source.transform('', { args: { ...argsOf(meta), ...argsOf(story) }, component: (meta as { component?: unknown }).component })
	return source?.code
}

function duplicates(code: string): string[] {
	return code.split(/<!-- \w+\.vue -->/).flatMap(file => {
		const names = [...file.matchAll(/^\s*(?:const|let|function)\s+([\w$]+)/gm)].map(match => match[1])
		return [...new Set(names.filter((name, index) => names.indexOf(name) !== index))]
	})
}

function problems(file: string, exports: Record<string, unknown>): string[] {
	const meta = exports.default
	return Object.entries(exports)
		.filter(([name, story]) => name !== 'default' && typeof story === 'object' && story !== null)
		.flatMap(([name, story]) => {
			const repeated = duplicates(showCode(meta, story) ?? '')
			return repeated.length ? [`${file} ${name}: ${repeated.join(', ')}`] : []
		})
}

describe('«Show code» всех историй', () => {
	it('истории найдены', () => {
		expect(Object.keys(modules).length).toBeGreaterThan(100)
	})

	it('код не объявляет одно имя дважды', () => {
		expect(Object.entries(modules).flatMap(([file, exports]) => problems(file, exports))).toEqual([])
	})
})
