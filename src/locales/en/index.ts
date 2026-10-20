import { enBase } from './base'
import { enChat } from './chat'
import { enData } from './data'
import { enForms } from './forms'
import { enMedia } from './media'
import { enPlural } from './plural'
import { enCard } from './components/card'
import { enNotices } from './components/notices'
import { enGantt } from './components/data/gantt'
import { enFlowMap } from './components/flow/map'
import { enModels3d } from './components/models3d'
import { enScene3d } from './components/map/scene3d'
import { enRoadmap } from './components/data/roadmap'
import { enTranscript } from './components/transcript'
import { enFlowEditor } from './components/flow/editor'
import { enFlowPanels } from './components/flow/panels'
import { enFlowReview } from './components/flow/review'
import { enMapEditor } from './components/map/mapEditor'
import type { UiKitLocale } from '../types/locales.types'
import { enRoadmap3d } from './components/data/roadmap3d'
import { enImageMap3d } from './components/map/imageMap3d'
import { enPresentation } from './components/presentation'
import { enFlowScenario } from './components/flow/scenario'
import { enFormWizard } from './components/form/formWizard'
import { enEventCalendar } from './components/eventCalendar'
import { enFileManager } from './components/data/fileManager'
import { enRoadmapEdit } from './components/data/roadmapEdit'
import { enRoadmapReview } from './components/data/roadmapReview'
import { enFlowDfd } from './components/flow/notations/process/dfd'
import { enFlowEpc } from './components/flow/notations/process/epc'
import { enDashboardGrid } from './components/layout/dashboardGrid'
import { enFlowBpmn } from './components/flow/notations/process/bpmn'
import { enFlowIdef } from './components/flow/notations/process/idef'
import { enFlowC4 } from './components/flow/notations/architecture/c4'
import { enFlowSequence } from './components/flow/notations/architecture/sequence'
import { enFlowServices } from './components/flow/notations/architecture/services'
import { enFlowEventStorming } from './components/flow/notations/architecture/eventStorming'

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
	...enFlowMap,
	...enFlowScenario,
	...enFlowPanels,
	...enFlowReview,
	...enFlowEditor,
	...enFlowServices,
	...enFlowBpmn,
	...enFlowIdef,
	...enFlowDfd,
	...enFlowEpc,
	...enFlowSequence,
	...enFlowC4,
	...enFlowEventStorming,
	...enScene3d,
	...enModels3d,
	...enChat,
	...enData,
	...enEventCalendar,
	...enTranscript,
	...enNotices,
	...enDashboardGrid,
	...enGantt,
	...enFileManager,
	...enFormWizard,
	...enRoadmap,
	...enRoadmap3d,
	...enRoadmapEdit,
	...enRoadmapReview,
	plural: enPlural,
}
