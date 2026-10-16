import { kkBase } from './base'
import { kkChat } from './chat'
import { kkData } from './data'
import { kkForms } from './forms'
import { kkMedia } from './media'
import { kkPlural } from './plural'
import { kkCard } from './components/card'
import { kkNotices } from './components/notices'
import { kkGantt } from './components/data/gantt'
import { kkMapEditor } from './components/mapEditor'
import { kkImageMap3d } from './components/imageMap3d'
import { kkTranscript } from './components/transcript'
import type { UiKitLocale } from '../types/locales.types'
import { kkPresentation } from './components/presentation'
import { kkFormWizard } from './components/form/formWizard'
import { kkEventCalendar } from './components/eventCalendar'
import { kkFileManager } from './components/data/fileManager'
import { kkDashboardGrid } from './components/layout/dashboardGrid'

/** Қазақ тілінің сөздігі (кирилл жазуы). Кілттер мен `{name}` орындары орыс сөздігіндегідей (`ru/`) */
export const kk: UiKitLocale = {
	code: 'kk',
	intl: 'kk-KZ',
	firstDayOfWeek: 1,
	...kkBase,
	...kkForms,
	...kkCard,
	...kkMedia,
	...kkPresentation,
	...kkMapEditor,
	...kkImageMap3d,
	...kkChat,
	...kkData,
	...kkEventCalendar,
	...kkTranscript,
	...kkNotices,
	...kkDashboardGrid,
	...kkGantt,
	...kkFileManager,
	...kkFormWizard,
	plural: kkPlural,
}
