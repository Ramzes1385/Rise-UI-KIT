import { zhBase } from './base'
import { zhChat } from './chat'
import { zhData } from './data'
import { zhForms } from './forms'
import { zhMedia } from './media'
import { zhPlural } from './plural'
import { zhCard } from './components/card'
import { zhNotices } from './components/notices'
import { zhGantt } from './components/data/gantt'
import { zhMapEditor } from './components/mapEditor'
import { zhRoadmap } from './components/data/roadmap'
import { zhImageMap3d } from './components/imageMap3d'
import { zhTranscript } from './components/transcript'
import type { UiKitLocale } from '../types/locales.types'
import { zhPresentation } from './components/presentation'
import { zhFormWizard } from './components/form/formWizard'
import { zhEventCalendar } from './components/eventCalendar'
import { zhFileManager } from './components/data/fileManager'
import { zhDashboardGrid } from './components/layout/dashboardGrid'

/** Китайский упрощённый словарь кита. Ключи и места для значений — как в русском (`ru/`) */
export const zh: UiKitLocale = {
	code: 'zh',
	intl: 'zh-CN',
	firstDayOfWeek: 1,
	...zhBase,
	...zhForms,
	...zhCard,
	...zhMedia,
	...zhPresentation,
	...zhMapEditor,
	...zhImageMap3d,
	...zhChat,
	...zhData,
	...zhEventCalendar,
	...zhTranscript,
	...zhNotices,
	...zhDashboardGrid,
	...zhGantt,
	...zhFileManager,
	...zhFormWizard,
	...zhRoadmap,
	plural: zhPlural,
}
