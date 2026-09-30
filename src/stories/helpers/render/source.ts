/** Код для «Show code»: ровно то, что рисует превью истории, — её шаблон и текущие значения из Controls. */

import { STORY_STYLES } from './storyStyles'
import type { ShownAttribute, StorySourceContext, StorySourceOptions } from '../types/helpers.types'

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

/** Значение, которое получает компонент: подпись варианта из `mapping` в Controls → сам вариант */
function mappedValue(context: StorySourceContext, [name, value]: [string, unknown]): [string, unknown] {
	const mapping = context.argTypes?.[name]?.mapping
	return [name, mapping && typeof value === 'string' && value in mapping ? mapping[value] : value]
}

/** Пропсы из Controls, которые меняют пример: без слотов (`default` — всегда), обработчиков, пустых и значений по умолчанию */
function shownArgs(options: StorySourceOptions, context: StorySourceContext): [string, unknown][] {
	const slotNames = [...options.template.matchAll(/\{\{\s*slots\.(\w+)\s*\}\}/g)].map(match => match[1])
	const hidden = new Set(['default', ...(options.omit ?? []), ...Object.values(options.models ?? {}), ...slotNames])
	return Object.entries(context.args)
		.map(entry => mappedValue(context, entry))
		.filter(
			([name, value]) =>
				!hidden.has(name) &&
				value !== undefined &&
				typeof value !== 'function' &&
				context.argTypes?.[name]?.table?.category !== 'slots' &&
				!sameValue(defaultOf(context.component, name), value),
		)
}

/** Картинки data URI всегда уходят в константу: в теге их не прочитать */
const isDataUri = (value: unknown): boolean => typeof value === 'string' && value.startsWith('data:')

/** Пропс как атрибут тега; длинное значение и картинка data URI — через константу `hoist` */
function attribute([name, value]: [string, unknown]): ShownAttribute {
	const prop = kebab(name)
	if (value === true) return { name: prop, code: prop }
	const isInline = !isDataUri(value)
	if (isInline && typeof value === 'string' && !value.includes('\n'))
		return { name: prop, code: `${prop}="${value.replace(/"/g, '&quot;')}"` }
	const code = literal(value)
	if (isInline && code.length <= INLINE_LIMIT && !code.includes('\n'))
		return { name: prop, code: `:${prop}="${code.replace(/"/g, '&quot;')}"` }
	return { name: prop, code: `:${prop}="${name}"`, hoist: `const ${name} = ${code}` }
}

