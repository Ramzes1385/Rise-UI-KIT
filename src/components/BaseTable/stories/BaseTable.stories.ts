/**
 * BaseTable — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, цвет, отступы) → состояния (пусто, загрузка,
 * длинный текст) → сценарии (сортировка, выбор строк, тулбар, пагинация, подгрузка, раскрытие строк, вложенная таблица,
 * закреплённые шапка и колонки, ресайз, свои ячейки) → клавиатура.
 */

import { ref } from 'vue'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseProgress } from '@components/BaseProgress'
import {
	ARG_GROUP,
	avatarImage,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	STORY_WAIT_TIMEOUT,
	tabTo,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import BaseTable from '../ui/BaseTable.vue'
import { TABLE_VARIANTS } from '../types/BaseTable.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { NestedTableConfig, TableColumn, TableRow } from '../types/BaseTable.types'

// ─── Данные ────────────────────────────────────────────────────────────────────

/** Сумма в рублях: «12 490 ₽». Перед знаком рубля — неразрывный пробел: сумма не переносится по строкам */
function formatRub(value: unknown): string {
	return `${new Intl.NumberFormat('ru-RU').format(Number(value))}\u00A0₽`
}

/** Дата ISO (ГГГГ-ММ-ДД) → ДД.ММ.ГГГГ. Без Date: результат не зависит от часового пояса машины */
function formatDate(value: unknown): string {
	const [year, month, day] = String(value).split('-')
	return `${day}.${month}.${year}`
}

const ORDERS = [
	{
		id: 1,
		number: 'З-1041',
		customer: 'Анна Смирнова',
		city: 'Москва',
		status: 'Доставлен',
		date: '2025-05-14',
		total: 12490,
		progress: 100,
	},
	{ id: 2, number: 'З-1042', customer: 'Иван Петров', city: 'Казань', status: 'В пути', date: '2025-05-14', total: 3150, progress: 70 },
	{
		id: 3,
		number: 'З-1043',
		customer: 'Мария Кузнецова',
		city: 'Санкт-Петербург',
		status: 'Оплачен',
		date: '2025-05-13',
		total: 28700,
		progress: 30,
	},
	{
		id: 4,
		number: 'З-1044',
		customer: 'Олег Соколов',
		city: 'Новосибирск',
		status: 'Отменён',
		date: '2025-05-12',
		total: 990,
		progress: 0,
	},
	{
		id: 5,
		number: 'З-1045',
		customer: 'Екатерина Волкова',
		city: 'Екатеринбург',
		status: 'Доставлен',
		date: '2025-05-11',
		total: 7640,
		progress: 100,
	},
	{
		id: 6,
		number: 'З-1046',
		customer: 'Дмитрий Орлов',
		city: 'Москва',
		status: 'В пути',
		date: '2025-05-10',
		total: 15300,
		progress: 60,
	},
	{
		id: 7,
		number: 'З-1047',
		customer: 'Ольга Лебедева',
		city: 'Самара',
		status: 'Оплачен',
		date: '2025-05-09',
		total: 4380,
		progress: 20,
	},
	{
		id: 8,
		number: 'З-1048',
		customer: 'Сергей Новиков',
		city: 'Казань',
		status: 'Доставлен',
		date: '2025-05-08',
		total: 21900,
		progress: 100,
	},
	{
		id: 9,
		number: 'З-1049',
		customer: 'Наталья Морозова',
		city: 'Москва',
		status: 'Оплачен',
		date: '2025-05-07',
		total: 5870,
		progress: 40,
	},
	{
		id: 10,
		number: 'З-1050',
		customer: 'Алексей Фёдоров',
		city: 'Пермь',
		status: 'Доставлен',
		date: '2025-05-06',
		total: 9990,
		progress: 100,
	},
	{
		id: 11,
		number: 'З-1051',
		customer: 'Татьяна Козлова',
		city: 'Уфа',
		status: 'В пути',
		date: '2025-05-05',
		total: 13200,
		progress: 80,
	},
	{
		id: 12,
		number: 'З-1052',
		customer: 'Павел Никитин',
		city: 'Воронеж',
		status: 'Отменён',
		date: '2025-05-04',
		total: 2400,
		progress: 0,
	},
]

type Order = (typeof ORDERS)[number]

/** Строки таблицы из заказов: id строки — id заказа, в data — все поля */
function toRows(orders: readonly Order[], extra: Partial<TableRow> = {}): TableRow[] {
	return orders.map(order => ({ id: order.id, data: { ...order }, ...extra }))
}

const ROWS = toRows(ORDERS.slice(0, 5))
const ALL_ROWS = toRows(ORDERS)

const COLUMNS: TableColumn[] = [
	{ key: 'number', label: 'Заказ' },
	{ key: 'customer', label: 'Покупатель', isSortable: true, sortType: 'string' },
	{ key: 'city', label: 'Город', isSortable: true, sortType: 'string' },
	{ key: 'status', label: 'Статус' },
	{ key: 'date', label: 'Дата', isSortable: true, sortType: 'date', formatter: formatDate },
	{ key: 'total', label: 'Сумма', isSortable: true, sortType: 'number', align: 'right', formatter: formatRub },
]

/** Четыре колонки для витрин, где таблиц несколько */
const COMPACT_COLUMNS: TableColumn[] = [COLUMNS[0], COLUMNS[1], COLUMNS[3], COLUMNS[5]]

/** Цвета бейджей статусов: роль → мягкий фон и текст роли */
const STATUS_COLORS: Record<string, { bg: { base: string }; text: { base: string } }> = {
	Доставлен: { bg: { base: 'var(--rise-success-soft)' }, text: { base: 'var(--rise-success-text)' } },
	'В пути': { bg: { base: 'var(--rise-info-soft)' }, text: { base: 'var(--rise-info-text)' } },
	Оплачен: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	Отменён: { bg: { base: 'var(--rise-error-soft)' }, text: { base: 'var(--rise-error-text)' } },
}

/** Текст строк таблицы (без шапки) — для проверки порядка и состава */
function bodyRows(table: HTMLElement): HTMLElement[] {
	return within(table).getAllByRole('row').slice(1)
}

const meta = {
	title: 'Data/BaseTable',
	component: BaseTable,
	parameters: {
		docs: {
			description: {
				component: [
					'Таблица данных в духе Nuxt UI Table: сортировка, поиск и фильтры, выбор строк, пагинация или подгрузка,',
					'раскрытие строк и вложенные таблицы, закреплённые шапка и колонки, ресайз и видимость колонок. Всё считается на клиенте.',
					'',
					'- Данные: `columns` (ключ, подпись, ширина, тип сортировки, форматтер) и `rows` (`{ id, data }`). Ячейку и заголовок',
					'  переопределяют слоты `cell-<key>` и `header-<key>`, над и под таблицей — `header`, `footer`, `toolbar-prepend/append`.',
					'- Функции включаются объектами `features` (search, filters, columnSettings, rowNumber, pageSizeSelector)',
					'  и `behavior` (selectable, multiSort, resizable); размер страницы — `pageSize`, режим — `loadMode`.',
					'- Варианты: `default` — линии между строками, `bordered` — сетка, `striped` — чередование фона строк.',
					'- Доступность: сортируемый заголовок — кнопка с `aria-sort` на `th`, у чекбоксов и кнопок раскрытия есть имена,',
					'  «Выбрать все» действует только на найденные строки. Прокручиваемая область получает фокус с клавиатуры.',
					'- Пустое состояние — `BaseEmpty` (`emptyText` или слот `empty`), загрузка — скелетон или подложка со спиннером.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: TABLE_VARIANTS }),
		columns: { control: 'object', table: propGroup(ARG_GROUP.content) },
		rows: { control: 'object', table: propGroup(ARG_GROUP.content) },
		emptyText: { control: 'text', table: propGroup(ARG_GROUP.content) },
		nestedConfig: { control: 'object', table: propGroup(ARG_GROUP.content) },
		padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		isVirtual: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		rowHeight: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		features: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
		behavior: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
		pageSize: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.behavior) },
		pageSizeOptions: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
		loadMode: { control: 'inline-radio', options: ['pagination', 'button', 'infinite'], table: propGroup(ARG_GROUP.behavior) },
		searchDebounce: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.behavior) },
		// Слот default объявлен в типах, но таблица его не выводит
		...hiddenArgTypes('default'),
	},
	args: {
		columns: COLUMNS,
		rows: ROWS,
		variant: 'default',
		sizeScale: 100,
		emptyText: 'Нет данных',
		isLoading: false,
		height: '',
		features: {},
		behavior: {},
		pageSize: 0,
		pageSizeOptions: [],
		loadMode: 'pagination',
		searchDebounce: 300,
		onSort: fn(),
		onFilter: fn(),
		onSearch: fn(),
		onSelect: fn(),
		onExpand: fn(),
		'onRow-click': fn(),
		'onPage-change': fn(),
		'onPage-size-change': fn(),
		'onLoad-more': fn(),
		'onColumn-resize': fn(),
		'onColumns-change': fn(),
	},
} satisfies Meta<typeof BaseTable>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: меняйте props в Controls — например, включите `features.search` или `behavior.selectable`.
 * Заголовки «Покупатель», «Город», «Дата» и «Сумма» сортируют строки. Story открывают e2e-тесты, поэтому play
 * только проверяет начальное состояние.
 */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('columnheader', { name: 'Покупатель' })).toHaveAttribute('aria-sort', 'none')
		await expect(canvas.getByRole('columnheader', { name: 'Заказ' })).not.toHaveAttribute('aria-sort')
		await expect(bodyRows(canvas.getByRole('table'))).toHaveLength(5)
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Три варианта: `default` — линии между строками, `bordered` — ещё и между колонками (плотные данные, сравнение значений),
 * `striped` — чётные строки на фоне `bg-muted` вместо линий (длинные строки легче вести глазом).
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'features', 'behavior'] },
		docs: {
			source: {
				code: TABLE_VARIANTS.map(variant => `<BaseTable :columns="columns" :rows="rows" variant="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			variants: TABLE_VARIANTS,
			columns: COMPACT_COLUMNS,
			rows: toRows(ORDERS.slice(0, 4)),
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ variant }}</span>
					<BaseTable v-bind="props" :variant="variant" :columns="columns" :rows="rows" />
				</div>
			</div>
		`,
	}),
}

