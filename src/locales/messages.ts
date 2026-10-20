import { ruPlural } from './ru/plural'
/** Строки интерфейса кита — разделы словаря текущего языка (`localized`), напр. `UI_ARIA.CLOSE`; русский — свой раздел `ru` у каждого, поэтому в сборку попадают только прочитанные разделы. */
import { localized } from './localized'
import { ruCard } from './ru/components/card'
import { ruGantt } from './ru/components/data/gantt'
import { ruFlowMap } from './ru/components/flow/map'
import { ruModels3d } from './ru/components/models3d'
import { ruScene3d } from './ru/components/map/scene3d'
import { ruRoadmap } from './ru/components/data/roadmap'
import { ruTranscript } from './ru/components/transcript'
import { ruFlowEditor } from './ru/components/flow/editor'
import { ruFlowPanels } from './ru/components/flow/panels'
import { ruFlowReview } from './ru/components/flow/review'
import { ruImageMap3d } from './ru/components/map/imageMap3d'
import { ruPresentation } from './ru/components/presentation'
import { ruFlowScenario } from './ru/components/flow/scenario'
import { ruFormWizard } from './ru/components/form/formWizard'
import { ruEventCalendar } from './ru/components/eventCalendar'
import { ruFileManager } from './ru/components/data/fileManager'
import { ruRoadmapEdit } from './ru/components/data/roadmapEdit'
import { ruImageMapEditor } from './ru/components/map/mapEditor'
import { ruRoadmapReview } from './ru/components/data/roadmapReview'
import { ruFlowDfd } from './ru/components/flow/notations/process/dfd'
import { ruFlowEpc } from './ru/components/flow/notations/process/epc'
import { ruDashboardGrid } from './ru/components/layout/dashboardGrid'
import { ruFlowBpmn } from './ru/components/flow/notations/process/bpmn'
import { ruFlowIdef } from './ru/components/flow/notations/process/idef'
import { ruFlowC4 } from './ru/components/flow/notations/architecture/c4'
import { ruBanner, ruCookieConsent, ruResult } from './ru/components/notices'
import { ruFlowSequence } from './ru/components/flow/notations/architecture/sequence'
import { ruFlowServices } from './ru/components/flow/notations/architecture/services'
import { ruFlowEventStorming } from './ru/components/flow/notations/architecture/eventStorming'
import { ruAi, ruChat, ruCommentThread, ruEditor, ruEmoji, ruMarkdown, ruMention } from './ru/chat'
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
} from './ru/media'
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
} from './ru/base'
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
} from './ru/data'
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
} from './ru/forms'

/** Общие подписи: кнопки, пустые состояния, статусы */
export const UI_TEXT = /* @__PURE__ */ localized('text', ruText)

/** Доступные имена кнопок и областей */
export const UI_ARIA = /* @__PURE__ */ localized('aria', ruAria)

export const UI_TOUR = /* @__PURE__ */ localized('tour', ruTour)

/** Степпер: подписи и состояния шагов */
export const UI_STEPPER = /* @__PURE__ */ localized('stepper', ruStepper)

/** Фильтр таблицы */
export const UI_FILTER = /* @__PURE__ */ localized('filter', ruFilter)

export const UI_CALENDAR = /* @__PURE__ */ localized('calendar', ruCalendar)

export const UI_COLOR_PICKER = /* @__PURE__ */ localized('colorPicker', ruColorPicker)

export const UI_RATING = /* @__PURE__ */ localized('rating', ruRating)

/** Записи: аудиоплеер, волна, диктофон */
export const UI_AUDIO = /* @__PURE__ */ localized('audio', ruAudio)

/** Редактор субтитров */
export const UI_SUBTITLES = /* @__PURE__ */ localized('subtitles', ruSubtitles)

/** Расшифровка записи в BaseAudioPlayer */
export const UI_TRANSCRIPT = /* @__PURE__ */ localized('transcript', ruTranscript)

/** Таблица: тексты и доступные имена элементов управления */
export const TABLE_TEXT = /* @__PURE__ */ localized('table', ruTable)

/** Выгрузка таблицы: кнопка «Экспорт» и форматы */
export const TABLE_EXPORT_TEXT = /* @__PURE__ */ localized('tableExport', ruTableExport)

export const UI_CHAT_TEXT = /* @__PURE__ */ localized('chat', ruChat)

export const UI_EDITOR = /* @__PURE__ */ localized('editor', ruEditor)

/** Markdown: блок кода и задачи */
export const UI_MARKDOWN = /* @__PURE__ */ localized('markdown', ruMarkdown)

/** ИИ-чат: сообщение ассистента, рассуждение, вызов инструмента, поле запроса */
export const UI_AI = /* @__PURE__ */ localized('ai', ruAi)

