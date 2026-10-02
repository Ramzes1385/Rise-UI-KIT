import { enBase } from './base'
import { enCard } from './card'
import { enChat } from './chat'
import { enData } from './data'
import { enForms } from './forms'
import { enMedia } from './media'
import { enPlural } from './plural'
import { enMapEditor } from './mapEditor'
import { enPresentation } from './presentation'
import { enEventCalendar } from './eventCalendar'
import type { UiKitLocale } from '../types/locales.types'

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
	plural: enPlural,
}
