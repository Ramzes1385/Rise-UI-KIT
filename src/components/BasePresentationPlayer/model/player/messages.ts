import type { UiKitLocale } from '@/locales'
import { useLocale } from '@composables/app/useLocale'

const { messages, formatMessage, formatNumber } = useLocale()

export const UI_PRESENTATION = new Proxy({} as Readonly<UiKitLocale['presentation']>, {
	get: (_, name) => (messages.value.presentation as unknown as Record<PropertyKey, unknown>)[name],
})

export { formatMessage, formatNumber }