/**
 * Размер задаёт `sizeScale`: кегль, отступы ячеек, чекбоксы и поля тулбара масштабируются вместе.
 * При 100 строка — 44px, поля и кнопки тулбара — 32px, как остальные контролы библиотеки.
 */
export const Sizes: Story = {
	args: { behavior: { selectable: true } },
	parameters: {
		controls: { include: ['variant', 'behavior'] },
		docs: {
			source: {
				code: ['xs', 'md', 'xl']
					.map(
						name =>
							`<BaseTable :columns="columns" :rows="rows" :size-scale="${SIZE_PRESETS.find(p => p.name === name)?.sizeScale}" />`,
					)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
			columns: COMPACT_COLUMNS,
			rows: toRows(ORDERS.slice(0, 3)),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseTable v-bind="props" :size-scale="preset.sizeScale" :columns="columns" :rows="rows" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg.base` — фон таблицы, `bg.hover` — строка под курсором, `text.base` — текст шапки
 * и ячеек. Кнопки, бейджи и поля внутри таблицы цвет не наследуют.
 */
export const CustomColor: Story = {
	args: {
		columns: [...COMPACT_COLUMNS, { key: 'actions', label: 'Действия', align: 'right' }],
		rows: toRows(ORDERS.slice(0, 3)),
		color: { bg: { base: '#f5f3ff', hover: '#ede9fe' }, text: { base: '#4c1d95' } },
	},
	parameters: {
		docs: {
			source: {
				code: [
					`<BaseTable :columns="columns" :rows="rows" :color="{ bg: { base: '#f5f3ff', hover: '#ede9fe' }, text: { base: '#4c1d95' } }">`,
					'  <template #cell-actions><BaseButton variant="outline">Открыть</BaseButton></template>',
					'</BaseTable>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseTable v-bind="props">
				<template #cell-actions="{ row }">
					<BaseButton variant="outline" :aria-label="'Открыть заказ ' + row.data.number" @click.stop>Открыть</BaseButton>
				</template>
			</BaseTable>
		`,
	}),
	play: async ({ canvasElement, canvas }) => {
		const body = canvasElement.querySelector('.base-table__body') as HTMLElement
		await expect(getComputedStyle(body).backgroundColor).toBe('rgb(245, 243, 255)')
		const button = canvas.getByRole('button', { name: 'Открыть заказ З-1041' })
		// Переменные цвета сброшены внутри таблицы: кнопка остаётся в цветах своего варианта
		await expect(getComputedStyle(button).getPropertyValue('--custom-bg')).toBe('')
		await expect(getComputedStyle(button).backgroundColor).not.toBe('rgb(245, 243, 255)')
	},
}

/**
 * Отступы ячеек `padding`: число — Y = n, X = 2n (6 → 6px 12px, плотная таблица); объект `{ x, y }` задаёт оси напрямую.
 * Без `padding` отступы 12px 16px из стилей. Отступы шапки и служебных колонок меняются вместе с ячейками.
 */
export const Padding: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="rows" :padding="6" />',
					'<BaseTable :columns="columns" :rows="rows" :padding="{ x: 24, y: 16 }" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args), columns: COMPACT_COLUMNS, rows: toRows(ORDERS.slice(0, 3)) }),
		template: `
			<div class="story-stack">
				<span class="story-label">padding: 6 → 6px 12px</span>
				<BaseTable v-bind="props" :columns="columns" :rows="rows" :padding="6" :behavior="{ selectable: true }" />
				<span class="story-label">padding: { x: 24, y: 16 }</span>
				<BaseTable v-bind="props" :columns="columns" :rows="rows" :padding="{ x: 24, y: 16 }" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [compact, spacious] = canvasElement.querySelectorAll<HTMLElement>('.base-table')
		await expect(compact.style.getPropertyValue('--tbl-pad-top')).toBe('6px')
		await expect(compact.style.getPropertyValue('--tbl-pad-left')).toBe('12px')
		await expect(spacious.style.getPropertyValue('--tbl-pad-left')).toBe('24px')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Пустая таблица показывает `BaseEmpty` с текстом `emptyText`. Слот `empty` заменяет его своим содержимым —
 * например, пустым состоянием поиска с кнопкой сброса.
 */
export const Empty: Story = {
	args: { rows: [], emptyText: 'Заказов пока нет' },
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="[]" empty-text="Заказов пока нет" />',
					'<BaseTable :columns="columns" :rows="[]">',
					'  <template #empty>',
					'    <BaseEmpty variant="ghost" icon="search" title="Ничего не найдено" description="Измените условия поиска">',
					'      <template #actions><BaseButton variant="outline">Сбросить фильтры</BaseButton></template>',
					'    </BaseEmpty>',
					'  </template>',
					'</BaseTable>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable, BaseEmpty, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-stack">
				<BaseTable v-bind="props" />
				<BaseTable v-bind="props">
					<template #empty>
						<BaseEmpty variant="ghost" icon="search" title="Ничего не найдено" description="Измените условия поиска">
							<template #actions><BaseButton variant="outline">Сбросить фильтры</BaseButton></template>
						</BaseEmpty>
					</template>
				</BaseTable>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { name: 'Заказов пока нет' })).toBeVisible()
		await expect(canvas.getByRole('heading', { name: 'Ничего не найдено' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Сбросить фильтры' })).toBeVisible()
	},
}

/**
 * Загрузка: без данных — строки-скелетоны (их число — `pageSize` или 5), с данными — подложка со спиннером поверх строк,
 * строки недоступны для клика. Таблица помечена `aria-busy`.
 */
export const Loading: Story = {
	args: { isLoading: true },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'behavior', 'features'] },
		docs: {
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="[]" is-loading />',
					'<BaseTable :columns="columns" :rows="rows" is-loading />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args), rows: toRows(ORDERS.slice(0, 3)) }),
		template: `
			<div class="story-stack">
				<span class="story-label">Первая загрузка — скелетон</span>
				<BaseTable v-bind="props" :rows="[]" :page-size="3" />
				<span class="story-label">Обновление — подложка поверх данных</span>
				<BaseTable v-bind="props" :rows="rows" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		for (const table of canvas.getAllByRole('table')) {
			await expect(table).toHaveAttribute('aria-busy', 'true')
		}
		await expect(canvas.getByRole('status', { name: 'Загрузка' })).toBeVisible()
	},
}

