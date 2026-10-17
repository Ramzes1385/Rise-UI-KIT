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
import { jaFlowPanels } from './components/flow/panels'
import type { UiKitLocale } from '../types/locales.types'
import { jaPresentation } from './components/presentation'
import { jaFlowScenario } from './components/flow/scenario'
import { jaFormWizard } from './components/form/formWizard'
import { jaEventCalendar } from './components/eventCalendar'
import { jaFileManager } from './components/data/fileManager'
import { jaFlowDfd } from './components/flow/notations/process/dfd'
import { jaDashboardGrid } from './components/layout/dashboardGrid'
import { jaFlowBpmn } from './components/flow/notations/process/bpmn'
import { jaFlowIdef } from './components/flow/notations/process/idef'
import { jaFlowServices } from './components/flow/notations/architecture/services'

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
	...jaFlowServices,
	...jaFlowBpmn,
	...jaFlowIdef,
	...jaFlowDfd,
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
