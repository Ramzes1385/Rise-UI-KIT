import { kkBase } from './base'
import { kkChat } from './chat'
import { kkData } from './data'
import { kkForms } from './forms'
import { kkMedia } from './media'
import { kkPlural } from './plural'
import { kkCalendar } from './calendar'
import { kkCard } from './components/card'
import { kkNotices } from './components/notices'
import { kkGantt } from './components/data/gantt'
import { kkFlowMap } from './components/flow/map'
import { kkMapEditor } from './components/mapEditor'
import { kkRoadmap } from './components/data/roadmap'
import { kkImageMap3d } from './components/imageMap3d'
import { kkTranscript } from './components/transcript'
import { kkFlowEditor } from './components/flow/editor'
import { kkFlowPanels } from './components/flow/panels'
import { kkFlowReview } from './components/flow/review'
import type { UiKitLocale } from '../types/locales.types'
import { kkPresentation } from './components/presentation'
import { kkFlowScenario } from './components/flow/scenario'
import { kkFormWizard } from './components/form/formWizard'
import { kkEventCalendar } from './components/eventCalendar'
import { kkFileManager } from './components/data/fileManager'
import { kkFlowDfd } from './components/flow/notations/process/dfd'
import { kkFlowEpc } from './components/flow/notations/process/epc'
import { kkDashboardGrid } from './components/layout/dashboardGrid'
import { kkFlowBpmn } from './components/flow/notations/process/bpmn'
import { kkFlowIdef } from './components/flow/notations/process/idef'
import { kkFlowC4 } from './components/flow/notations/architecture/c4'
import { kkFlowSequence } from './components/flow/notations/architecture/sequence'
import { kkFlowServices } from './components/flow/notations/architecture/services'
import { kkFlowEventStorming } from './components/flow/notations/architecture/eventStorming'

/** Қазақ тілінің сөздігі (кирилл жазуы). Кілттер мен `{name}` орындары орыс сөздігіндегідей (`ru/`) */
export const kk: UiKitLocale = {
	code: 'kk',
	intl: 'kk-KZ',
	firstDayOfWeek: 1,
	...kkBase,
	...kkCalendar,
	...kkForms,
	...kkCard,
	...kkMedia,
	...kkPresentation,
	...kkMapEditor,
	...kkImageMap3d,
	...kkFlowMap,
	...kkFlowScenario,
	...kkFlowPanels,
	...kkFlowReview,
	...kkFlowEditor,
	...kkFlowServices,
	...kkFlowBpmn,
	...kkFlowIdef,
	...kkFlowDfd,
	...kkFlowEpc,
	...kkFlowSequence,
	...kkFlowC4,
	...kkFlowEventStorming,
	...kkChat,
	...kkData,
	...kkEventCalendar,
	...kkTranscript,
	...kkNotices,
	...kkDashboardGrid,
	...kkGantt,
	...kkFileManager,
	...kkFormWizard,
	...kkRoadmap,
	plural: kkPlural,
}