/**
 * Длинный текст: в обычной раскладке ячейка переносит строки и растёт по высоте; если у колонок задана ширина
 * (`width`), раскладка фиксированная и текст обрезается многоточием в одну строку.
 */
export const LongContent: Story = {
	args: {
		columns: [
			{ key: 'number', label: 'Заказ' },
			{ key: 'comment', label: 'Комментарий покупателя' },
			{ key: 'total', label: 'Сумма', align: 'right', formatter: formatRub },
		],
		rows: [
			{
				id: 1,
				data: {
					number: 'З-1041',
					comment:
						'Позвонить за час до доставки, домофон не работает: подъезд со стороны двора, третий этаж, дверь направо от лифта',
					total: 12490,
				},
			},
			{ id: 2, data: { number: 'З-1042', comment: 'Оставить у двери', total: 3150 } },
		],
	},
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseTable },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			fixedColumns: [
				{ key: 'number', label: 'Заказ', width: '120px' },
				{ key: 'comment', label: 'Комментарий покупателя', width: '320px' },
				{ key: 'total', label: 'Сумма', width: '120px', align: 'right', formatter: formatRub },
			],
		}),
		template: `
			<div class="story-stack">
				<span class="story-label">Ширина по содержимому — перенос строк</span>
				<BaseTable v-bind="props" />
				<span class="story-label">Заданы ширины колонок — многоточие</span>
				<div style="max-width: 560px;">
					<BaseTable v-bind="props" :columns="fixedColumns" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [, fixedTable] = canvas.getAllByRole('table')
		const cell = within(fixedTable).getByRole('cell', { name: /Позвонить за час/ })
		await expect(cell.scrollWidth).toBeGreaterThan(cell.clientWidth)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Сортировка: клик по заголовку — по возрастанию, повторный — по убыванию, третий — сброс. С `behavior.multiSort`
 * колонки добавляются к сортировке по очереди, номер у иконки — приоритет (озвучивается как описание кнопки).
 * Пустые значения всегда в конце, числа и даты сравниваются как числа и даты.
 */
export const Sorting: Story = {
	args: { rows: toRows(ORDERS.slice(0, 8)), behavior: { multiSort: true } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Город' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Сумма' }))
		await expect(canvas.getByRole('columnheader', { name: 'Город' })).toHaveAttribute('aria-sort', 'ascending')
		await expect(canvas.getByRole('columnheader', { name: 'Сумма' })).toHaveAttribute('aria-sort', 'ascending')
		await expect(canvas.getByRole('button', { name: 'Сумма' })).toHaveAccessibleDescription('Приоритет сортировки: 2')
		await expect(args.onSort).toHaveBeenLastCalledWith([
			{ key: 'city', direction: 'asc' },
			{ key: 'total', direction: 'asc' },
		])
		// Екатеринбург, затем два заказа из Казани — по возрастанию суммы
		const [first, second, third] = bodyRows(canvas.getByRole('table'))
		await expect(first).toHaveTextContent('Екатерина Волкова')
		await expect(second).toHaveTextContent('Иван Петров')
		await expect(third).toHaveTextContent('Сергей Новиков')
	},
}

/**
 * Выбор строк (`behavior.selectable`): чекбоксы в строках и «Выбрать все» в шапке, выбранная строка подсвечена.
 * Отключённую строку (`isDisabled`) выбрать нельзя. При поиске «Выбрать все» отмечает только найденные строки,
 * а событие `select` получает выбранные строки целиком.
 */
export const Selection: Story = {
	args: {
		rows: toRows(ORDERS.slice(0, 8)).map(row => (row.id === 4 ? { ...row, isDisabled: true } : row)),
		behavior: { selectable: true },
		features: { search: true },
		searchDebounce: 0,
	},
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('checkbox', { name: 'Выбрать строку 4' })).toBeDisabled()
		await userEvent.type(canvas.getByLabelText('Поиск по таблице'), 'Казань')
		await waitFor(() => expect(bodyRows(canvas.getByRole('table'))).toHaveLength(2))
		const selectAll = canvas.getByRole('checkbox', { name: 'Выбрать все строки' })
		await userEvent.click(selectAll)
		await expect(selectAll).toBeChecked()
		// Выбраны только две найденные строки из Казани
		await expect(args.onSelect).toHaveBeenLastCalledWith([expect.objectContaining({ id: 2 }), expect.objectContaining({ id: 8 })])
	},
}

/**
 * Тулбар: поиск по всем полям (`features.search`), фильтр «колонка — условие — значение» (`features.filters`),
 * видимость колонок (`features.columnSettings`) и свои элементы в слотах `toolbar-prepend` / `toolbar-append`.
 * Поля и кнопки — 32px в один ряд. Панель «Колонки» ставит фокус на первый чекбокс, Escape возвращает его на кнопку.
 */
export const Toolbar: Story = {
	args: {
		rows: toRows(ORDERS.slice(0, 6)),
		features: { search: true, filters: true, columnSettings: true },
		searchDebounce: 0,
	},
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="rows" :features="{ search: true, filters: true, columnSettings: true }">',
					'  <template #toolbar-append>',
					'    <BaseButton variant="outline"><template #left><BaseIcon name="download" /></template>Экспорт</BaseButton>',
					'  </template>',
					'</BaseTable>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseTable v-bind="props">
				<template #toolbar-append>
					<BaseButton variant="outline">
						<template #left><BaseIcon name="download" :size-scale="80" /></template>
						Экспорт
					</BaseButton>
				</template>
			</BaseTable>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(canvas.getByLabelText('Поиск по таблице'), 'Москва')
		await waitFor(() => expect(bodyRows(canvas.getByRole('table'))).toHaveLength(2))
		await waitFor(() => expect(args.onSearch).toHaveBeenLastCalledWith('Москва'))

		const columnsButton = canvas.getByRole('button', { name: 'Колонки' })
		await userEvent.click(columnsButton)
		await expect(columnsButton).toHaveAttribute('aria-expanded', 'true')
		const cityOption = await screen.findByRole('checkbox', { name: 'Город' }, { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.click(cityOption)
		await expect(canvas.queryByRole('columnheader', { name: 'Город' })).not.toBeInTheDocument()
		await userEvent.keyboard('{Escape}')
		await expect(columnsButton).toHaveFocus()
		await expect(columnsButton).toHaveAttribute('aria-expanded', 'false')
	},
}

/**
 * Пагинация: `pageSize` строк на странице, под таблицей — «1–3 из 8» и `BasePagination`. `features.pageSizeSelector`
 * с `pageSizeOptions` добавляет выбор размера страницы. Смена страницы вызывает `page-change`.
 */
export const Pagination: Story = {
	args: {
		rows: toRows(ORDERS.slice(0, 8)),
		pageSize: 3,
		pageSizeOptions: [3, 5, 8],
		features: { pageSizeSelector: true },
	},
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByText('1–3 из 8')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: '2' }))
		await expect(canvas.getByText('4–6 из 8')).toBeVisible()
		await expect(bodyRows(canvas.getByRole('table'))[0]).toHaveTextContent('З-1044')
		await expect(args['onPage-change']).toHaveBeenLastCalledWith(2)
		// Возврат на первую страницу стрелкой: e2e-тест пагинации начинает с первой страницы
		await userEvent.click(canvas.getByRole('button', { name: 'Предыдущая страница' }))
		await expect(canvas.getByText('1–3 из 8')).toBeVisible()
	},
}

/**
 * Подгрузка вместо страниц: `loadMode="button"` — кнопка «Загрузить еще» под таблицей, `loadMode="infinite"` —
 * следующая порция при прокрутке до конца (нужна высота `height`). Каждая порция — `pageSize` строк, событие `load-more`.
 */
export const LoadMore: Story = {
	args: { rows: ALL_ROWS, pageSize: 4 },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'pageSize'] },
		docs: {
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="rows" :page-size="4" load-mode="button" />',
					'<BaseTable :columns="columns" :rows="rows" :page-size="4" load-mode="infinite" height="180px" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args), columns: COMPACT_COLUMNS }),
		template: `
			<div class="story-stack">
				<span class="story-label">loadMode: button</span>
				<BaseTable v-bind="props" :columns="columns" load-mode="button" />
				<span class="story-label">loadMode: infinite, height: 180px</span>
				<BaseTable v-bind="props" :columns="columns" load-mode="infinite" height="180px" />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const [buttonTable, infiniteTable] = canvas.getAllByRole('table')
		await expect(bodyRows(buttonTable)).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Загрузить еще' }))
		await expect(bodyRows(buttonTable)).toHaveLength(8)
		await expect(args['onLoad-more']).toHaveBeenCalledOnce()

		// Прокрутка до конца области подгружает следующую порцию
		const scroller = infiniteTable.parentElement as HTMLElement
		await expect(bodyRows(infiniteTable)).toHaveLength(4)
		scroller.scrollTop = scroller.scrollHeight
		await waitFor(() => expect(bodyRows(infiniteTable)).toHaveLength(8))
	},
}