export const UI_EMOJI = /* @__PURE__ */ localized('emoji', ruEmoji)

export const UI_MENTION = /* @__PURE__ */ localized('mention', ruMention)

/** Канбан-доска */
export const UI_KANBAN = /* @__PURE__ */ localized('kanban', ruKanban)

/** Список BaseList */
export const UI_LIST = /* @__PURE__ */ localized('list', ruList)

/** Перенос между списками BaseTransfer */
export const UI_TRANSFER = /* @__PURE__ */ localized('transfer', ruTransfer)

/** Конструктор фильтров */
export const UI_FILTER_BUILDER = /* @__PURE__ */ localized('filterBuilder', ruFilterBuilder)

/** Чек-лист первых шагов */
export const UI_CHECKLIST = /* @__PURE__ */ localized('checklist', ruChecklist)

/** Поле телефона */
export const UI_PHONE_INPUT = /* @__PURE__ */ localized('phoneInput', ruPhoneInput)

/** Поля реквизитов */
export const UI_REQUISITES = /* @__PURE__ */ localized('requisites', ruRequisites)

/** Подсказки DaData */
export const UI_DADATA = /* @__PURE__ */ localized('dadata', ruDadata)

/** КриптоПро ЭЦП Browser plug-in: шаги диагностики и ошибки */
export const UI_CRYPTOPRO = /* @__PURE__ */ localized('cryptopro', ruCryptopro)

/** Палитра команд */
export const UI_COMMAND_PALETTE = /* @__PURE__ */ localized('commandPalette', ruCommandPalette)

/** Графики */
export const UI_CHARTS = /* @__PURE__ */ localized('charts', ruCharts)

/** Отсчёт до даты */
export const UI_COUNTDOWN = /* @__PURE__ */ localized('countdown', ruCountdown)

/** Сравнение картинок */
export const UI_IMAGE_COMPARE = /* @__PURE__ */ localized('imageCompare', ruImageCompare)

/** Окно просмотра изображения */
export const UI_IMAGE_VIEWER = /* @__PURE__ */ localized('imageViewer', ruImageViewer)

/** Карусель BaseSlider */
export const UI_CAROUSEL = /* @__PURE__ */ localized('carousel', ruCarousel)

/** Список «поле — значение» */
export const UI_DESCRIPTIONS = /* @__PURE__ */ localized('descriptions', ruDescriptions)

/** Интерактивная картинка и карта этажей */
export const UI_IMAGE_MAP = /* @__PURE__ */ localized('imageMap', ruImageMap)

/** Маршруты карты этажей */
export const UI_IMAGE_MAP_ROUTES = /* @__PURE__ */ localized('imageMapRoutes', ruImageMapRoutes)
/** Редактор интерактивной картинки */
export const UI_IMAGE_MAP_EDITOR = /* @__PURE__ */ localized('imageMapEditor', ruImageMapEditor)
/** 3D-карта BaseImageMap3D */
export const UI_IMAGE_MAP_3D = /* @__PURE__ */ localized('imageMap3d', ruImageMap3d)
/** Общее 3D-ядро: роль области, переход в 2D, камера, подсказка клавиш */
export const UI_SCENE_3D = /* @__PURE__ */ localized('scene3d', ruScene3d)
/** Встроенные 3D-модели узлов: названия, виды, подписи библиотеки */
export const UI_MODELS_3D = /* @__PURE__ */ localized('models3d', ruModels3d)

/** Карта взаимодействий BaseFlowMap и её нотации */
export const UI_FLOW_MAP = /* @__PURE__ */ localized('flowMap', ruFlowMap)
export const UI_FLOW_SCENARIO = /* @__PURE__ */ localized('flowScenario', ruFlowScenario)
export const UI_FLOW_PANELS = /* @__PURE__ */ localized('flowPanels', ruFlowPanels)
export const UI_FLOW_REVIEW = /* @__PURE__ */ localized('flowReview', ruFlowReview)
export const UI_FLOW_EDITOR = /* @__PURE__ */ localized('flowEditor', ruFlowEditor)
export const UI_FLOW_SERVICES = /* @__PURE__ */ localized('flowServices', ruFlowServices)
export const UI_FLOW_BPMN = /* @__PURE__ */ localized('flowBpmn', ruFlowBpmn)
export const UI_FLOW_IDEF = /* @__PURE__ */ localized('flowIdef', ruFlowIdef)
export const UI_FLOW_DFD = /* @__PURE__ */ localized('flowDfd', ruFlowDfd)
export const UI_FLOW_EPC = /* @__PURE__ */ localized('flowEpc', ruFlowEpc)
export const UI_FLOW_SEQUENCE = /* @__PURE__ */ localized('flowSequence', ruFlowSequence)
export const UI_FLOW_C4 = /* @__PURE__ */ localized('flowC4', ruFlowC4)
export const UI_FLOW_EVENT_STORMING = /* @__PURE__ */ localized('flowEventStorming', ruFlowEventStorming)

