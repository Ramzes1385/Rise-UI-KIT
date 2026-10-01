/** Composable: SEO-разметка schema.org компонента — JSON-LD из пропсов и своих полей, проверка обязательных полей в разработке */

import { warn } from '@/locales/warn'
import { computed, watch } from 'vue'
import { UI_WARNINGS } from '@/locales/messages'
import type { StructuredData } from '@utils/seo/structuredDataUtils'
import type { SeoOptions, SeoProp, StructuredDataBuilder } from './types/useStructuredData.types'
import {
	findMissingFields,
	isDevelopmentBuild,
	mergeStructuredData,
	resolveStructuredUrl,
	serializeJsonLd,
} from '@utils/seo/structuredDataUtils'

function resolveOptions(seo: SeoProp | undefined): SeoOptions | null {
	if (!seo) return null
	return seo === true ? {} : seo
}

function compose(options: SeoOptions, build: StructuredDataBuilder): StructuredData | null {
	const data = build({ url: value => resolveStructuredUrl(value, options.baseUrl) })
	return data && mergeStructuredData(data, options.data)
}

/**
 * Разметка компонента: `structuredData` — строка JSON-LD для `<script type="application/ld+json">`, пустая, когда SEO выключено.
 * `component` — имя в предупреждении, `getSeo` — проп `seo`, `build` — поля schema.org из пропсов.
 */
export function useStructuredData(component: string, getSeo: () => SeoProp | undefined, build: StructuredDataBuilder) {
	const data = computed(() => {
		const options = resolveOptions(getSeo())
		return options && compose(options, build)
	})
	const missing = computed(() => (data.value ? findMissingFields(data.value).join(', ') : ''))

	watch(
		missing,
		fields => {
			if (fields && isDevelopmentBuild()) warn(UI_WARNINGS.SEO_MISSING_FIELDS, { component, type: data.value!['@type'], fields })
		},
		{ immediate: true },
	)

	return {
		structuredData: computed(() => (data.value ? serializeJsonLd(data.value) : '')),
	}
}