/**
 * Раскрытие строк: строка с `isExpandable` показывает под собой слот `expanded-content`, строка с `children` —
 * дочерние строки с отступом. Кнопка раскрытия сообщает состояние через `aria-expanded`, событие — `expand`.
 */
export const ExpandableRows: Story = {
	args: {
		rows: [
			...toRows(ORDERS.slice(0, 2), { isExpandable: true }),
			{
				id: 'bundle',
				data: { number: 'З-1040', customer: 'ООО «Вектор»', city: 'Москва', status: 'В пути', date: '2025-05-15', total: 45200 },
				children: [
					{
						id: 'bundle-1',
						data: {
							number: 'З-1040/1',
							customer: 'Склад на Складской',
							city: 'Москва',
							status: 'Доставлен',
							date: '2025-05-15',
							total: 30100,
						},
					},
					{
						id: 'bundle-2',
						data: {
							number: 'З-1040/2',
							customer: 'Офис на Тверской',
							city: 'Москва',
							status: 'В пути',
							date: '2025-05-15',
							total: 15100,
						},
					},
				],
			},
		],
	},
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="rows">',
					'  <template #expanded-content="{ row }">Состав заказа {{ row.data.number }}…</template>',
					'</BaseTable>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseTable v-bind="props">
				<template #expanded-content="{ row }">
					<p style="margin: 0;">Заказ {{ row.data.number }}: 3 позиции, доставка курьером, оплата картой онлайн.</p>
				</template>
			</BaseTable>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const [expandFirst] = canvas.getAllByRole('button', { name: 'Развернуть строку' })
		await userEvent.click(expandFirst)
		await expect(expandFirst).toHaveAttribute('aria-expanded', 'true')
		await expect(expandFirst).toHaveAccessibleName('Свернуть строку')
		await waitFor(() => expect(canvas.getByText(/Заказ З-1041: 3 позиции/)).toBeVisible())
		await expect(args.onExpand).toHaveBeenLastCalledWith(expect.objectContaining({ id: 1, isExpanded: true }))
	},
}

