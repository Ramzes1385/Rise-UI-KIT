/** Утилиты: генерация Schema.org JSON-LD разметки */

import type { SchemaBreadcrumbItem } from './schemaUtils.types'

/** Построить Schema.org JSON-LD для BreadcrumbList */
function buildBreadcrumbsSchema(items: SchemaBreadcrumbItem[]): string {
	const elements = items.map((item, index) => ({
		'@type': 'ListItem',
		position: index + 1,
		name: item.label,
		...(item.to ? { item: item.to } : {}),
		...(item.href ? { item: item.href } : {}),
	}))

	const schema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: elements,
	}

	return escapeJsonForScript(JSON.stringify(schema))
}

/**
 * Экранирует символы, способные «вырваться» из inline <script> при вставке через v-html.
 * JSON.stringify не экранирует `<`, поэтому строка вроде `</script>` в данных закрыла бы тег
 * и позволила инъекцию (XSS). Заменяем `<` и `>` на юникод-эскейпы — JSON остаётся валидным.
 */
function escapeJsonForScript(json: string): string {
	return json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
}

export { buildBreadcrumbsSchema }
