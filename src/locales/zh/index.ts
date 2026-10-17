import { zhBase } from './base'
import { zhChat } from './chat'
import { zhData } from './data'
import { zhForms } from './forms'
import { zhMedia } from './media'
import { zhPlural } from './plural'
import { zhCard } from './components/card'
import { zhNotices } from './components/notices'
import { zhGantt } from './components/data/gantt'
import { zhFlowMap } from './components/flow/map'
import { zhMapEditor } from './components/mapEditor'
import { zhRoadmap } from './components/data/roadmap'
import { zhImageMap3d } from './components/imageMap3d'
import { zhTranscript } from './components/transcript'
import { zhFlowPanels } from './components/flow/panels'
import type { UiKitLocale } from '../types/locales.types'
import { zhPresentation } from './components/presentation'
import { zhFlowScenario } from './components/flow/scenario'
import { zhFormWizard } from './components/form/formWizard'
import { zhEventCalendar } from './components/eventCalendar'
import { zhFileManager } from './components/data/fileManager'
import { zhFlowDfd } from './components/flow/notations/process/dfd'
import { zhDashboardGrid } from './components/layout/dashboardGrid'
import { zhFlowBpmn } from './components/flow/notations/process/bpmn'
import { zhFlowIdef } from './components/flow/notations/process/idef'
import { zhFlowServices } from './components/flow/notations/architecture/services'

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
	...zhFlowMap,
	...zhFlowScenario,
	...zhFlowPanels,
	...zhFlowServices,
	...zhFlowBpmn,
	...zhFlowIdef,
	...zhFlowDfd,
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
