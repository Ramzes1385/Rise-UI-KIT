/**
 * Stories для компонента BaseTable.
 * Демонстрирует все варианты, размеры, сортировку, выбор, поиск и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { buildArgTypes } from '@/shared/utils/storybookUtils'

import BaseAvatar from '@/shared/ui/BaseAvatar/BaseAvatar.vue'
import BaseBadge from '@/shared/ui/BaseBadge/BaseBadge.vue'
import BaseButton from '@/shared/ui/BaseButton/BaseButton.vue'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import BaseImage from '@/shared/ui/BaseImage/BaseImage.vue'
import BaseProgress from '@/shared/ui/BaseProgress/BaseProgress.vue'
import BaseSwitch from '@/shared/ui/BaseSwitch/BaseSwitch.vue'
import BaseText from '@/shared/ui/BaseText/BaseText.vue'
import type { TableColumn, TableRow } from './BaseTable.types'
import { TABLE_VARIANTS } from './BaseTable.types'
import BaseTable from './BaseTable.vue'

const COLUMNS: TableColumn[] = [
	{ key: 'id', label: 'ID', width: '60px', sortType: 'number', isSortable: true },
	{ key: 'name', label: 'Название', sortType: 'string', isSortable: true },
	{ key: 'material', label: 'Материал', sortType: 'string', isSortable: true },
	{ key: 'price', label: 'Цена', width: '100px', sortType: 'number', isSortable: true, align: 'right' },
]

const ROWS: TableRow[] = [
	{ id: 1, data: { id: 1, name: 'Роза', material: 'Сталь', price: 15000 } },
	{ id: 2, data: { id: 2, name: 'Орёл', material: 'Бронза', price: 35000 } },
	{ id: 3, data: { id: 3, name: 'Дерево', material: 'Железо', price: 8000 } },
	{ id: 4, data: { id: 4, name: 'Лев', material: 'Медь', price: 22000 } },
	{ id: 5, data: { id: 5, name: 'Волк', material: 'Сталь', price: 18000 } },
]

const EXTENDED_COLUMNS: TableColumn[] = [
	{ key: 'id', label: 'ID', width: '60px', sortType: 'number', isSortable: true },
	{ key: 'name', label: 'Название', sortType: 'string', isSortable: true },
	{ key: 'material', label: 'Материал', sortType: 'string', isSortable: true },
	{ key: 'price', label: 'Цена', width: '100px', sortType: 'number', isSortable: true, align: 'right' },
	{ key: 'status', label: 'Статус', width: '120px' },
	{ key: 'date', label: 'Дата', width: '120px', sortType: 'date', isSortable: true },
]

const EXTENDED_ROWS: TableRow[] = [
	{ id: 1, data: { id: 1, name: 'Роза', material: 'Сталь', price: 15000, status: 'В наличии', date: '2024-01-15' } },
	{ id: 2, data: { id: 2, name: 'Орёл', material: 'Бронза', price: 35000, status: 'Под заказ', date: '2024-03-20' } },
	{ id: 3, data: { id: 3, name: 'Дерево', material: 'Железо', price: 8000, status: 'В наличии', date: '2024-02-10' } },
	{ id: 4, data: { id: 4, name: 'Лев', material: 'Медь', price: 22000, status: 'Продано', date: '2024-04-05' } },
	{ id: 5, data: { id: 5, name: 'Волк', material: 'Сталь', price: 18000, status: 'В наличии', date: '2024-01-28' } },
	{ id: 6, data: { id: 6, name: 'Кот', material: 'Бронза', price: 12000, status: 'Под заказ', date: '2024-05-12' } },
	{ id: 7, data: { id: 7, name: 'Ворон', material: 'Железо', price: 9500, status: 'В наличии', date: '2024-06-01' } },
	{ id: 8, data: { id: 8, name: 'Конь', material: 'Медь', price: 42000, status: 'Продано', date: '2024-02-22' } },
]

const meta: Meta<typeof BaseTable> = {
	title: 'UI/BaseTable',
	component: BaseTable,

	argTypes: buildArgTypes({
		props: {
			variant: {
				control: 'inline-radio',
				options: TABLE_VARIANTS,
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фон), text (текст) и их состояния hover/active/focus',
			},
			isLoading: { control: 'boolean' },
			emptyText: { control: 'text' },
			height: { control: 'text', description: 'Высота таблицы для sticky header и скролла' },
			isSelectable: { control: 'boolean' },
			hasSearch: { control: 'boolean' },
			hasFilters: { control: 'boolean' },
			hasColumnSettings: { control: 'boolean' },
			hasRowNumber: { control: 'boolean' },
			hasPageSizeSelector: { control: 'boolean', description: 'Показывать селектор размера страницы внизу слева' },
			isMultiSort: { control: 'boolean' },
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			padding: {
				control: { type: 'range', min: 0, max: 24, step: 1 },
				description: 'Базовый padding ячеек (px). Y = значение, X = значение × 2. По умолчанию 10 → 10px 20px',
			},
			pageSize: { control: 'number' },
			searchDebounce: { control: 'number' },
			columns: {
				control: 'object',
				description: 'Массив определений колонок (TableColumn[])',
			},
			rows: {
				control: 'object',
				description: 'Массив строк данных (TableRow[])',
			},
			pageSizeOptions: {
				control: 'object',
				description: 'Варианты размера страницы для селектора',
			},
			loadMode: {
				control: 'inline-radio',
				options: ['pagination', 'infinite', 'button'],
			},
			nestedConfig: {
				control: 'object',
				description: 'Конфиг вложенной таблицы: { columns, childrenKey, title? }',
			},
			onSort: { table: { disable: true } },
			onFilter: { table: { disable: true } },
			onSearch: { table: { disable: true } },
			onSelect: { table: { disable: true } },
			onExpand: { table: { disable: true } },
			'onPage-change': { table: { disable: true } },
			'onPage-size-change': { table: { disable: true } },
			'onRow-click': { table: { disable: true } },
			'onColumn-resize': { table: { disable: true } },
			'onColumns-change': { table: { disable: true } },
			'onLoad-more': { table: { disable: true } },
		},
	}),

	args: {
		columns: COLUMNS,
		rows: ROWS,
		variant: 'default',
		color: undefined,
		isLoading: false,
		emptyText: 'Нет данных',
		height: '',
		isSelectable: false,
		hasSearch: false,
		hasFilters: false,
		pageSize: 0,
		pageSizeOptions: [],
		loadMode: 'pagination',
		searchDebounce: 300,
		hasColumnSettings: false,
		hasRowNumber: false,
		hasPageSizeSelector: false,
		isMultiSort: false,
		nestedConfig: undefined,
		sizeScale: 100,
		padding: 10,
	},
}

export default meta
type Story = StoryObj<typeof BaseTable>

/** Базовая таблица */
export const Default: Story = {}

