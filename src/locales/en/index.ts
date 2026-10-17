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
import { enMapEditor } from './components/mapEditor'
import { enRoadmap } from './components/data/roadmap'
import { enImageMap3d } from './components/imageMap3d'
import { enTranscript } from './components/transcript'
import { enFlowPanels } from './components/flow/panels'
import type { UiKitLocale } from '../types/locales.types'
import { enPresentation } from './components/presentation'
import { enFlowScenario } from './components/flow/scenario'
import { enFormWizard } from './components/form/formWizard'
import { enEventCalendar } from './components/eventCalendar'
import { enFileManager } from './components/data/fileManager'
import { enFlowDfd } from './components/flow/notations/process/dfd'
import { enDashboardGrid } from './components/layout/dashboardGrid'
import { enFlowBpmn } from './components/flow/notations/process/bpmn'
import { enFlowIdef } from './components/flow/notations/process/idef'
import { enFlowServices } from './components/flow/notations/architecture/services'

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
	...enFlowServices,
	...enFlowBpmn,
	...enFlowIdef,
	...enFlowDfd,
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
	plural: enPlural,
}
