import type { UiKitLocale } from '@/locales'
import { useLocale } from '@composables/useLocale'

const { messages, formatMessage, formatNumber } = useLocale()

function section<K extends 'aria' | 'player' | 'text'>(key: K): Readonly<UiKitLocale[K]> {
	return new Proxy({} as Readonly<UiKitLocale[K]>, {
		get: (_, name) => (messages.value[key] as unknown as Record<PropertyKey, unknown>)[name],
	})
}

export const UI_PLAYER = section('player')

export const UI_TEXT = section('text')

export const UI_ARIA = section('aria')

export { formatMessage, formatNumber }
