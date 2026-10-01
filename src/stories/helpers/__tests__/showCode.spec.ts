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

const DECLARATION = /^\s*(?:(?:const|let|var)\s+(\{[^}]*\}|\[[^\]]*\]|[\w$]+)|(?:async\s+)?function\s*\*?\s*([\w$]+))/gm

function patternNames(pattern: string): string[] {
	if (!/^[{[]/.test(pattern)) return [pattern]
	return pattern
		.slice(1, -1)
		.split(',')
		.map(
			part =>
				/([\w$]+)\s*(?:=[^,]*)?$/.exec(
					part
						.replace(/^\s*\.\.\./, '')
						.split(':')
						.pop() ?? '',
				)?.[1],
		)
		.filter((name): name is string => Boolean(name))
}

function declaredNames(file: string): string[] {
	return [...file.matchAll(DECLARATION)].flatMap(match => (match[2] ? [match[2]] : patternNames(match[1])))
}

function duplicates(code: string): string[] {
	return code.split(/<!-- \w+\.vue -->/).flatMap(file => {
		const names = declaredNames(file)
		return [...new Set(names.filter((name, index) => names.indexOf(name) !== index))]
	})
}

const storyCodes = (exports: Record<string, unknown>): string[] =>
	Object.entries(exports)
		.filter(([name, story]) => name !== 'default' && typeof story === 'object' && story !== null)
		.map(([, story]) => showCode(exports.default, story) ?? '')

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

	it('код есть у историй', () => {
		expect(
			Object.values(modules)
				.flatMap(storyCodes)
				.filter(code => code.trim()).length,
		).toBeGreaterThan(0)
	})

	it('повтор находится в var, function и деструктуризации', () => {
		expect(duplicates('var a = 1\nvar a = 2')).toEqual(['a'])
		expect(duplicates('const { a, b: c, ...d } = x\nlet [e, f = 1] = y\nconst c = 1\nfunction d() {}\nasync function f() {}')).toEqual([
			'c',
			'd',
			'f',
		])
		expect(duplicates('<!-- A.vue -->\nconst a = 1\n<!-- B.vue -->\nconst { a } = x')).toEqual([])
	})

	it('код не объявляет одно имя дважды', () => {
		expect(Object.entries(modules).flatMap(([file, exports]) => problems(file, exports))).toEqual([])
	})
})
