import { jaBase } from './base'
import { jaChat } from './chat'
import { jaData } from './data'
import { jaForms } from './forms'
import { jaMedia } from './media'
import { jaPlural } from './plural'
import { jaCard } from './components/card'
import { jaNotices } from './components/notices'
import { jaGantt } from './components/data/gantt'
import { jaFlowMap } from './components/flow/map'
import { jaMapEditor } from './components/mapEditor'
import { jaRoadmap } from './components/data/roadmap'
import { jaImageMap3d } from './components/imageMap3d'
import { jaTranscript } from './components/transcript'
import { jaFlowEditor } from './components/flow/editor'
import { jaFlowPanels } from './components/flow/panels'
import { jaFlowReview } from './components/flow/review'
import type { UiKitLocale } from '../types/locales.types'
import { jaPresentation } from './components/presentation'
import { jaFlowScenario } from './components/flow/scenario'
import { jaFormWizard } from './components/form/formWizard'
import { jaEventCalendar } from './components/eventCalendar'
import { jaFileManager } from './components/data/fileManager'
import { jaFlowDfd } from './components/flow/notations/process/dfd'
import { jaFlowEpc } from './components/flow/notations/process/epc'
import { jaDashboardGrid } from './components/layout/dashboardGrid'
import { jaFlowBpmn } from './components/flow/notations/process/bpmn'
import { jaFlowIdef } from './components/flow/notations/process/idef'
import { jaFlowC4 } from './components/flow/notations/architecture/c4'
import { jaFlowSequence } from './components/flow/notations/architecture/sequence'
import { jaFlowServices } from './components/flow/notations/architecture/services'
import { jaFlowEventStorming } from './components/flow/notations/architecture/eventStorming'

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
	...jaFlowMap,
	...jaFlowScenario,
	...jaFlowPanels,
	...jaFlowReview,
	...jaFlowEditor,
	...jaFlowServices,
	...jaFlowBpmn,
	...jaFlowIdef,
	...jaFlowDfd,
	...jaFlowEpc,
	...jaFlowSequence,
	...jaFlowC4,
	...jaFlowEventStorming,
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
