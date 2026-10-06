import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'

/**
 * Варианты оформления BaseImageMapEditor:
 * default — рамка и фон; outline — заметная рамка без фона; ghost — без рамки и фона (редактор встроен в страницу).
 */
export const IMAGE_MAP_EDITOR_VARIANTS = ['default', 'outline', 'ghost'] as const

/** Вариант оформления редактора */
export type ImageMapEditorVariant = (typeof IMAGE_MAP_EDITOR_VARIANTS)[number]

/**
 * Инструменты редактора: select — выделять, двигать и менять размер; point — поставить точку;
 * rect и ellipse — нарисовать фигуру протяжкой (или щелчком — фигура обычного размера);
 * polygon — вершины щелчками, завершить — щелчком по первой вершине, двойным щелчком или Enter
 */
export const IMAGE_MAP_EDITOR_TOOLS = ['select', 'point', 'rect', 'ellipse', 'polygon'] as const

/** Инструмент редактора */
export type ImageMapEditorTool = (typeof IMAGE_MAP_EDITOR_TOOLS)[number]

/**
 * Части BaseImageMapEditor для пропа `ui` (БЭМ-элементы `.base-image-map-editor__<часть>`, `root` — весь редактор):
 * toolbar — панель инструментов, group — группа кнопок, layout — холст и панель, main — колонка холста,
 * viewport — область прокрутки холста, stage — холст, empty — пустое состояние, help — подсказка под холстом,
 * error — текст ошибки, panel — панель свойств, section — раздел панели, heading — заголовок раздела,
 * list — список объектов или этажей, item — строка списка, fieldset — группа полей, legend — подпись группы полей.
 */
export const IMAGE_MAP_EDITOR_PARTS = [
	'toolbar',
	'group',
	'layout',
	'main',
	'viewport',
	'stage',
	'empty',
	'help',
	'error',
	'panel',
	'section',
	'heading',
	'list',
	'item',
	'fieldset',
	'legend',
] as const

/** Часть BaseImageMapEditor для пропа `ui` */
export type BaseImageMapEditorPart = (typeof IMAGE_MAP_EDITOR_PARTS)[number]

/** Элементы для `customClass` */
type ImageMapEditorClassKey = 'root' | 'toolbar' | 'canvas' | 'panel' | 'error'

/**
 * Пропсы компонента BaseImageMapEditor
 */
export interface BaseImageMapEditorProps extends BaseComponentProps<ImageMapEditorVariant, ImageMapEditorClassKey> {
	/** JSON карты (`v-model`) — тот же формат, что у BaseImageMap; без него редактор начинает с пустой карты */
	modelValue?: ImageMapData
	/** Id редактируемого слоя (`v-model:layer`); по умолчанию — первый слой */
	layer?: string
	/** Id выделенного объекта (`v-model:selected`); `null` — ничего не выделено */
	selected?: string | null
	/** Инструмент (`v-model:tool`) */
	tool?: ImageMapEditorTool
	/** Имя редактора для скринридера и подпись холста */
	label?: string
	/** Текст ошибки под редактором (например, из проверки формы) */
	error?: string
	/** Только просмотр: инструменты, панель свойств и клавиши правки отключены */
	isDisabled?: boolean
	/** Сколько шагов помнит отмена */
	historyLimit?: number
	/** Шаг сдвига стрелками — доля картинки; с Shift — вдесятеро больше */
	nudgeStep?: number
	/** Кнопка «Просмотр»: карта как у BaseImageMap — проверить подсказки и окна */
	hasPreview?: boolean
	/** Высота холста (CSS-длина); без неё — по пропорциям слоя, не выше 70 % окна */
	height?: string
	/** Имя файла при экспорте JSON */
	fileName?: string
	/**
	 * Поля 3D в панели свойств для BaseImageMap3D (вход `/map3d`): высота и узел модели объекта, высота и модель GLB этажа,
	 * общие настройки сцены. По умолчанию `false`; 3D-поля JSON сохраняются и без них
	 */
	has3dFields?: boolean
	/**
	 * Классы частей (`root`, `toolbar`, `viewport`, `panel`, `item`… — см. `IMAGE_MAP_EDITOR_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseImageMapEditor.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseImageMapEditor v-model="map" :ui="{ viewport: 'shadow-inner', panel: 'gap-6' }" />
	 */
	ui?: UiProp<BaseImageMapEditorPart>
}

/** Пропсы после `withDefaults` */
export type ImageMapEditorProps = PropsWithDefaults<
	BaseImageMapEditorProps,
	'selected' | 'tool' | 'isDisabled' | 'historyLimit' | 'nudgeStep' | 'hasPreview' | 'fileName' | 'has3dFields'
>

/**
 * События компонента BaseImageMapEditor
 */
export interface BaseImageMapEditorEmits {
	/** Новый JSON карты после каждой правки, отмены и повтора — новый объект (`v-model`) */
	(event: 'update:modelValue', value: ImageMapData): void
	/** Сменился редактируемый слой (`v-model:layer`) */
	(event: 'update:layer', id: string): void
	/** Выделен объект или выделение снято (`v-model:selected`) */
	(event: 'update:selected', id: string | null): void
	/** Сменился инструмент (`v-model:tool`) */
	(event: 'update:tool', tool: ImageMapEditorTool): void
	/** Файл не открылся: не JSON карты, не картинка или пустой SVG; `message` — текст, который увидел пользователь */
	(event: 'import-error', message: string): void
}

/**
 * Слоты компонента BaseImageMapEditor
 */
export interface BaseImageMapEditorSlots {
	/** Свои кнопки в конце панели инструментов: «Сохранить», «Опубликовать» */
	toolbar?: () => unknown
}

/**
 * Методы компонента BaseImageMapEditor (ref)
 */
export interface BaseImageMapEditorExpose {
	/** Отменить последнюю правку; `false` — отменять нечего */
	undo: () => boolean
	/** Повторить отменённую правку; `false` — повторять нечего */
	redo: () => boolean
	/** Удалить выделенный объект */
	deleteSelected: () => void
	/** JSON карты строкой с отступами — то, что сохраняет «Экспорт» */
	exportJson: () => string
	/** Загрузить карту из строки JSON; `false` — строка не JSON карты (карта не меняется) */
	importJson: (text: string) => boolean
	/** Создать объекты `svg` из элементов SVG слоя с `id`, у которых ещё нет объекта; возвращает число новых */
	importSvgObjects: () => number
}
