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
import { zhModels3d } from './components/models3d'
import { zhScene3d } from './components/map/scene3d'
import { zhRoadmap } from './components/data/roadmap'
import { zhTranscript } from './components/transcript'
import { zhFlowEditor } from './components/flow/editor'
import { zhFlowPanels } from './components/flow/panels'
import { zhFlowReview } from './components/flow/review'
import { zhMapEditor } from './components/map/mapEditor'
import type { UiKitLocale } from '../types/locales.types'
import { zhRoadmap3d } from './components/data/roadmap3d'
import { zhImageMap3d } from './components/map/imageMap3d'
import { zhPresentation } from './components/presentation'
import { zhFlowScenario } from './components/flow/scenario'
import { zhFormWizard } from './components/form/formWizard'
import { zhEventCalendar } from './components/eventCalendar'
import { zhFileManager } from './components/data/fileManager'
import { zhRoadmapEdit } from './components/data/roadmapEdit'
import { zhRoadmapReview } from './components/data/roadmapReview'
import { zhFlowDfd } from './components/flow/notations/process/dfd'
import { zhFlowEpc } from './components/flow/notations/process/epc'
import { zhDashboardGrid } from './components/layout/dashboardGrid'
import { zhFlowBpmn } from './components/flow/notations/process/bpmn'
import { zhFlowIdef } from './components/flow/notations/process/idef'
import { zhFlowC4 } from './components/flow/notations/architecture/c4'
import { zhFlowSequence } from './components/flow/notations/architecture/sequence'
import { zhFlowServices } from './components/flow/notations/architecture/services'
import { zhFlowEventStorming } from './components/flow/notations/architecture/eventStorming'

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
	...zhFlowReview,
	...zhFlowEditor,
	...zhFlowServices,
	...zhFlowBpmn,
	...zhFlowIdef,
	...zhFlowDfd,
	...zhFlowEpc,
	...zhFlowSequence,
	...zhFlowC4,
	...zhFlowEventStorming,
	...zhScene3d,
	...zhModels3d,
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
	...zhRoadmap3d,
	...zhRoadmapEdit,
	...zhRoadmapReview,
	plural: zhPlural,
}