/** Все варианты */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable v-for="v in ['default', 'bordered', 'striped']" :key="v" :variant="v" :columns="columns" :rows="rows" />`,
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup() {
			return { args, variants: TABLE_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div v-for="v in variants" :key="v">
					<BaseTable v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
}

/** Масштабирование sizeScale */
export const SizeScale: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable v-for="scale in [75, 100, 150]" :key="scale" :size-scale="scale" :columns="columns" :rows="rows" />`,
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale" style="flex: 1; min-width: 300px;">
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">{{ scale }}%</p>
					<BaseTable v-bind="args" :size-scale="scale" />
				</div>
			</div>
		`,
	}),
}

/** Без данных */
export const Empty: Story = {
	args: {
		rows: [],
	},
}

/** С текстом пустого состояния */
export const EmptyCustom: Story = {
	args: {
		rows: [],
		emptyText: 'Список изделий пуст. Добавьте первое изделие.',
	},
}

/** Загрузка (скелетон) */
export const Loading: Story = {
	args: {
		isLoading: true,
		rows: [],
	},
}

/** Загрузка поверх данных */
export const LoadingOverlay: Story = {
	args: {
		isLoading: true,
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
	},
}

/** Sticky header при скролле */
export const StickyHeader: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows" height="250px" />`,
			},
		},
	},
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		height: '250px',
	},
}

/** С поиском */
export const WithSearch: Story = {
	args: {
		hasSearch: true,
	},
}

/** С выбором строк */
export const Selectable: Story = {
	args: {
		isSelectable: true,
	},
}

/** Расширенная таблица */
export const Extended: Story = {
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
	},
}

/** Полный набор: фильтры + пагинация + выбор + поиск */
export const FullToolbar: Story = {
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		hasSearch: true,
		hasFilters: true,
		isSelectable: true,
		hasColumnSettings: true,
		hasRowNumber: true,
		hasPageSizeSelector: true,
		pageSize: 5,
		pageSizeOptions: [3, 5, 8],
		loadMode: 'pagination',
		variant: 'bordered',
	},
}

/** С пагинацией (BasePagination) */
export const WithPagination: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows" :page-size="3" load-mode="pagination" />`,
			},
		},
	},
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		pageSize: 3,
		loadMode: 'pagination',
	},
}

/** С настройками колонок (BaseDropdown) */
export const WithColumnSettings: Story = {
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		hasColumnSettings: true,
	},
}

/** С номерами строк */
export const WithRowNumbers: Story = {
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		hasRowNumber: true,
	},
}

/** С бесконечной подгрузкой */
export const WithInfiniteScroll: Story = {
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		height: '300px',
		loadMode: 'infinite',
	},
}

/** С кнопкой «Загрузить ещё» */
export const WithLoadMore: Story = {
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		loadMode: 'button',
	},
}

