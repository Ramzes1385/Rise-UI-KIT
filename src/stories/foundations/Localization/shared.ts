import { defineLocale, en, ru } from '@/locales'
import { registerLocale } from '@/locales/state'
import { BaseButton } from '@components/BaseButton'
import { useLocale } from '@composables/app/useLocale'
import { BaseCalendar } from '@components/BaseCalendar'

export const TODAY = new Date(2025, 4, 15)

export const CALENDAR_COMPONENTS = { BaseButton, BaseCalendar }

export const BRAND = defineLocale(ru, { text: { EMPTY: 'Пока ничего нет', CANCEL: 'Не сейчас' }, aria: { CLOSE: 'Скрыть' } })

export const GERMAN = defineLocale(en, {
	code: 'de',
	intl: 'de-DE',
	firstDayOfWeek: 1,
	text: { EMPTY: 'Keine Daten', CANCEL: 'Abbrechen' },
	aria: { CLOSE: 'Schließen' },
})

export function ensureGerman(): void {
	registerLocale(GERMAN)
}

export function languageSetup() {
	const { locale, locales, setLocale } = useLocale()
	return { locale, locales, setLocale, today: TODAY }
}
