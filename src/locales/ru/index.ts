import { ruPlural } from './plural'
import { ruCard } from './components/card'
import { ruGantt } from './components/data/gantt'
import { ruFlowMap } from './components/flow/map'
import { ruModels3d } from './components/models3d'
import { ruScene3d } from './components/map/scene3d'
import { ruRoadmap } from './components/data/roadmap'
import { ruTranscript } from './components/transcript'
import { ruFlowEditor } from './components/flow/editor'
import { ruFlowPanels } from './components/flow/panels'
import { ruFlowReview } from './components/flow/review'
import { ruImageMap3d } from './components/map/imageMap3d'
import { ruPresentation } from './components/presentation'
import { ruFlowScenario } from './components/flow/scenario'
import { ruFormWizard } from './components/form/formWizard'
import { ruEventCalendar } from './components/eventCalendar'
import { ruFileManager } from './components/data/fileManager'
import { ruRoadmapEdit } from './components/data/roadmapEdit'
import { ruImageMapEditor } from './components/map/mapEditor'
import { ruRoadmapReview } from './components/data/roadmapReview'
import { ruFlowDfd } from './components/flow/notations/process/dfd'
import { ruFlowEpc } from './components/flow/notations/process/epc'
import { ruDashboardGrid } from './components/layout/dashboardGrid'
import { ruFlowBpmn } from './components/flow/notations/process/bpmn'
import { ruFlowIdef } from './components/flow/notations/process/idef'
import { ruFlowC4 } from './components/flow/notations/architecture/c4'
import { ruBanner, ruCookieConsent, ruResult } from './components/notices'
import { ruFlowSequence } from './components/flow/notations/architecture/sequence'
import { ruFlowServices } from './components/flow/notations/architecture/services'
import { ruFlowEventStorming } from './components/flow/notations/architecture/eventStorming'
import { ruAi, ruChat, ruCommentThread, ruEditor, ruEmoji, ruMarkdown, ruMention } from './chat'
import {
	ruAudio,
	ruCarousel,
	ruFileUpload,
	ruImageCompare,
	ruImageMap,
	ruImageMapRoutes,
	ruImageViewer,
	ruPlayer,
	ruSubtitles,
} from './media'
import {
	ruAria,
	ruChecklist,
	ruCommandPalette,
	ruMarquee,
	ruNotificationCenter,
	ruQrCode,
	ruRating,
	ruStepper,
	ruTag,
	ruText,
	ruTour,
	ruWarnings,
} from './base'
import {
	ruCharts,
	ruCodeBlock,
	ruCountdown,
	ruDescriptions,
	ruJsonViewer,
	ruKanban,
	ruList,
	ruMap,
	ruTable,
	ruTableExport,
	ruTextDiff,
	ruTransfer,
} from './data'
import {
	ruAvatarCropper,
	ruCalendar,
	ruColorPicker,
	ruCryptopro,
	ruDadata,
	ruDatePicker,
	ruFilter,
	ruFilterBuilder,
	ruPhoneInput,
	ruRequisites,
	ruSignaturePad,
	ruValueWarnings,
} from './forms'
/** Русский словарь кита (язык по умолчанию) целиком: все разделы. Компоненты берут свои разделы по отдельности (`messages.ts`), поэтому в сборку приложения без `ru` попадают только прочитанные разделы; `{name}` — место для значения (formatMessage), `plural` — формы чисел (Intl.PluralRules). */
export const ru = {
	code: 'ru',
	/** Языковой тег для Intl: даты, числа, множественное число */
	intl: 'ru-RU',
	/** Первый день недели в календаре: 0 — воскресенье, 1 — понедельник */
	firstDayOfWeek: 1,
	text: ruText,
	aria: ruAria,
	tour: ruTour,
	stepper: ruStepper,
	rating: ruRating,
	checklist: ruChecklist,
	commandPalette: ruCommandPalette,
	qrCode: ruQrCode,
	marquee: ruMarquee,
	tag: ruTag,
	notificationCenter: ruNotificationCenter,
	warnings: ruWarnings,
	filter: ruFilter,
	calendar: ruCalendar,
	datePicker: ruDatePicker,
	colorPicker: ruColorPicker,
	filterBuilder: ruFilterBuilder,
	phoneInput: ruPhoneInput,
	requisites: ruRequisites,
	dadata: ruDadata,
	signaturePad: ruSignaturePad,
	avatarCropper: ruAvatarCropper,
	valueWarnings: ruValueWarnings,
	cryptopro: ruCryptopro,
	card: ruCard,
	player: ruPlayer,
	audio: ruAudio,
	subtitles: ruSubtitles,
	imageCompare: ruImageCompare,
	imageViewer: ruImageViewer,
	carousel: ruCarousel,
	fileUpload: ruFileUpload,
	imageMap: ruImageMap,
	imageMapRoutes: ruImageMapRoutes,
	presentation: ruPresentation,
	imageMapEditor: ruImageMapEditor,
	imageMap3d: ruImageMap3d,
	flowMap: ruFlowMap,
	flowScenario: ruFlowScenario,
	flowPanels: ruFlowPanels,
	flowReview: ruFlowReview,
	flowEditor: ruFlowEditor,
	flowServices: ruFlowServices,
	flowBpmn: ruFlowBpmn,
	flowIdef: ruFlowIdef,
	flowDfd: ruFlowDfd,
	flowEpc: ruFlowEpc,
	flowSequence: ruFlowSequence,
	flowC4: ruFlowC4,
	flowEventStorming: ruFlowEventStorming,
	scene3d: ruScene3d,
	models3d: ruModels3d,
	chat: ruChat,
	editor: ruEditor,
	markdown: ruMarkdown,
	ai: ruAi,
	emoji: ruEmoji,
	mention: ruMention,
	commentThread: ruCommentThread,
	table: ruTable,
	tableExport: ruTableExport,
	kanban: ruKanban,
	charts: ruCharts,
	descriptions: ruDescriptions,
	codeBlock: ruCodeBlock,
	jsonViewer: ruJsonViewer,
	textDiff: ruTextDiff,
	map: ruMap,
	countdown: ruCountdown,
	list: ruList,
	transfer: ruTransfer,
	eventCalendar: ruEventCalendar,
	transcript: ruTranscript,
	result: ruResult,
	banner: ruBanner,
	cookieConsent: ruCookieConsent,
	dashboardGrid: ruDashboardGrid,
	gantt: ruGantt,
	fileManager: ruFileManager,
	formWizard: ruFormWizard,
	roadmap: ruRoadmap,
	roadmapEdit: ruRoadmapEdit,
	roadmapReview: ruRoadmapReview,
	plural: ruPlural,
}