/** С кастомным слотом pagination */
export const WithPaginationSlot: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows" :page-size="3" load-mode="pagination">
	<template #pagination="{ currentPage, totalPages, paginationInfo }">
		<div>Страница {{ currentPage }} из {{ totalPages }} — {{ paginationInfo }}</div>
	</template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		pageSize: 3,
		loadMode: 'pagination',
	},
	render: args => ({
		components: { BaseTable, BaseButton, BaseText },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #pagination="{ currentPage, totalPages, paginationInfo, visiblePages }">
					<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-top:1px solid var(--color-border);background-color:var(--color-surface-muted);">
						<BaseText tag="span" style="font-size:12px;color:var(--color-text-muted);">{{ paginationInfo }}</BaseText>
						<div style="display:flex;gap:4px;">
							<BaseText tag="span" style="font-size:12px;color:var(--color-text-muted);">Страница {{ currentPage }} из {{ totalPages }}</BaseText>
						</div>
					</div>
				</template>
			</BaseTable>
		`,
	}),
}

/** С вложенными таблицами (плавное раскрытие) */
export const Nested: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows" :nested-config="nestedConfig" variant="bordered" />`,
			},
		},
	},
	args: {
		columns: COLUMNS,
		rows: [
			{
				id: 1,
				data: { id: 1, name: 'Роза', material: 'Сталь', price: 15000 },
				children: [
					{ id: 101, data: { id: 101, name: 'Роза мини', material: 'Сталь', price: 5000 } },
					{ id: 102, data: { id: 102, name: 'Роза большая', material: 'Сталь', price: 10000 } },
				],
			},
			{
				id: 2,
				data: { id: 2, name: 'Орёл', material: 'Бронза', price: 35000 },
				children: [
					{ id: 201, data: { id: 201, name: 'Орёл малый', material: 'Бронза', price: 15000 } },
					{ id: 202, data: { id: 202, name: 'Орёл средний', material: 'Бронза', price: 20000 } },
				],
			},
			{ id: 3, data: { id: 3, name: 'Дерево', material: 'Железо', price: 8000 } },
		],
		nestedConfig: {
			columns: COLUMNS,
			childrenKey: 'children',
			title: 'Составные части',
		},
		variant: 'bordered',
	},
}

/** С кастомным footer-слотом */
export const WithFooterSlot: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
	<template #footer>
		<div>Кастомный footer</div>
	</template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
	},
	render: args => ({
		components: { BaseTable },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #footer>
					<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-top:1px solid var(--color-border);background-color:var(--color-surface-muted);">
						<span style="font-size:12px;color:var(--color-text-muted);">Кастомный footer</span>
						<span style="font-size:12px;color:var(--color-text-muted);">Всего записей</span>
					</div>
				</template>
			</BaseTable>
		`,
	}),
}

/** С кастомным empty-слотом */
export const WithEmptySlot: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="[]">
	<template #empty>
		<div>Данных нет</div>
	</template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: EXTENDED_COLUMNS,
		rows: [],
	},
	render: args => ({
		components: { BaseTable },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #empty>
					<div style="padding:24px;text-align:center;">
						<p style="margin:0 0 8px;font-size:16px;font-weight:600;color:var(--color-text-muted);">Данных нет</p>
						<p style="margin:0;font-size:13px;color:var(--color-text-muted);">Добавьте первую запись</p>
					</div>
				</template>
			</BaseTable>
		`,
	}),
}

/** Интерактивные состояния */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseTable },
		setup() {
			return { columns: COLUMNS, rows: ROWS }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<div>
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">Normal</p>
					<BaseTable :columns="columns" :rows="rows" />
				</div>
				<div>
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">Hover</p>
					<BaseTable :columns="columns" :rows="rows" class="base-table--hover" />
				</div>
				<div>
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">Focus</p>
					<BaseTable :columns="columns" :rows="rows" class="base-table--focus" />
				</div>
			</div>
		`,
	}),
}

/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: {
		variant: 'bordered',
	},
}

/** Со статусами в виде BaseBadge */
export const WithBadges: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
		<template #cell-status="{ value }">
			 <BaseBadge variant="soft" :color="statusColor(value)" :size-scale="80">{{ value }}</BaseBadge>
		</template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: EXTENDED_COLUMNS,
		rows: EXTENDED_ROWS,
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseBadge },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
					<template #cell-status="{ value }">
						<BaseBadge
							variant="soft"
							:color="value === 'В наличии' ? { bg: { base: '#dcfce7' }, text: { base: '#16a34a' } } : value === 'Под заказ' ? { bg: { base: '#fef9c3' }, text: { base: '#ca8a04' } } : { bg: { base: '#fee2e2' }, text: { base: '#dc2626' } }"
							:size-scale="80">
							{{ value }}
						</BaseBadge>
					</template>
				</BaseTable>
		`,
	}),
}

