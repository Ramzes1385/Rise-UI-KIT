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
import { uzFlowMap } from './components/flow/map'
import { uzModels3d } from './components/models3d'
import { uzScene3d } from './components/map/scene3d'
import { uzRoadmap } from './components/data/roadmap'
import { uzTranscript } from './components/transcript'
import { uzFlowEditor } from './components/flow/editor'
import { uzFlowPanels } from './components/flow/panels'
import { uzFlowReview } from './components/flow/review'
import { uzMapEditor } from './components/map/mapEditor'
import type { UiKitLocale } from '../types/locales.types'
import { uzRoadmap3d } from './components/data/roadmap3d'
import { uzImageMap3d } from './components/map/imageMap3d'
import { uzPresentation } from './components/presentation'
import { uzFlowScenario } from './components/flow/scenario'
import { uzFormWizard } from './components/form/formWizard'
import { uzEventCalendar } from './components/eventCalendar'
import { uzFileManager } from './components/data/fileManager'
import { uzRoadmapEdit } from './components/data/roadmapEdit'
import { uzRoadmapReview } from './components/data/roadmapReview'
import { uzFlowDfd } from './components/flow/notations/process/dfd'
import { uzFlowEpc } from './components/flow/notations/process/epc'
import { uzDashboardGrid } from './components/layout/dashboardGrid'
import { uzFlowBpmn } from './components/flow/notations/process/bpmn'
import { uzFlowIdef } from './components/flow/notations/process/idef'
import { uzFlowC4 } from './components/flow/notations/architecture/c4'
import { uzFlowSequence } from './components/flow/notations/architecture/sequence'
import { uzFlowServices } from './components/flow/notations/architecture/services'
import { uzFlowEventStorming } from './components/flow/notations/architecture/eventStorming'

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
	...uzFlowMap,
	...uzFlowScenario,
	...uzFlowPanels,
	...uzFlowReview,
	...uzFlowEditor,
	...uzFlowServices,
	...uzFlowBpmn,
	...uzFlowIdef,
	...uzFlowDfd,
	...uzFlowEpc,
	...uzFlowSequence,
	...uzFlowC4,
	...uzFlowEventStorming,
	...uzScene3d,
	...uzModels3d,
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
	...uzRoadmap3d,
	...uzRoadmapEdit,
	...uzRoadmapReview,
	plural: uzPlural,
}