const NESTED_CONFIG: NestedTableConfig = {
	title: 'Состав заказа',
	childrenKey: 'children',
	columns: [
		{ key: 'product', label: 'Товар' },
		{ key: 'quantity', label: 'Кол-во', align: 'right' },
		{ key: 'price', label: 'Цена', align: 'right', formatter: formatRub },
	],
}

/**
 * Вложенная таблица: с `nestedConfig` дочерние строки (`children`) показываются отдельной таблицей со своими колонками
 * и заголовком `title`. Строка с `isExpanded` раскрыта сразу.
 */
export const NestedTable: Story = {
	args: {
		columns: COMPACT_COLUMNS,
		nestedConfig: NESTED_CONFIG,
		rows: [
			{
				...toRows([ORDERS[0]])[0],
				isExpanded: true,
				children: [
					{ id: 'p1', data: { product: 'Кофеварка капельная', quantity: 1, price: 8990 } },
					{ id: 'p2', data: { product: 'Фильтры бумажные, 100 шт.', quantity: 2, price: 1750 } },
				],
			},
			{
				...toRows([ORDERS[1]])[0],
				children: [{ id: 'p3', data: { product: 'Кружка керамическая', quantity: 3, price: 1050 } }],
			},
		],
	},
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('table')).toHaveLength(2)
		await userEvent.click(canvas.getByRole('button', { name: 'Развернуть строку' }))
		await waitFor(() => expect(canvas.getAllByRole('table')).toHaveLength(3))
		// Содержимое проявляется анимацией высоты и прозрачности
		await waitFor(() => expect(canvas.getByRole('cell', { name: 'Кружка керамическая' })).toBeVisible())
	},
}

