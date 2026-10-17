import { uzBase } from './base'
import { uzChat } from './chat'
import { uzData } from './data'
import { uzForms } from './forms'
import { uzMedia } from './media'
import { uzPlural } from './plural'
import { uzCalendar } from './calendar'
import { uzCard } from './components/card'
import { uzNotices } from './components/notices'
import { uzGantt } from './components/data/gantt'
import { uzMapEditor } from './components/mapEditor'
import { uzRoadmap } from './components/data/roadmap'
import { uzImageMap3d } from './components/imageMap3d'
import { uzTranscript } from './components/transcript'
import type { UiKitLocale } from '../types/locales.types'
import { uzPresentation } from './components/presentation'
import { uzFormWizard } from './components/form/formWizard'
import { uzEventCalendar } from './components/eventCalendar'
import { uzFileManager } from './components/data/fileManager'
import { uzDashboardGrid } from './components/layout/dashboardGrid'

/** Oʻzbek tili lugʻati (lotin yozuvi). Kalitlar va `{name}` oʻrinlari rus lugʻatidagidek (`ru/`) */
export const uz: UiKitLocale = {
	code: 'uz',
	intl: 'uz-Latn-UZ',
	firstDayOfWeek: 1,
	...uzBase,
	...uzCalendar,
	...uzForms,
	...uzCard,
	...uzMedia,
	...uzPresentation,
	...uzMapEditor,
	...uzImageMap3d,
	...uzChat,
	...uzData,
	...uzEventCalendar,
	...uzTranscript,
	...uzNotices,
	...uzDashboardGrid,
	...uzGantt,
	...uzFileManager,
	...uzFormWizard,
	...uzRoadmap,
	plural: uzPlural,
}