/** С прогрессом выполнения (BaseProgress) */
export const WithProgress: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
  <template #cell-progress="{ value }">
    <BaseProgress :value="value" :size-scale="80" variant="accent" />
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'id', label: 'ID', width: '60px', sortType: 'number', isSortable: true },
			{ key: 'task', label: 'Задача', sortType: 'string', isSortable: true },
			{ key: 'progress', label: 'Прогресс', width: '160px' },
			{ key: 'assignee', label: 'Исполнитель', sortType: 'string', isSortable: true },
		] as TableColumn[],
		rows: [
			{ id: 1, data: { id: 1, task: 'Литьё формы', progress: 85, assignee: 'Иванов А.' } },
			{ id: 2, data: { id: 2, task: 'Сварка каркаса', progress: 42, assignee: 'Петров Б.' } },
			{ id: 3, data: { id: 3, task: 'Покраска изделия', progress: 100, assignee: 'Сидоров В.' } },
			{ id: 4, data: { id: 4, task: 'Сборка деталей', progress: 15, assignee: 'Козлов Д.' } },
			{ id: 5, data: { id: 5, task: 'Полировка поверхности', progress: 67, assignee: 'Новиков Е.' } },
			{ id: 6, data: { id: 6, task: 'Упаковка', progress: 0, assignee: 'Морозов Ж.' } },
		] as TableRow[],
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseProgress, BaseBadge },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-progress="{ value }">
					<div style="display:flex;align-items:center;gap:8px;">
						<BaseProgress :value="value" :size-scale="80" style="flex:1;" />
						<span style="font-size:11px;color:var(--color-text-muted);min-width:32px;text-align:right;">{{ value }}%</span>
					</div>
				</template>
			</BaseTable>
		`,
	}),
}

/** С кнопками действий (BaseButton) */
export const WithActions: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
  <template #cell-actions="{ row }">
    <BaseButton size="xs" variant="ghost">Открыть</BaseButton>
    <BaseButton size="xs" variant="ghost">Удалить</BaseButton>
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'id', label: 'ID', width: '60px', sortType: 'number', isSortable: true },
			{ key: 'name', label: 'Название', sortType: 'string', isSortable: true },
			{ key: 'material', label: 'Материал', sortType: 'string', isSortable: true },
			{ key: 'price', label: 'Цена', width: '100px', sortType: 'number', isSortable: true, align: 'right' },
			{ key: 'actions', label: '', width: '140px', align: 'center' },
		] as TableColumn[],
		rows: EXTENDED_ROWS,
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseButton, BaseIcon },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-actions="{ row }">
					<div style="display:flex;gap:4px;justify-content:center;">
						<BaseButton size="xs" variant="ghost">
							<BaseIcon name="search" size="xs" />
						</BaseButton>
						<BaseButton size="xs" variant="ghost">
							<BaseIcon name="close" size="xs" />
						</BaseButton>
					</div>
				</template>
			</BaseTable>
		`,
	}),
}

/** С аватарами (BaseAvatar) */
export const WithAvatars: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
  <template #cell-user="{ row }">
    <div style="display:flex;align-items:center;gap:8px;">
      <BaseAvatar size="xs" :alt="row.data.user" />
      <span>{{ row.data.user }}</span>
    </div>
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'user', label: 'Пользователь', sortType: 'string', isSortable: true },
			{ key: 'role', label: 'Роль', sortType: 'string', isSortable: true },
			{ key: 'status', label: 'Статус', width: '120px' },
			{ key: 'lastLogin', label: 'Последний вход', width: '140px', sortType: 'date', isSortable: true },
		] as TableColumn[],
		rows: [
			{ id: 1, data: { user: 'Иванов Алексей', role: 'Администратор', status: 'Онлайн', lastLogin: '2024-06-15' } },
			{ id: 2, data: { user: 'Петрова Мария', role: 'Мастер', status: 'Офлайн', lastLogin: '2024-06-14' } },
			{ id: 3, data: { user: 'Сидоров Дмитрий', role: 'Оператор', status: 'Онлайн', lastLogin: '2024-06-15' } },
			{ id: 4, data: { user: 'Козлова Анна', role: 'Мастер', status: 'Перерыв', lastLogin: '2024-06-15' } },
			{ id: 5, data: { user: 'Новиков Сергей', role: 'Оператор', status: 'Офлайн', lastLogin: '2024-06-10' } },
		] as TableRow[],
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseAvatar, BaseBadge },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-user="{ row }">
					<div style="display:flex;align-items:center;gap:8px;">
						<BaseAvatar :size-scale="80" :alt="String(row.data.user)" />
						<span>{{ row.data.user }}</span>
					</div>
				</template>
				<template #cell-status="{ value }">
						<BaseBadge
							variant="soft"
							:color="value === 'Онлайн' ? { bg: { base: '#dcfce7' }, text: { base: '#16a34a' } } : value === 'Перерыв' ? { bg: { base: '#fef9c3' }, text: { base: '#ca8a04' } } : { bg: { base: '#fee2e2' }, text: { base: '#dc2626' } }"
							:size-scale="80">
							{{ value }}
						</BaseBadge>
					</template>
			</BaseTable>
		`,
	}),
}

/** Дашборд заказов — комплексная таблица */
export const OrdersDashboard: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows" variant="bordered" has-search has-filters is-selectable has-row-number page-size="5" load-mode="pagination">
  <template #cell-status="{ value }">
    <BaseBadge :variant="..." :size-scale="80">{{ value }}</BaseBadge>
  </template>
  <template #cell-progress="{ value }">
    <BaseProgress :value="value" :size-scale="80" />
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'order', label: 'Заказ', width: '80px', sortType: 'number', isSortable: true },
			{ key: 'client', label: 'Клиент', sortType: 'string', isSortable: true },
			{ key: 'product', label: 'Изделие', sortType: 'string', isSortable: true },
			{ key: 'status', label: 'Статус', width: '120px' },
			{ key: 'progress', label: 'Готовность', width: '150px' },
			{ key: 'price', label: 'Сумма', width: '100px', sortType: 'number', isSortable: true, align: 'right' },
		] as TableColumn[],
		rows: [
			{
				id: 1,
				data: {
					order: 1001,
					client: 'Галерея «Арт»',
					product: 'Роза стальная',
					status: 'В работе',
					progress: 65,
					price: 15000,
				},
			},
			{
				id: 2,
				data: {
					order: 1002,
					client: 'Иванов А.П.',
					product: 'Орёл бронзовый',
					status: 'Завершён',
					progress: 100,
					price: 35000,
				},
			},
			{
				id: 3,
				data: {
					order: 1003,
					client: 'Музей «Металл»',
					product: 'Дерево жизни',
					status: 'Ожидание',
					progress: 10,
					price: 80000,
				},
			},
			{
				id: 4,
				data: {
					order: 1004,
					client: 'Козлова М.И.',
					product: 'Лев медный',
					status: 'В работе',
					progress: 42,
					price: 22000,
				},
			},
			{
				id: 5,
				data: {
					order: 1005,
					client: 'ООО «Прометей»',
					product: 'Волк стальной',
					status: 'Завершён',
					progress: 100,
					price: 18000,
				},
			},
			{
				id: 6,
				data: {
					order: 1006,
					client: 'Петров С.В.',
					product: 'Кот бронзовый',
					status: 'Отменён',
					progress: 0,
					price: 12000,
				},
			},
			{
				id: 7,
				data: {
					order: 1007,
					client: 'Галерея «Модерн»',
					product: 'Ворон железный',
					status: 'В работе',
					progress: 78,
					price: 9500,
				},
			},
			{
				id: 8,
				data: {
					order: 1008,
					client: 'Сидоров К.Л.',
					product: 'Конь медный',
					status: 'Ожидание',
					progress: 5,
					price: 42000,
				},
			},
			{
				id: 9,
				data: {
					order: 1009,
					client: 'АО «Кованый мир»',
					product: 'Роза мини',
					status: 'Завершён',
					progress: 100,
					price: 5000,
				},
			},
			{
				id: 10,
				data: {
					order: 1010,
					client: 'Николаев Д.А.',
					product: 'Дракон стальной',
					status: 'В работе',
					progress: 33,
					price: 55000,
				},
			},
		] as TableRow[],
		variant: 'bordered',
		hasSearch: true,
		hasFilters: true,
		isSelectable: true,
		hasRowNumber: true,
		pageSize: 5,
		pageSizeOptions: [5, 10],
		loadMode: 'pagination',
	},
	render: args => ({
		components: { BaseTable, BaseBadge, BaseProgress },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-status="{ value }">
						<BaseBadge
							variant="soft"
							:color="value === 'Завершён' ? { bg: { base: '#dcfce7' }, text: { base: '#16a34a' } } : value === 'В работе' ? { bg: { base: '#fef9c3' }, text: { base: '#ca8a04' } } : value === 'Ожидание' ? { bg: { base: '#dbeafe' }, text: { base: '#2563eb' } } : { bg: { base: '#fee2e2' }, text: { base: '#dc2626' } }"
							:size-scale="80">
							{{ value }}
						</BaseBadge>
					</template>
				<template #cell-progress="{ value }">
					<div style="display:flex;align-items:center;gap:8px;">
						<BaseProgress :value="value" :size-scale="80" style="flex:1;" />
						<span style="font-size:11px;color:var(--color-text-muted);min-width:32px;text-align:right;">{{ value }}%</span>
					</div>
				</template>
				<template #cell-price="{ value }">
					{{ value.toLocaleString('ru-RU') }} ₽
				</template>
			</BaseTable>
		`,
	}),
}