/**
 * Закреплённые шапка и колонки: `height` ограничивает высоту — строки прокручиваются под шапкой; `isSticky: 'left'`
 * и `'right'` закрепляют колонки при горизонтальной прокрутке широкой таблицы. Прокручиваемая область получает
 * фокус с клавиатуры (Tab), её можно прокрутить стрелками.
 */
export const StickyHeader: Story = {
	args: {
		height: '260px',
		rows: ALL_ROWS,
		columns: [
			{ key: 'customer', label: 'Покупатель', width: '180px', isSticky: 'left' },
			{ key: 'number', label: 'Заказ', width: '120px' },
			{ key: 'city', label: 'Город', width: '180px' },
			{ key: 'status', label: 'Статус', width: '140px' },
			{ key: 'date', label: 'Дата', width: '140px', formatter: formatDate },
			{ key: 'progress', label: 'Сборка, %', width: '140px', align: 'right' },
			{ key: 'total', label: 'Сумма', width: '140px', align: 'right', formatter: formatRub, isSticky: 'right' },
		],
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div style="max-width: 720px;"><BaseTable v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const table = canvas.getByRole('table')
		const scroller = table.parentElement as HTMLElement
		await waitFor(() => expect(scroller).toHaveAttribute('tabindex', '0'))
		scroller.scrollTop = 120
		const header = canvas.getByRole('columnheader', { name: 'Заказ' })
		await waitFor(() => expect(Math.round(header.getBoundingClientRect().top)).toBe(Math.round(scroller.getBoundingClientRect().top)))
	},
}

