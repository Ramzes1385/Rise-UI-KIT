import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления файлового менеджера:
 * default — рамка вокруг области, outline — рамка `accented`, soft — мягкий фон без рамки, ghost — без фона и рамки.
 */
export const FILE_MANAGER_VARIANTS = ['default', 'outline', 'soft', 'ghost'] as const

export type FileManagerVariant = (typeof FILE_MANAGER_VARIANTS)[number]

/** Вид содержимого папки: `list` — строки с размером и датой, `grid` — плитки */
export const FILE_MANAGER_VIEWS = ['list', 'grid'] as const

export type FileManagerView = (typeof FILE_MANAGER_VIEWS)[number]

/** По чему сортируется содержимое папки: имя, размер, дата изменения. Папки всегда идут перед файлами */
export const FILE_MANAGER_SORT_KEYS = ['name', 'size', 'modifiedAt'] as const

export type FileManagerSortKey = (typeof FILE_MANAGER_SORT_KEYS)[number]

export const FILE_MANAGER_SORT_DIRECTIONS = ['asc', 'desc'] as const

export type FileManagerSortDirection = (typeof FILE_MANAGER_SORT_DIRECTIONS)[number]

/**
 * Части файлового менеджера для пропа `ui` (БЭМ-элементы `.base-file-manager__<часть>`, `root` — вся область):
 * sidebar — колонка с деревом папок, main — основная область, toolbar — верхняя панель, path — «хлебные крошки»,
 * actions — ряд действий (создать, загрузить, переименовать…), search — поле поиска, header — ряд кнопок сортировки,
 * sort — кнопка сортировки, list — содержимое папки, entry — файл или папка, icon — иконка, name — имя, meta — размер и дата,
 * editor — поле имени при переименовании и создании папки, status — строка состояния, state — загрузка, пустая папка и ошибка.
 */
export const FILE_MANAGER_PARTS = [
	'sidebar',
	'main',
	'toolbar',
	'path',
	'actions',
	'search',
	'header',
	'sort',
	'list',
	'entry',
	'icon',
	'name',
	'meta',
	'editor',
	'status',
	'state',
] as const

export type BaseFileManagerPart = (typeof FILE_MANAGER_PARTS)[number]

/** Тип записи: папка или файл */
export type FileManagerEntryType = 'folder' | 'file'

/** Запись файлового менеджера — файл или папка. Дерево задаётся плоским списком через `parentId` */
export interface FileManagerItem {
	/** Уникальный идентификатор. Повторный `id` игнорируется */
	id: string
	/** `id` папки-родителя; `null` или не задан — запись лежит в корне. Запись с неизвестным родителем или родителем-файлом не показывается */
	parentId?: string | null
	/** Имя файла или папки */
	name: string
	/** Папка или файл */
	type: FileManagerEntryType
	/** Размер файла в байтах. У папки не показывается */
	size?: number
	/** Дата изменения: `Date`, метка времени или строка ISO */
	modifiedAt?: Date | string | number
	/** MIME-тип файла: по нему и по расширению выбирается иконка */
	mime?: string
}

/** Порядок сортировки содержимого папки */
export interface FileManagerSort {
	key: FileManagerSortKey
	direction: FileManagerSortDirection
}

export interface BaseFileManagerProps extends BaseComponentProps<
	FileManagerVariant,
	| 'root'
	| 'sidebar'
	| 'main'
	| 'toolbar'
	| 'path'
	| 'actions'
	| 'search'
	| 'header'
	| 'sort'
	| 'list'
	| 'entry'
	| 'icon'
	| 'name'
	| 'meta'
	| 'editor'
	| 'status'
	| 'state'
