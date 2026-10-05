import { enBase } from './base'
import { enChat } from './chat'
import { enData } from './data'
import { enForms } from './forms'
import { enMedia } from './media'
import { enPlural } from './plural'
import { enCard } from './components/card'
import { enMapEditor } from './components/mapEditor'
import { enTranscript } from './components/transcript'
import type { UiKitLocale } from '../types/locales.types'
import { enPresentation } from './components/presentation'
import { enEventCalendar } from './components/eventCalendar'

/** Английский словарь кита. Ключи и места для значений — как в русском (`ru/`) */
export const en: UiKitLocale = {
	code: 'en',
	intl: 'en-US',
	firstDayOfWeek: 0,
	...enBase,
	...enForms,
	...enCard,
	...enMedia,
	...enPresentation,
	...enMapEditor,
	...enChat,
	...enData,
	...enEventCalendar,
	...enTranscript,
	plural: enPlural,
}
