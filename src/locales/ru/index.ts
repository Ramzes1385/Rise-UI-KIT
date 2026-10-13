import { ruBase } from './base'
import { ruChat } from './chat'
import { ruData } from './data'
import { ruForms } from './forms'
import { ruMedia } from './media'
import { ruPlural } from './plural'
import { ruCard } from './components/card'
import { ruNotices } from './components/notices'
import { ruGantt } from './components/data/gantt'
import { ruMapEditor } from './components/mapEditor'
import { ruImageMap3d } from './components/imageMap3d'
import { ruTranscript } from './components/transcript'
import { ruPresentation } from './components/presentation'
import { ruFormWizard } from './components/form/formWizard'
import { ruEventCalendar } from './components/eventCalendar'
import { ruFileManager } from './components/data/fileManager'
import { ruDashboardGrid } from './components/layout/dashboardGrid'
/** Русский словарь кита (язык по умолчанию); ключи совпадают с `UI_TEXT`, `UI_ARIA` и др.; `{name}` — место для значения (formatMessage), `plural` — формы чисел (Intl.PluralRules). */
export const ru = {
	code: 'ru',
	/** Языковой тег для Intl: даты, числа, множественное число */
	intl: 'ru-RU',
	/** Первый день недели в календаре: 0 — воскресенье, 1 — понедельник */
	firstDayOfWeek: 1,
	...ruBase,
	...ruForms,
	...ruCard,
	...ruMedia,
	...ruPresentation,
	...ruMapEditor,
	...ruImageMap3d,
	...ruChat,
	...ruData,
	...ruEventCalendar,
	...ruTranscript,
	...ruNotices,
	...ruDashboardGrid,
	...ruGantt,
	...ruFileManager,
	...ruFormWizard,
	plural: ruPlural,
}