> {
	/**
	 * Файлы и папки одним плоским списком. Менеджер сам ничего не читает и не пишет: об операциях он сообщает событиями
	 * (`create-folder`, `rename`, `delete`, `move`, `upload`), а приложение выполняет их и обновляет `items`
	 */
	items: FileManagerItem[]
	/**
	 * Текущая папка — её `id` (`v-model:path`); `null` — корень. Не задан — менеджер хранит папку сам.
	 * Неизвестный `id` или файл показывают корень
	 */
	path?: string | null
	/** Выбранные записи — массив `id` (`v-model:selected`). Не задан — менеджер хранит выбор сам. Выбор ограничен текущей папкой и поиском */
	selected?: string[]
	/** Вид содержимого (`v-model:view`). По умолчанию — `list` */
	view?: FileManagerView
	/** Порядок сортировки (`v-model:sort`). По умолчанию — по имени, по возрастанию */
	sort?: FileManagerSort
	/** Поиск по имени в текущей папке (`v-model:query`) */
	query?: string
	/** Данные загружаются: вместо списка — заготовки, операции недоступны */
	isLoading?: boolean
	/** Текст ошибки загрузки: вместо списка — сообщение с кнопкой «Повторить» (событие `retry`) */
	error?: string
	/** Отключает весь менеджер: ни навигации, ни операций */
	isDisabled?: boolean
	/** Только просмотр: навигация, поиск и выбор работают, операции (создать, загрузить, переименовать, удалить, переместить) недоступны */
	isReadonly?: boolean
	/** Показывать дерево папок слева. На узкой области оно скрывается само: путь остаётся в «хлебных крошках» */
	hasTree?: boolean
	/** Имя корня в дереве и «хлебных крошках». По умолчанию — «Файлы» на языке кита */
	rootLabel?: string
	/** Имя менеджера для скринридера. По умолчанию — «Файловый менеджер» на языке кита */
	ariaLabel?: string
	/** Типы файлов в окне загрузки (MIME или расширения, как `accept` у `<input type="file">`) */
	accept?: string
	/** Максимальный размер файла в окне загрузки, МБ; `0` — без ограничения */
	maxSize?: number
	/** Высота области: число — пиксели, строка — любая CSS-длина. Содержимое прокручивается внутри */
	height?: number | string
	/**
	 * Классы частей (`root`, `sidebar`, `toolbar`, `entry`, `name`… — см. `FILE_MANAGER_PARTS`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseFileManager: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseFileManager :items="items" :ui="{ entry: 'font-medium', status: 'text-xs' }" />
	 */
	ui?: UiProp<BaseFileManagerPart>
}

export interface BaseFileManagerEmits {
	/** Открыта другая папка (`v-model:path`); `null` — корень */
	(event: 'update:path', value: string | null): void
	/** Изменился выбор (`v-model:selected`) */
	(event: 'update:selected', value: string[]): void
	/** Изменился вид (`v-model:view`) */
	(event: 'update:view', value: FileManagerView): void
	/** Изменилась сортировка (`v-model:sort`) */
	(event: 'update:sort', value: FileManagerSort): void
	/** Изменился поисковый запрос (`v-model:query`) */
	(event: 'update:query', value: string): void
	/** Запись открыта: Enter, двойной клик, кнопка или пункт «Открыть». Папка при этом ещё и становится текущей (`update:path`) */
	(event: 'open', item: FileManagerItem): void
	/** Новая папка: `parentId` — папка, где её создают (`null` — корень), `name` — проверенное имя без пробелов по краям */
	(event: 'create-folder', parentId: string | null, name: string): void
	/** Переименование: `id` записи и новое имя. Имя не пустое, без `/` и `\`, не совпадает с соседней записью той же папки без учёта регистра */
	(event: 'rename', id: string, name: string): void
	/** Пользователь подтвердил удаление: `ids` — записи; у папки удаляется и содержимое — это делает приложение */
	(event: 'delete', ids: string[]): void
	/** Перемещение в папку `targetId` (`null` — корень): перетаскиванием или окном «Переместить в…». Не в саму себя и не в потомка */
	(event: 'move', ids: string[], targetId: string | null): void
	/** Файлы выбраны в окне загрузки и отправлены в папку `parentId` (`null` — корень) */
	(event: 'upload', files: File[], parentId: string | null): void
	/** Нажата «Повторить» под ошибкой загрузки */
	(event: 'retry'): void
}

export interface BaseFileManagerSlots {
	/** Иконка записи вместо стандартной (по типу и расширению) */
	icon?: (props: { item: FileManagerItem }) => unknown
	/** Содержимое вместо пустого состояния: `isSearch` — ничего не найдено по запросу, иначе папка пуста */
	empty?: (props: { isSearch: boolean; query: string }) => unknown
}

export type FileManagerProps = PropsWithDefaults<
	BaseFileManagerProps,
	'isLoading' | 'isDisabled' | 'isReadonly' | 'hasTree' | 'maxSize' | 'height' | 'sizeScale'
>
