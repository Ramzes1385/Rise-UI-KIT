import { enBase } from './base'
import { enChat } from './chat'
import { enData } from './data'
import { enForms } from './forms'
import { enMedia } from './media'
import { enPlural } from './plural'
import { enCard } from './components/card'
import { enNotices } from './components/notices'
import { enGantt } from './components/data/gantt'
import { enMapEditor } from './components/mapEditor'
import { enImageMap3d } from './components/imageMap3d'
import { enTranscript } from './components/transcript'
import type { UiKitLocale } from '../types/locales.types'
import { enPresentation } from './components/presentation'
import { enFormWizard } from './components/form/formWizard'
import { enEventCalendar } from './components/eventCalendar'
import { enFileManager } from './components/data/fileManager'
import { enDashboardGrid } from './components/layout/dashboardGrid'

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
	...enImageMap3d,
	...enChat,
	...enData,
	...enEventCalendar,
	...enTranscript,
	...enNotices,
	...enDashboardGrid,
	...enGantt,
	...enFileManager,
	...enFormWizard,
	plural: enPlural,
}
