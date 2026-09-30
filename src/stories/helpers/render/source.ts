/** Код для «Show code»: ровно то, что рисует превью истории, — её шаблон и текущие значения из Controls. */

import type { StorySourceContext, StorySourceOptions } from '../types/helpers.types'

const PACKAGE = '@ramzes1385/rise-ui-kit'

/** Длиннее — значение уходит в константу `<script setup>`, чтобы тег оставался читаемым */
const INLINE_LIMIT = 40

/** Длиннее — пропсы тега переносятся по одному на строку */
const LINE_LIMIT = 90

const NO_DEFAULT = Symbol('no-default')

/** Код для «Show code» из шаблона story: без пустой первой строки и общего отступа. */
export function templateSource(template: string): string {
	const lines = template
		.replace(/^\s*\n/, '')
		.trimEnd()
		.split('\n')
	const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.length - line.trimStart().length))
	return lines.map(line => line.slice(indent)).join('\n')
}

const kebab = (name: string): string => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype

function scalar(value: unknown): string {
	if (value instanceof Date) return `new Date('${value.toISOString()}')`
	if (typeof value === 'string') {
		const text = value.startsWith('data:') && value.length > 80 ? `${value.slice(0, value.indexOf(',') + 1)}…` : value
		return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
	}
	return String(value)
}

/** Значение как код: объекты и массивы — литералами, длинные — в несколько строк */
export function literal(value: unknown, depth = 0): string {
	const isArray = Array.isArray(value)
	if (!isArray && !isPlainObject(value)) return scalar(value)
	const key = (name: string): string => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : `'${name}'`)
	const items = isArray
		? value.map(item => literal(item, depth + 1))
		: Object.entries(value).map(([name, item]) => `${key(name)}: ${literal(item, depth + 1)}`)
	const [open, close] = isArray ? ['[', ']'] : ['{ ', ' }']
	if (!items.length) return `${open.trim()}${close.trim()}`
	const inline = `${open}${items.join(', ')}${close}`
	if (inline.length <= LINE_LIMIT - depth * 4 && !inline.includes('\n')) return inline
	const pad = '\t'.repeat(depth + 1)
	return `${open.trim()}\n${items.map(item => `${pad}${item},`).join('\n')}\n${'\t'.repeat(depth)}${close.trim()}`
}

function defaultOf(component: unknown, name: string): unknown {
	const definition = (component as { props?: Record<string, unknown> } | undefined)?.props?.[name]
	if (!isPlainObject(definition) || !('default' in definition)) return NO_DEFAULT
	const value = definition.default
	return typeof value === 'function' && definition.type !== Function ? (value as (props: object) => unknown)({}) : value
}

const sameValue = (left: unknown, right: unknown): boolean => left === right || JSON.stringify(left) === JSON.stringify(right)

/** Пропсы из Controls, которые меняют пример: без слотов, обработчиков, пустых и значений по умолчанию */
function shownArgs(options: StorySourceOptions, context: StorySourceContext): [string, unknown][] {
	const hidden = new Set([...(options.omit ?? []), ...Object.values(options.models ?? {})])
	return Object.entries(context.args).filter(
		([name, value]) =>
			!hidden.has(name) &&
			value !== undefined &&
			typeof value !== 'function' &&
			context.argTypes?.[name]?.table?.category !== 'slots' &&
			!sameValue(defaultOf(context.component, name), value),
	)
}

function attribute([name, value]: [string, unknown], hoisted: string[]): string {
	if (value === true) return kebab(name)
	if (typeof value === 'string' && !value.includes('\n')) return `${kebab(name)}="${value.replace(/"/g, '&quot;')}"`
	const code = literal(value)
	if (code.length <= INLINE_LIMIT && !code.includes('\n')) return `:${kebab(name)}="${code.replace(/"/g, '&quot;')}"`
	hoisted.push(`const ${name} = ${literal(value)}`)
	return `:${kebab(name)}="${name}"`
}

/** `v-bind="args"` → пропсы: в строку, если помещаются, иначе по одному на строку */
/** Части тега: имя, атрибуты (значения в кавычках — целиком) и закрывающая скобка */
const tokens = (text: string): string[] => text.match(/(?:[^\s"]+(?:"[^"]*")?)+/g) ?? []

function expandLine(line: string, attributes: readonly string[]): string {
	const [, indent, before, after] = /^(\s*)(.*?)\s*v-bind="args"(.*)$/.exec(line) as RegExpExecArray
	const oneLine = [before, ...attributes, after.trim()].filter(Boolean).join(' ')
	if (`${indent}${oneLine}`.length <= LINE_LIMIT) return `${indent}${oneLine}`
	const [tag, ...own] = tokens(before)
	const items = [...own, ...attributes, ...tokens(after)]
	if (items.length > 1 && /^\/?>$/.test(items.at(-1) as string)) items.splice(-2, 2, `${items.at(-2)} ${items.at(-1)}`)
	return [`${indent}${tag}`, ...items.map(item => `${indent}\t${item}`)].join('\n')
}

function expandArgs(template: string, attributes: readonly string[]): string {
	return template
		.split('\n')
		.map(line => (line.includes('v-bind="args"') ? expandLine(line, attributes) : line))
		.join('\n')
}

function buildSource(options: StorySourceOptions, context: StorySourceContext): string {
	const hoisted: string[] = []
	const attributes = shownArgs(options, context).map(entry => attribute(entry, hoisted))
	const models = Object.entries(options.models ?? {}).map(([name, arg]) => `const ${name} = ref(${literal(context.args[arg] ?? '')})`)
	const imports = [
		...(models.length ? ["import { ref } from 'vue'"] : []),
		`import { ${[...options.imports].sort().join(', ')} } from '${PACKAGE}'`,
	]
	const script = [imports.join('\n'), [...models, ...hoisted].join('\n'), templateSource(options.script ?? '')].filter(Boolean)
	const template = expandArgs(templateSource(options.template), attributes)
		.split('\n')
		.map(line => (line ? `\t${line}` : line))
		.join('\n')
	return `<script setup lang="ts">\n${script.join('\n\n')}\n</script>\n\n<template>\n${template}\n</template>`
}

/**
 * Параметр `docs.source` истории со своим шаблоном: «Show code» показывает этот шаблон как файл Vue —
 * импорты из пакета, переменные `v-model` и данные шаблона, а `v-bind="args"` раскрыт в пропсы из Controls
 * (без значений по умолчанию). Код меняется вместе с Controls.
 *
 * @example
 * const template = `<div style="max-width: 360px"><BasePhoneInput v-bind="args" v-model="phone" /></div>`
 * parameters: { docs: { source: storySource({ template, imports: ['BasePhoneInput'], models: { phone: 'modelValue' } }) } }
 */
export function storySource(options: StorySourceOptions): { transform: (code: string, context: StorySourceContext) => string } {
	return { transform: (_code, context) => buildSource(options, context) }
}

/** То же для истории без Controls: код один и не зависит от args */
export function staticStorySource(options: StorySourceOptions): { code: string } {
	return { code: buildSource(options, { args: {} }) }
}