/** С кастомными слотами header и footer */
export const WithHeaderFooterSlots: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
  <template #header>
    <div>Заголовок таблицы</div>
  </template>
  <template #footer>
    <div>Итого: ...</div>
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'id', label: 'ID', width: '60px', sortType: 'number', isSortable: true },
			{ key: 'name', label: 'Название', sortType: 'string', isSortable: true },
			{ key: 'price', label: 'Цена', width: '100px', sortType: 'number', isSortable: true, align: 'right' },
		] as TableColumn[],
		rows: EXTENDED_ROWS,
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseText, BaseBadge },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #header>
					<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background-color:var(--color-surface-muted);border:1px solid var(--color-border);border-bottom:none;border-radius:var(--border-radius-lg) var(--border-radius-lg) 0 0;">
						<div style="display:flex;align-items:center;gap:8px;">
							<BaseText tag="h3" style="margin:0;font-size:15px;font-weight:600;">Каталог изделий</BaseText>
							<BaseBadge variant="soft" :size-scale="80">8 позиций</BaseBadge>
						</div>
					</div>
				</template>
				<template #cell-price="{ value }">
					{{ value.toLocaleString('ru-RU') }} ₽
				</template>
				<template #footer>
					<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border:1px solid var(--color-border);border-top:none;border-radius:0 0 var(--border-radius-lg) var(--border-radius-lg);background-color:var(--color-surface-muted);">
						<BaseText tag="span" style="font-size:12px;color:var(--color-text-muted);">Обновлено 15.06.2024</BaseText>
						<BaseText tag="span" style="font-size:12px;color:var(--color-text-muted);">Показано 8 из 8</BaseText>
					</div>
				</template>
			</BaseTable>
		`,
	}),
}

/** С изображениями изделий (BaseImage) */
export const WithImages: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
  <template #cell-image="{ value }">
    <BaseImage :src="value" alt="" width="48" height="48" border-radius="sm" fit="cover" :size-scale="80" />
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'image', label: 'Фото', width: '150px', align: 'center' },
			{ key: 'name', label: 'Название', sortType: 'string', isSortable: true },
			{ key: 'material', label: 'Материал', sortType: 'string', isSortable: true },
			{ key: 'price', label: 'Цена', width: '100px', sortType: 'number', isSortable: true, align: 'right' },
		] as TableColumn[],
		rows: [
			{
				id: 1,
				data: {
					image: 'https://i.pinimg.com/originals/15/f6/a3/15f6a3aac562ee0fadbbad3d4cdf47bc.jpg?nii=t',
					name: 'Роза',
					material: 'Сталь',
					price: 15000,
				},
			},
			{
				id: 2,
				data: {
					image:
						'https://avatars.mds.yandex.net/i?id=7ea916047f73e82ac673d2828271b629c468d4b8-4069527-images-thumbs&n=13',
					name: 'Орёл',
					material: 'Бронза',
					price: 35000,
				},
			},
			{
				id: 3,
				data: {
					image:
						'https://avatars.mds.yandex.net/i?id=d5ddd265fa718298bf72ad1b1b78847f79a9d41a-3719127-images-thumbs&n=13',
					name: 'Дерево',
					material: 'Железо',
					price: 8000,
				},
			},
			{ id: 4, data: { image: '/api/paintings/lion.jpg', name: 'Лев', material: 'Медь', price: 22000 } },
			{ id: 5, data: { image: '/api/paintings/wolf.jpg', name: 'Волк', material: 'Сталь', price: 18000 } },
		] as TableRow[],
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseImage },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-image="{ value }">
					<BaseImage :src="value" alt="" hasZoom="true" width="100%" height="100%"  border-radius="sm" fit="cover" :size-scale="80" />
				</template>
				<template #cell-price="{ value }">
					{{ value.toLocaleString('ru-RU') }} ₽
				</template>
			</BaseTable>
		`,
	}),
}

