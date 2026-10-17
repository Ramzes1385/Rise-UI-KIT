import { jaBase } from './base'
import { jaChat } from './chat'
import { jaData } from './data'
import { jaForms } from './forms'
import { jaMedia } from './media'
import { jaPlural } from './plural'
import { jaCard } from './components/card'
import { jaNotices } from './components/notices'
import { jaGantt } from './components/data/gantt'
import { jaMapEditor } from './components/mapEditor'
import { jaRoadmap } from './components/data/roadmap'
import { jaImageMap3d } from './components/imageMap3d'
import { jaTranscript } from './components/transcript'
import type { UiKitLocale } from '../types/locales.types'
import { jaPresentation } from './components/presentation'
import { jaFormWizard } from './components/form/formWizard'
import { jaEventCalendar } from './components/eventCalendar'
import { jaFileManager } from './components/data/fileManager'
import { jaDashboardGrid } from './components/layout/dashboardGrid'

/** Японский словарь кита. Ключи и места для значений — как в русском (`ru/`) */
export const ja: UiKitLocale = {
	code: 'ja',
	intl: 'ja-JP',
	firstDayOfWeek: 0,
	...jaBase,
	...jaForms,
	...jaCard,
	...jaMedia,
	...jaPresentation,
	...jaMapEditor,
	...jaImageMap3d,
	...jaChat,
	...jaData,
	...jaEventCalendar,
	...jaTranscript,
	...jaNotices,
	...jaDashboardGrid,
	...jaGantt,
	...jaFileManager,
	...jaFormWizard,
	...jaRoadmap,
	plural: jaPlural,
}