/** 5000 заказов для виртуальной прокрутки: строки собираются из примера по кругу */
const MANY_ROWS: TableRow[] = Array.from({ length: 5000 }, (_, index) => {
	const order = ORDERS[index % ORDERS.length]
	return { id: `many-${index}`, data: { ...order, number: `№ ${10000 + index}` } }
})

/**
 * Виртуальная прокрутка (`isVirtual` и `height`): в DOM только видимые строки и запас, остальные — высотой распорок.
 * Таблица объявляет полное число строк (`aria-rowcount`), строки — своё место (`aria-rowindex`). Высота строки до замера —
 * `rowHeight`; после отрисовки строки замеряются, раскрытые строки учитываются.
 */
export const Virtual: Story = {
	args: { height: '360px', rows: MANY_ROWS, columns: COMPACT_COLUMNS, isVirtual: true, features: { rowNumber: true } },
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div style="max-width: 720px;"><BaseTable v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const table = canvas.getByRole('table')
		await expect(table).toHaveAttribute('aria-rowcount', '5001')
		await expect(bodyRows(table).length).toBeLessThan(40)
		const scroller = table.parentElement as HTMLElement
		scroller.scrollTop = scroller.scrollHeight
		await waitFor(() => expect(canvas.getByText('№ 14999')).toBeVisible())
		await expect(canvas.getByText('№ 14999').closest('tr')).toHaveAttribute('aria-rowindex', '5001')
	},
}

/**
 * Ресайз колонок: с `behavior.resizable` (или `isResizable` у колонки) ширину меняют перетаскиванием ручки у правого
 * края заголовка. Событие `column-resize` получает ключ и новую ширину в px, `columns-change` — копию колонок.
 */
export const ResizableColumns: Story = {
	args: { behavior: { resizable: true } },
	play: async ({ canvas, userEvent, args }) => {
		const header = canvas.getByRole('columnheader', { name: 'Заказ' })
		const handle = header.querySelector('.base-table__resizer') as HTMLElement
		const start = handle.getBoundingClientRect()
		const x = start.left + start.width / 2
		const y = start.top + start.height / 2
		const widthBefore = header.getBoundingClientRect().width
		// Таблица читает pageX: координаты задаются и для клиента, и для страницы
		await userEvent.pointer([
			{ keys: '[MouseLeft>]', target: handle, coords: { clientX: x, clientY: y, pageX: x, pageY: y } },
			{ target: handle, coords: { clientX: x + 60, clientY: y, pageX: x + 60, pageY: y } },
			{ keys: '[/MouseLeft]', target: handle },
		])
		await expect(args['onColumn-resize']).toHaveBeenCalledWith('number', expect.any(Number))
		await expect(header.getBoundingClientRect().width).toBeGreaterThan(widthBefore)
	},
}

/**
 * Свои ячейки и секции: слоты `cell-<key>` (аватар, бейдж статуса, прогресс, кнопка действия) и `header-<key>`,
 * а также `header` и `footer` над и под таблицей. Кнопка в ячейке не должна запускать клик по строке — `@click.stop`.
 */
