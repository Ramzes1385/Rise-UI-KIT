/** Элемент хлебных крошек для Schema.org */
interface SchemaBreadcrumbItem {
	/** Название элемента */
	label: string
	/** URL (to или href) */
	to?: string
	href?: string
}

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

	return JSON.stringify(schema)
}

export { buildBreadcrumbsSchema }
export type { SchemaBreadcrumbItem }