/** Просмотр JSON */
export const UI_JSON_VIEWER = /* @__PURE__ */ localized('jsonViewer', ruJsonViewer)

/** Карта */
export const UI_MAP = /* @__PURE__ */ localized('map', ruMap)

/** Блок кода */
export const UI_CODE = /* @__PURE__ */ localized('codeBlock', ruCodeBlock)

/** Сравнение текстов */
export const UI_TEXT_DIFF = /* @__PURE__ */ localized('textDiff', ruTextDiff)

/** QR-код */
export const UI_QR_CODE = /* @__PURE__ */ localized('qrCode', ruQrCode)

/** Бегущая строка */
export const UI_MARQUEE = /* @__PURE__ */ localized('marquee', ruMarquee)

/** Метки */
export const UI_TAG = /* @__PURE__ */ localized('tag', ruTag)

export const UI_SIGNATURE_PAD = /* @__PURE__ */ localized('signaturePad', ruSignaturePad)
export const UI_AVATAR_CROPPER = /* @__PURE__ */ localized('avatarCropper', ruAvatarCropper)
/** Предупреждения о недопустимых числовых пропсах */
export const UI_VALUE_WARNINGS = /* @__PURE__ */ localized('valueWarnings', ruValueWarnings)
export const UI_NOTIFICATION_CENTER = /* @__PURE__ */ localized('notificationCenter', ruNotificationCenter)
export const UI_COMMENT_THREAD = /* @__PURE__ */ localized('commentThread', ruCommentThread)

/** Загрузка файлов BaseFileUpload */
export const UI_FILE_UPLOAD = /* @__PURE__ */ localized('fileUpload', ruFileUpload)

/** Календарь событий */
export const UI_EVENT_CALENDAR = /* @__PURE__ */ localized('eventCalendar', ruEventCalendar)

/** Банковская карта: поля и ошибки BaseCardInput */
export const UI_CARD = /* @__PURE__ */ localized('card', ruCard)

/** Экран итога BaseResult */
export const UI_RESULT = /* @__PURE__ */ localized('result', ruResult)

/** Объявление BaseBanner */
export const UI_BANNER = /* @__PURE__ */ localized('banner', ruBanner)

/** Согласие на cookies BaseCookieConsent */
export const UI_COOKIE_CONSENT = /* @__PURE__ */ localized('cookieConsent', ruCookieConsent)

/** Сетка виджетов BaseDashboardGrid */
export const UI_DASHBOARD_GRID = /* @__PURE__ */ localized('dashboardGrid', ruDashboardGrid)

/** Диаграмма Ганта BaseGantt */
export const UI_GANTT = /* @__PURE__ */ localized('gantt', ruGantt)

/** Файловый менеджер BaseFileManager */
export const UI_FILE_MANAGER = /* @__PURE__ */ localized('fileManager', ruFileManager)

/** Многошаговая форма BaseFormWizard */
export const UI_FORM_WIZARD = /* @__PURE__ */ localized('formWizard', ruFormWizard)

/** Роадмап BaseRoadmap: статусы, сводка, предупреждения о данных */
export const UI_ROADMAP = /* @__PURE__ */ localized('roadmap', ruRoadmap)
/** «Правки» BaseRoadmap: предложения, комментарии, принять и отклонить */
export const UI_ROADMAP_REVIEW = /* @__PURE__ */ localized('roadmapReview', ruRoadmapReview)

/** Роадмап BaseRoadmap, режим «Правка»: шаблоны, свойства, перестановка, отказы */
export const UI_ROADMAP_EDIT = /* @__PURE__ */ localized('roadmapEdit', ruRoadmapEdit)

/** Диапазоны BaseDatePicker: готовые периоды, ошибки ввода */
export const UI_DATE_PICKER = /* @__PURE__ */ localized('datePicker', ruDatePicker)

/** Предупреждения в консоли */
export const UI_WARNINGS = /* @__PURE__ */ localized('warnings', ruWarnings)

/** Видеоплеер BaseMediaPlayer */
export const UI_PLAYER = /* @__PURE__ */ localized('player', ruPlayer)

/** Презентация BasePresentationPlayer */
export const UI_PRESENTATION = /* @__PURE__ */ localized('presentation', ruPresentation)

/** Формы слов для чисел (`pluralize`): `pluralize(UI_PLURAL.DAYS, 3)` */
export const UI_PLURAL = /* @__PURE__ */ localized('plural', ruPlural)
