/** Утилиты: разметка schema.org в JSON-LD — слияние своих полей, проверка обязательных, безопасный вывод в `<script>` */
import { STRUCTURED_DATA_REQUIRED } from './types/structuredDataUtils.types'
import type { StructuredData, StructuredDataObject, StructuredDataValue } from './types/structuredDataUtils.types'

const SCHEMA_CONTEXT = 'https://schema.org'

const SCRIPT_ESCAPES: Readonly<Record<string, string>> = {
	'<': '\\u003c',
	'>': '\\u003e',
	'&': '\\u0026',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029',
}

function isStructuredObject(value: StructuredDataValue): value is StructuredDataObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmptyValue(value: StructuredDataValue): boolean {
	return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

/**
 * Свои поля поверх собранных: вложенные объекты сливаются, списки и значения заменяются,
 * `null` убирает поле, `undefined` оставляет собранное.
 */
export function mergeStructuredData<T extends StructuredDataObject>(base: T, overrides: StructuredDataObject = {}): T {
	const result: StructuredDataObject = { ...base }
	for (const [key, value] of Object.entries(overrides)) {
		const current = result[key]
		if (value === null) delete result[key]
		else if (isStructuredObject(value) && isStructuredObject(current)) result[key] = mergeStructuredData(current, value)
		else if (value !== undefined) result[key] = value
	}
	return result as T
}

function collect(values: StructuredDataValue[], segment: string): StructuredDataValue[] {
	const name = segment.replace(/\[]$/, '')
	const found = values.map(value => (isStructuredObject(value) ? value[name] : undefined))
	if (!segment.endsWith('[]')) return found
	return found.flatMap(value => (Array.isArray(value) && value.length ? value : [undefined]))
}

function hasPath(data: StructuredDataObject, path: string): boolean {
	const values = path.split('.').reduce<StructuredDataValue[]>(collect, [data])
	return values.every(value => !isEmptyValue(value))
}

function missingOwnFields(data: StructuredDataObject): string[] {
	const required: readonly string[] = Reflect.get(STRUCTURED_DATA_REQUIRED, String(data['@type'])) ?? []
	return required.filter(rule => !rule.split('|').some(path => hasPath(data, path)))
}

function collectTyped(value: StructuredDataValue, path: string, found: [string, StructuredDataObject][]): void {
	if (Array.isArray(value)) value.forEach(item => collectTyped(item, `${path}[]`, found))
	if (!isStructuredObject(value)) return
	if (path && typeof value['@type'] === 'string') found.push([path, value])
	for (const [key, item] of Object.entries(value)) collectTyped(item, path ? `${path}.${key}` : key, found)
}

/**
 * Обязательные поля, которых нет в разметке, — по `STRUCTURED_DATA_REQUIRED` для её `@type` и для вложенных объектов
 * знакомых типов (`comment[].author.name`). Незнакомый тип не проверяется.
 */
export function findMissingFields(data: StructuredData): string[] {
	const nested: [string, StructuredDataObject][] = []
	collectTyped(data, '', nested)
	const missing = nested.flatMap(([path, item]) => missingOwnFields(item).map(rule => `${path}.${rule}`))
	return [...new Set([...missingOwnFields(data), ...missing])]
}

/**
 * JSON-LD для `<script type="application/ld+json">`: `@context` первым полем, `<`, `>`, `&` и разделители строк
 * заменены юникод-эскейпами — строка `</script>` в данных не закроет тег, JSON остаётся валидным.
 */
export function serializeJsonLd(data: StructuredData): string {
	const json = JSON.stringify({ '@context': SCHEMA_CONTEXT, ...data })
	return json.replace(/[<>&\u2028\u2029]/g, char => SCRIPT_ESCAPES[char]!)
}

/** Абсолютный адрес для разметки: относительный путь дополняется адресом сайта, без него и при ошибке остаётся как есть */
export function resolveStructuredUrl(value: string | undefined, baseUrl?: string): string | undefined {
	if (!value || !baseUrl) return value || undefined
	try {
		return new URL(value, baseUrl).href
	} catch {
		return value
	}
}

/** Сборка для разработки: `process.env.NODE_ENV` заменяет сборщик приложения, без сборщика — считается боевой */
export function isDevelopmentBuild(): boolean {
	try {
		return process.env.NODE_ENV !== 'production'
	} catch {
		return false
	}
}
