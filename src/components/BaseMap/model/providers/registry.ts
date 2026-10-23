import { UI_MAP } from '@/locales/messages'
import { createGoogleMap } from './googleMap'
import { createYandexMap } from './yandexMap'
import type { MapProvider } from '../../types/BaseMap.types'
import type { MapProviderEntry } from '../../types/providers.types'

export const MAP_PROVIDER_ENTRIES: Record<MapProvider, MapProviderEntry> = {
	yandex: { create: createYandexMap, language: intl => intl.replace('-', '_'), name: () => UI_MAP.YANDEX },
	google: {
		create: createGoogleMap,
		isMapIdRequired: true,
		language: intl => intl.split('-')[0],
		name: () => UI_MAP.GOOGLE,
	},
}
