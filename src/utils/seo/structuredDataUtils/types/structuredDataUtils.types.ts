/** Значение поля разметки schema.org: строка, число, флаг, вложенный объект или список */
export type StructuredDataValue = string | number | boolean | null | undefined | StructuredDataValue[] | StructuredDataObject

/** Объект разметки schema.org с произвольными полями */
export interface StructuredDataObject {
	[key: string]: StructuredDataValue
}

/** Разметка schema.org верхнего уровня: `@type` обязателен, `@context` добавляется при выводе */
export interface StructuredData extends StructuredDataObject {
	/** Тип schema.org: `BreadcrumbList`, `FAQPage`, `VideoObject`… */
	'@type': string
}

/**
 * Обязательные поля по типам schema.org — требования Google Rich Results и schema.org.
 * Путь через точку ведёт во вложенный объект, `[]` — в каждый элемент списка, `|` — достаточно одного из полей.
 */
export const STRUCTURED_DATA_REQUIRED = {
	BreadcrumbList: ['itemListElement', 'itemListElement[].position', 'itemListElement[].name'],
	FAQPage: ['mainEntity', 'mainEntity[].name', 'mainEntity[].acceptedAnswer.text'],
	AggregateRating: ['ratingValue', 'ratingCount|reviewCount', 'itemReviewed.name'],
	VideoObject: ['name', 'thumbnailUrl', 'uploadDate'],
	ImageObject: ['contentUrl', 'creator|creditText|copyrightNotice|license'],
	Person: ['name'],
	Organization: ['name'],
	Comment: ['text', 'author.name', 'datePublished'],
	Place: ['name'],
} as const satisfies Record<string, readonly string[]>

/** Тип schema.org, для которого кит знает обязательные поля */
export type StructuredDataType = keyof typeof STRUCTURED_DATA_REQUIRED