/** Части тега: имя, атрибуты (значения в кавычках — целиком) и закрывающая скобка */
const tokens = (text: string): string[] => text.match(/(?:[^\s"]+(?:"[^"]*")?)+/g) ?? []

/** Индекс `>`, которым заканчивается открывающий тег, — вне кавычек; нет его — длина текста */
function tagEndIndex(text: string): number {
	let quote = ''
	for (let index = 0; index < text.length; index++) {
		const char = text[index]
		if (quote) quote = char === quote ? '' : quote
		else if (char === '"') quote = char
		else if (char === '>') return index
	}
	return text.length
}

/** Конец открывающего тега в хвосте строки: атрибуты до `>` или `/>` и всё, что после (содержимое, закрывающий тег) */
function splitTagEnd(text: string): { rest: string[]; end: string } {
	const index = tagEndIndex(text)
	const start = index < text.length && text[index - 1] === '/' ? index - 1 : index
	return { rest: tokens(text.slice(0, start)), end: text.slice(start) }
}

const closeTag = (end: string): string => (end.startsWith('/') ? ` ${end}` : end)

/**
 * Тег с `v-bind="args"` в начале строки → пропсы: в строку, если помещаются, иначе по одному на строку; текст после
 * тега не разрывается. Строка не переносится, если атрибут один или перед тегом на строке есть другой тег.
 */
function expandLine(line: string, attributes: readonly string[]): string {
	const [, indent, before, after] = /^(\s*)(.*?)\s*v-bind="args"(.*)$/.exec(line) as RegExpExecArray
	const { rest, end } = splitTagEnd(after)
	const oneLine = `${indent}${[before, ...attributes, ...rest].filter(Boolean).join(' ')}${closeTag(end)}`
	const [tag, ...own] = tokens(before)
	const items = [...own, ...attributes, ...rest]
	if (oneLine.length <= LINE_LIMIT || items.length < 2 || before.lastIndexOf('<') > 0) return oneLine
	items.push(`${items.pop()}${closeTag(end)}`)
	return [`${indent}${tag}`, ...items.map(item => `${indent}\t${item}`)].join('\n')
}

const V_BIND = 'v-bind="args"'

/** Имена атрибутов, которые тег задаёт сам (`title`, `:title`, `v-model:open`): они перекрывают `v-bind="args"` */
function explicitNames(template: string, at: number): Set<string> {
	const start = template.lastIndexOf('<', at)
	const end = at + tagEndIndex(template.slice(at))
	const names = tokens(template.slice(start, end))
		.slice(1)
		.map(token => kebab(token.split('=')[0].replace(/^(:|v-bind:|v-model:)/, '')))
	return new Set(names)
}

/** Пропсы из Controls для тега, где стоит `v-bind="args"` (позиция `at` в шаблоне) */
function argsAt(template: string, at: number, attributes: readonly ShownAttribute[]): string[] {
	const explicit = explicitNames(template, at)
	return attributes.filter(item => !explicit.has(item.name)).map(item => item.code)
}

/** Строка шаблона с `v-bind="args"` → строки кода; `start` — позиция строки в шаблоне */
function expandArgsLine(
	template: string,
	{ line, start }: { line: string; start: number },
	attributes: readonly ShownAttribute[],
): string[] {
	const positions = [...line.matchAll(/v-bind="args"/g)].map(match => start + (match.index ?? 0))
	const trimmed = line.trim()
	if (trimmed === V_BIND) {
		const indent = line.slice(0, line.indexOf(V_BIND))
		return argsAt(template, positions[0], attributes).map(code => `${indent}${code}`)
	}
	if (positions.length === 1 && trimmed.startsWith('<')) return [expandLine(line, argsAt(template, positions[0], attributes))]
	let index = 0
	const expanded = line.replace(/ ?v-bind="args"/g, () => {
		const codes = argsAt(template, positions[index++], attributes)
		return codes.length ? ` ${codes.join(' ')}` : ''
	})
	return [expanded]
}

/** `v-bind="args"` в каждом теге → пропсы из Controls, кроме заданных тегом явно */
function expandArgs(template: string, attributes: readonly ShownAttribute[]): string {
	let start = 0
	return template
		.split('\n')
		.flatMap(line => {
			const lines = line.includes(V_BIND) ? expandArgsLine(template, { line, start }, attributes) : [line]
			start += line.length + 1
			return lines
		})
		.join('\n')
}

/** Правила классов-помощников историй, которые встречаются в шаблоне, — блоком `<style scoped>` */
function storyStyles(template: string): string {
	const used = [...template.matchAll(/\sclass="([^"]+)"/g)].flatMap(match => match[1].split(/\s+/))
	const rules = [...new Set(used)]
		.filter(name => name in STORY_STYLES)
		.map(
			name =>
				`.${name} {\n${STORY_STYLES[name]
					.split(/;\s*/)
					.filter(Boolean)
					.map(rule => `\t${rule};`)
					.join('\n')}\n}`,
		)
	return rules.length ? `\n\n<style scoped>\n${rules.join('\n\n')}\n</style>` : ''
}

const escapeText = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** `{{ slots.default }}` в шаблоне → текст слота из Controls: в коде он стоит прямо в теге */
const fillSlots = (template: string, args: Record<string, unknown>): string =>
	template.replace(/\{\{\s*slots\.(\w+)\s*\}\}/g, (_, name: string) => escapeText(String(args[name] ?? '')))

function buildSource(options: StorySourceOptions, context: StorySourceContext): string {
	const attributes = shownArgs(options, context).map(attribute)
	const template = expandArgs(fillSlots(templateSource(options.template), context.args), attributes)
	const hoisted = attributes.filter(item => item.hoist && template.includes(item.code)).map(item => item.hoist)
	const refs = [
		...Object.entries(options.models ?? {}).map(([name, arg]) => `const ${name} = ref(${literal(context.args[arg] ?? '')})`),
		...Object.entries(options.state ?? {}).map(([name, value]) => `const ${name} = ref(${literal(value)})`),
	]
	const vue = [...new Set([...(refs.length ? ['ref'] : []), ...(options.vue ?? [])])].sort()
	const imports = [
		...(vue.length ? [`import { ${vue.join(', ')} } from 'vue'`] : []),
		`import { ${[...options.imports].sort().join(', ')} } from '${PACKAGE}'`,
		...Object.entries(options.importsFrom ?? {}).map(([from, names]) => `import { ${[...names].sort().join(', ')} } from '${from}'`),
	]
	const script = [imports.join('\n'), [...refs, ...hoisted].join('\n'), templateSource(options.script ?? '')].filter(Boolean)
	const body = template
		.split('\n')
		.map(line => (line ? `\t${line}` : line))
		.join('\n')
	return `<script setup lang="ts">\n${script.join('\n\n')}\n</script>\n\n<template>\n${body}\n</template>${storyStyles(options.template)}`
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