export const CustomCells: Story = {
	args: {
		columns: [
			{ key: 'customer', label: 'Покупатель' },
			{ key: 'status', label: 'Статус' },
			{ key: 'progress', label: 'Сборка' },
			{ key: 'total', label: 'Сумма', align: 'right', formatter: formatRub },
			{ key: 'actions', label: 'Действия', align: 'right' },
		],
	},
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="rows">',
					'  <template #header>Заказы за май</template>',
					'  <template #cell-customer="{ row }"><BaseAvatar :src="row.data.avatar" :name="row.data.customer" /> …</template>',
					'  <template #cell-status="{ value }"><BaseBadge :label="value" :color="statusColors[value]" /></template>',
					'  <template #cell-progress="{ value }"><BaseProgress :value="value" /></template>',
					'  <template #cell-actions="{ row }">',
					'    <BaseButton variant="ghost" aria-label="Удалить заказ" @click.stop="remove(row)"><BaseIcon name="trash" /></BaseButton>',
					'  </template>',
					'  <template #footer>Итого …</template>',
					'</BaseTable>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable, BaseAvatar, BaseBadge, BaseButton, BaseIcon, BaseProgress },
		setup: () => {
			const rows = ref<TableRow[]>(
				toRows(ORDERS.slice(0, 4)).map((row, index) => ({ ...row, data: { ...row.data, avatar: avatarImage(24 + index * 70) } })),
			)
			const total = () => formatRub(rows.value.reduce((sum, row) => sum + Number(row.data.total), 0))
			const remove = (id: string | number) => {
				rows.value = rows.value.filter(row => row.id !== id)
			}
			return { props: useArgsWithoutSlots(args, ['rows']), rows, total, remove, statusColors: STATUS_COLORS }
		},
		template: `
			<BaseTable v-bind="props" :rows="rows">
				<template #header>
					<div style="display: flex; flex-direction: column; gap: 2px;">
						<strong style="color: var(--rise-text-highlighted);">Заказы за май</strong>
						<span style="color: var(--rise-text-muted);">Последние заказы интернет-магазина</span>
					</div>
				</template>
				<template #header-total>Сумма, ₽</template>
				<template #cell-customer="{ row }">
					<div style="display: flex; align-items: center; gap: 12px;">
						<BaseAvatar :src="row.data.avatar" :alt="row.data.customer" :name="row.data.customer" />
						<div style="display: flex; flex-direction: column;">
							<span style="color: var(--rise-text-highlighted); font-weight: var(--rise-font-weight-medium);">{{ row.data.customer }}</span>
							<span style="color: var(--rise-text-muted);">{{ row.data.number }} · {{ row.data.city }}</span>
						</div>
					</div>
				</template>
				<template #cell-status="{ value }">
					<BaseBadge :label="value" :color="statusColors[value]" />
				</template>
				<template #cell-progress="{ value }">
					<div style="min-width: 120px;">
						<BaseProgress :value="value" :aria-label="'Сборка заказа: ' + value + '%'" />
					</div>
				</template>
				<template #cell-actions="{ row }">
					<BaseButton variant="ghost" :padding="{ x: 5, y: 5 }" :aria-label="'Удалить заказ ' + row.data.number" @click.stop="remove(row.id)">
						<BaseIcon name="trash" />
					</BaseButton>
				</template>
				<template #footer>
					<span>Заказов: {{ rows.length }} · на сумму {{ total() }}</span>
				</template>
			</BaseTable>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByText('Заказов: 4', { exact: false })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить заказ З-1042' }))
		await expect(canvas.queryByText('Иван Петров')).not.toBeInTheDocument()
		await expect(canvas.getByText('Заказов: 3', { exact: false })).toBeVisible()
		// Клик по кнопке в ячейке не всплыл до строки
		await expect(args['onRow-click']).not.toHaveBeenCalled()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab переводит фокус на кнопку сортировки (кольцо фокуса), Enter и Space меняют направление (`aria-sort`);
 * Space отмечает чекбокс строки; Enter на кнопке раскрытия показывает содержимое строки.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: {
		rows: toRows(ORDERS.slice(0, 3), { isExpandable: true }),
		behavior: { selectable: true },
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseTable v-bind="props">
				<template #expanded-content="{ row }">Доставка заказа {{ row.data.number }}: курьером до двери.</template>
			</BaseTable>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const sortButton = canvas.getByRole('button', { name: 'Покупатель' })
		const header = canvas.getByRole('columnheader', { name: 'Покупатель' })
		await tabTo(sortButton, userEvent)
		await expect(getComputedStyle(sortButton).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(header).toHaveAttribute('aria-sort', 'ascending')
		await userEvent.keyboard(' ')
		await expect(header).toHaveAttribute('aria-sort', 'descending')

		const rowCheckbox = canvas.getByRole('checkbox', { name: 'Выбрать строку 1' })
		await tabTo(rowCheckbox, userEvent)
		await userEvent.keyboard(' ')
		await expect(rowCheckbox).toBeChecked()

		const [expandButton] = canvas.getAllByRole('button', { name: 'Развернуть строку' })
		await tabTo(expandButton, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(expandButton).toHaveAttribute('aria-expanded', 'true')
	},
}
