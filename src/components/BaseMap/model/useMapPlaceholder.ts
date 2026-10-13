import { computed, type Ref } from 'vue'
import { UI_MAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { MAP_PROVIDER_ENTRIES } from './providers/registry'
import type { BaseMapProps, MapStatus } from '../types/BaseMap.types'

const PLACEHOLDER_TEXTS: Partial<
	Record<MapStatus, readonly ['NO_KEY_TITLE' | 'NO_MAP_ID_TITLE' | 'ERROR_TITLE', 'NO_KEY' | 'NO_MAP_ID' | 'ERROR']>
> = {
	'no-key': ['NO_KEY_TITLE', 'NO_KEY'],
	'no-map-id': ['NO_MAP_ID_TITLE', 'NO_MAP_ID'],
	error: ['ERROR_TITLE', 'ERROR'],
}

export function useMapPlaceholder(props: BaseMapProps, status: Ref<MapStatus>) {
	const isPreview = computed(
		() => Boolean(props.staticPreview) && (status.value === 'loading' || (status.value === 'no-key' && Boolean(props.apiKey))),
	)
	const providerName = computed(() => MAP_PROVIDER_ENTRIES[props.provider ?? 'yandex'].name())
	return {
		isPreview,
		isPlaceholder: computed(() => PLACEHOLDER_TEXTS[status.value] !== undefined && !isPreview.value),
		placeholderTitle: computed(() => UI_MAP[PLACEHOLDER_TEXTS[status.value]?.[0] ?? 'NO_KEY_TITLE']),
		placeholderText: computed(() =>
			formatMessage(UI_MAP[PLACEHOLDER_TEXTS[status.value]?.[1] ?? 'NO_KEY'], { provider: providerName.value }),
		),
	}
}