/** Все варианты BaseBadge в ячейках */
export const WithBadgeVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
  <template #cell-status="{ value }">
    <BaseBadge :variant="badgeVariant(value)" :size-scale="80">{{ value }}</BaseBadge>
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'name', label: 'Изделие', sortType: 'string', isSortable: true },
			{ key: 'statusDefault', label: 'Default', width: '110px', align: 'center' },
			{ key: 'statusGhost', label: 'Ghost', width: '110px', align: 'center' },
			{ key: 'statusOutline', label: 'Outline', width: '110px', align: 'center' },
			{ key: 'statusShadow', label: 'Shadow', width: '110px', align: 'center' },
			{ key: 'statusSoft', label: 'Soft', width: '110px', align: 'center' },
		] as TableColumn[],
		rows: [
			{
				id: 1,
				data: {
					name: 'Роза',
					statusDefault: 'В наличии',
					statusGhost: 'В наличии',
					statusOutline: 'В наличии',
					statusShadow: 'В наличии',
					statusSoft: 'В наличии',
				},
			},
			{
				id: 2,
				data: {
					name: 'Орёл',
					statusDefault: 'Под заказ',
					statusGhost: 'Под заказ',
					statusOutline: 'Под заказ',
					statusShadow: 'Под заказ',
					statusSoft: 'Под заказ',
				},
			},
			{
				id: 3,
				data: {
					name: 'Дерево',
					statusDefault: 'Продано',
					statusGhost: 'Продано',
					statusOutline: 'Продано',
					statusShadow: 'Продано',
					statusSoft: 'Продано',
				},
			},
			{
				id: 4,
				data: {
					name: 'Лев',
					statusDefault: 'В работе',
					statusGhost: 'В работе',
					statusOutline: 'В работе',
					statusShadow: 'В работе',
					statusSoft: 'В работе',
				},
			},
			{
				id: 5,
				data: {
					name: 'Волк',
					statusDefault: 'Ожидание',
					statusGhost: 'Ожидание',
					statusOutline: 'Ожидание',
					statusShadow: 'Ожидание',
					statusSoft: 'Ожидание',
				},
			},
		] as TableRow[],
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseBadge },
		setup() {
			const statusColor = (value: string) => {
				const map: Record<string, { bg: { base: string }; text: { base: string } }> = {
					'В наличии': { bg: { base: '#dcfce7' }, text: { base: '#16a34a' } },
					'Под заказ': { bg: { base: '#fef9c3' }, text: { base: '#ca8a04' } },
					Продано: { bg: { base: '#fee2e2' }, text: { base: '#dc2626' } },
					'В работе': { bg: { base: '#dbeafe' }, text: { base: '#2563eb' } },
					Ожидание: { bg: { base: '#f3e8ff' }, text: { base: '#9333ea' } },
				}
				return map[value] ?? { bg: { base: '#f1f5f9' }, text: { base: '#64748b' } }
			}
			return { args, statusColor }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-statusDefault="{ value }">
					<BaseBadge variant="default" :color="statusColor(value)" :size-scale="80">{{ value }}</BaseBadge>
				</template>
				<template #cell-statusGhost="{ value }">
					<BaseBadge variant="ghost" :color="statusColor(value)" :size-scale="80">{{ value }}</BaseBadge>
				</template>
				<template #cell-statusOutline="{ value }">
					<BaseBadge variant="outline" :color="statusColor(value)" :size-scale="80">{{ value }}</BaseBadge>
				</template>
				<template #cell-statusShadow="{ value }">
					<BaseBadge variant="shadow" :color="statusColor(value)" :size-scale="80">{{ value }}</BaseBadge>
				</template>
				<template #cell-statusSoft="{ value }">
					<BaseBadge variant="soft" :color="statusColor(value)" :size-scale="80">{{ value }}</BaseBadge>
				</template>
			</BaseTable>
		`,
	}),
}

/** Все варианты BaseAvatar в ячейках */
export const WithAvatarVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
  <template #cell-user="{ row }">
    <div style="display:flex;align-items:center;gap:8px;">
      <BaseAvatar :name="row.data.user" variant="soft" shape="circle" :is-online="row.data.isOnline" :size-scale="80" />
      <span>{{ row.data.user }}</span>
    </div>
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'userCircle', label: 'Circle', width: '160px' },
			{ key: 'userSquare', label: 'Square', width: '160px' },
			{ key: 'role', label: 'Роль', sortType: 'string', isSortable: true },
			{ key: 'variant', label: 'Вариант', width: '100px', align: 'center' },
		] as TableColumn[],
		rows: [
			{
				id: 1,
				data: {
					userCircle: 'Иванов А.',
					userSquare: 'Иванов А.',
					role: 'Администратор',
					variant: 'default',
					isOnline: true,
				},
			},
			{
				id: 2,
				data: { userCircle: 'Петрова М.', userSquare: 'Петрова М.', role: 'Мастер', variant: 'ghost', isOnline: false },
			},
			{
				id: 3,
				data: {
					userCircle: 'Сидоров Д.',
					userSquare: 'Сидоров Д.',
					role: 'Оператор',
					variant: 'outline',
					isOnline: true,
				},
			},
			{
				id: 4,
				data: {
					userCircle: 'Козлова А.',
					userSquare: 'Козлова А.',
					role: 'Мастер',
					variant: 'shadow',
					isOnline: false,
				},
			},
			{
				id: 5,
				data: { userCircle: 'Новиков С.', userSquare: 'Новиков С.', role: 'Оператор', variant: 'soft', isOnline: true },
			},
		] as TableRow[],
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseAvatar, BaseBadge },
		setup() {
			const variants = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const
			return { args, variants }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-userCircle="{ row }">
					<div style="display:flex;align-items:center;gap:8px;">
						<BaseAvatar :name="row.data.userCircle" :variant="row.data.variant" shape="circle" :is-online="row.data.isOnline" :size-scale="80" />
						<span>{{ row.data.userCircle }}</span>
					</div>
				</template>
				<template #cell-userSquare="{ row }">
					<div style="display:flex;align-items:center;gap:8px;">
						<BaseAvatar :name="row.data.userSquare" :variant="row.data.variant" shape="square" :is-online="row.data.isOnline" :size-scale="80" />
						<span>{{ row.data.userSquare }}</span>
					</div>
				</template>
				<template #cell-variant="{ row }">
					<BaseBadge variant="soft" :size-scale="80">{{ row.data.variant }}</BaseBadge>
				</template>
			</BaseTable>
		`,
	}),
}

