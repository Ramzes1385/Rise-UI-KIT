import type { StructuredData, StructuredDataObject } from '@utils/seo/structuredDataUtils'

/** Настройки SEO-разметки компонента */
export interface SeoOptions {
	/**
	 * Свои поля schema.org поверх собранных из пропсов (кастомное SEO): вложенные объекты сливаются,
	 * списки и значения заменяются, `null` убирает поле. `@type` можно заменить на подтип (`Organization` → `LocalBusiness`).
	 */
	data?: StructuredDataObject
	/** Адрес сайта для относительных ссылок в разметке: `/catalog` → `https://example.com/catalog` */
	baseUrl?: string
}

/** SEO-разметка: `true` — собрать из пропсов, объект — собрать и дополнить своими полями, `false` — не выводить */
export type SeoProp = boolean | SeoOptions

/** Проп SEO-разметки у компонентов кита */
export interface SeoComponentProps {
	/**
	 * Разметка schema.org в JSON-LD для поисковых систем (Google, Яндекс): `<script type="application/ld+json">`
	 * внутри компонента. `true` — поля из пропсов, объект — ещё и свои поля (`data`) и адрес сайта (`baseUrl`).
	 * По умолчанию выключена. В разработке нехватка обязательных полей — предупреждение в консоли.
	 */
	seo?: SeoProp
}

/** Что получает сборщик разметки компонента */
export interface StructuredDataContext {
	/** Абсолютный адрес с учётом `baseUrl` */
	url: (value?: string) => string | undefined
}

/** Сборщик разметки из пропсов: `null` — описывать нечего, разметка не выводится */
export type StructuredDataBuilder = (context: StructuredDataContext) => StructuredData | null