/** С переключателями BaseSwitch (нередактируемые) */
export const WithSwitch: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows">
  <template #cell-enabled="{ value }">
    <BaseSwitch :model-value="value" is-disabled :size-scale="80" />
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'name', label: 'Параметр', sortType: 'string', isSortable: true },
			{ key: 'enabled', label: 'Включён', width: '100px', align: 'center' },
			{ key: 'variant', label: 'Вариант', width: '100px', align: 'center' },
			{ key: 'description', label: 'Описание' },
		] as TableColumn[],
		rows: [
			{
				id: 1,
				data: { name: 'Уведомления', enabled: true, variant: 'default', description: 'Email и push-уведомления' },
			},
			{
				id: 2,
				data: { name: 'Автосохранение', enabled: true, variant: 'outline', description: 'Сохранение черновиков' },
			},
			{ id: 3, data: { name: 'Тёмная тема', enabled: false, variant: 'shadow', description: 'Переключение темы' } },
			{
				id: 4,
				data: {
					name: 'Двухфакторная аутентификация',
					enabled: true,
					variant: 'default',
					description: 'SMS-подтверждение входа',
				},
			},
			{
				id: 5,
				data: {
					name: 'Публичный профиль',
					enabled: false,
					variant: 'outline',
					description: 'Видимость профиля для всех',
				},
			},
			{
				id: 6,
				data: { name: 'Аналитика', enabled: true, variant: 'shadow', description: 'Сбор статистики посещений' },
			},
		] as TableRow[],
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseSwitch, BaseBadge },
		setup() {
			return { args }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-enabled="{ value }">
					<BaseSwitch :model-value="value" is-disabled :size-scale="80" />
				</template>
				<template #cell-variant="{ value }">
					<BaseBadge variant="soft" :size-scale="80">{{ value }}</BaseBadge>
				</template>
			</BaseTable>
		`,
	}),
}

/** Комплексная таблица: Image + Avatar + Badge + Switch */
export const RichContent: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :columns="columns" :rows="rows" variant="bordered">
  <template #cell-image="{ value }">
    <BaseImage :src="value" alt="" width="40" height="40" border-radius="sm" fit="cover" :size-scale="80" />
  </template>
  <template #cell-author="{ row }">
    <div style="display:flex;align-items:center;gap:8px;">
      <BaseAvatar :name="row.data.author" variant="soft" :is-online="row.data.isOnline" :size-scale="80" />
      <span>{{ row.data.author }}</span>
    </div>
  </template>
  <template #cell-status="{ value }">
    <BaseBadge variant="soft" :color="statusColor(value)" :size-scale="80">{{ value }}</BaseBadge>
  </template>
  <template #cell-published="{ value }">
    <BaseSwitch :model-value="value" is-disabled :size-scale="80" />
  </template>
</BaseTable>`,
			},
		},
	},
	args: {
		columns: [
			{ key: 'image', label: '', width: '60px', align: 'center' },
			{ key: 'title', label: 'Изделие', sortType: 'string', isSortable: true },
			{ key: 'author', label: 'Автор', sortType: 'string', isSortable: true },
			{ key: 'status', label: 'Статус', width: '120px', align: 'center' },
			{ key: 'published', label: 'Опубликован', width: '110px', align: 'center' },
			{ key: 'price', label: 'Цена', width: '100px', sortType: 'number', isSortable: true, align: 'right' },
		] as TableColumn[],
		rows: [
			{
				id: 1,
				data: {
					image: '/api/paintings/rose.jpg',
					title: 'Роза стальная',
					author: 'Иванов А.',
					status: 'В наличии',
					published: true,
					price: 15000,
					isOnline: true,
				},
			},
			{
				id: 2,
				data: {
					image: '/api/paintings/eagle.jpg',
					title: 'Орёл бронзовый',
					author: 'Петрова М.',
					status: 'Под заказ',
					published: true,
					price: 35000,
					isOnline: false,
				},
			},
			{
				id: 3,
				data: {
					image: '/api/paintings/tree.jpg',
					title: 'Дерево жизни',
					author: 'Сидоров Д.',
					status: 'Продано',
					published: false,
					price: 80000,
					isOnline: true,
				},
			},
			{
				id: 4,
				data: {
					image: '/api/paintings/lion.jpg',
					title: 'Лев медный',
					author: 'Козлова А.',
					status: 'В работе',
					published: false,
					price: 22000,
					isOnline: false,
				},
			},
			{
				id: 5,
				data: {
					image: '/api/paintings/wolf.jpg',
					title: 'Волк стальной',
					author: 'Новиков С.',
					status: 'В наличии',
					published: true,
					price: 18000,
					isOnline: true,
				},
			},
			{
				id: 6,
				data: {
					image: '/api/paintings/cat.jpg',
					title: 'Кот бронзовый',
					author: 'Морозов Ж.',
					status: 'Ожидание',
					published: false,
					price: 12000,
					isOnline: false,
				},
			},
		] as TableRow[],
		variant: 'bordered',
	},
	render: args => ({
		components: { BaseTable, BaseImage, BaseAvatar, BaseBadge, BaseSwitch },
		setup() {
			const statusColor = (value: string) => {
				const map: Record<string, { bg: { base: string }; text: { base: string } }> = {
					'В наличии': { bg: { base: '#dcfce7' }, text: { base: '#16a34a' } },
					'Под заказ': { bg: { base: '#fef9c3' }, text: { base: '#ca8a04' } },
					Продано: { bg: { base: '#fee2e2' }, text: { base: '#dc2626' } },
					'В работе': { bg: { base: '#dbeafe' }, text: { base: '#2563eb' } },
					Ожидание: { bg: { base: '#f3e8ff' }, text: { base: '#9333ea' } },
				}
				return map[value] ?? { bg: { base: '#f1f5f9' }, text: { base: '#64748b' } }
			}
			return { args, statusColor }
		},
		template: `
			<BaseTable v-bind="args">
				<template #cell-image="{ value }">
					<BaseImage :src="value" alt="" width="40" height="40" border-radius="sm" fit="cover" :size-scale="80" />
				</template>
				<template #cell-author="{ row }">
					<div style="display:flex;align-items:center;gap:8px;">
						<BaseAvatar :name="row.data.author" variant="soft" :is-online="row.data.isOnline" :size-scale="80" />
						<span>{{ row.data.author }}</span>
					</div>
				</template>
				<template #cell-status="{ value }">
					<BaseBadge variant="soft" :color="statusColor(value)" :size-scale="80">{{ value }}</BaseBadge>
				</template>
				<template #cell-published="{ value }">
					<BaseSwitch :model-value="value" is-disabled :size-scale="80" />
				</template>
				<template #cell-price="{ value }">
					{{ value.toLocaleString('ru-RU') }} ₽
				</template>
			</BaseTable>
		`,
	}),
}

/** Настройка padding ячеек */
export const Paddings: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseTable :padding="4">...</BaseButton>\n<BaseTable :padding="10">...</BaseButton>\n<BaseTable :padding="18">...</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup() {
			const paddings = [4, 8, 10, 14, 18]
			return { args, paddings }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 24px;">
				<div v-for="p in paddings" :key="p">
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">padding="{{ p }}" → {{ p }}px {{ p * 2 }}px</p>
					<BaseTable v-bind="args" :padding="p" />
				</div>
			</div>
		`,
	}),
}

/** Интерактивная */
export const Interactive: Story = {}
