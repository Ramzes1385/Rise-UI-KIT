/**
 * BaseTree — stories.
 *
 * Разделы: Default (песочница с v-model раскрытых и выбранных узлов) → внешний вид (варианты, размеры, цвет, стрелка
 * справа) → состояния (отключённый узел, пусто, длинные метки) → сценарии (режимы выбора, слоты, управление
 * раскрытием, навигация по ссылкам) → клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseIcon } from '@components/BaseIcon'
import { TREE_VARIANTS } from '../model/BaseTree.types'
import BaseTree from '../ui/BaseTree.vue'
import type { TreeNode } from '../model/BaseTree.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

// ─── Данные ────────────────────────────────────────────────────────────────────

/** Структура проекта: папки и файлы с иконками */
const FILES: TreeNode[] = [
	{
		id: 'src',
		label: 'src',
		icon: 'folder',
		children: [
			{
				id: 'components',
				label: 'components',
				icon: 'folder',
				children: [
					{ id: 'app-header', label: 'AppHeader.vue', icon: 'file-vue' },
					{ id: 'user-card', label: 'UserCard.vue', icon: 'file-vue' },
				],
			},
			{
				id: 'composables',
				label: 'composables',
				icon: 'folder',
				children: [
					{ id: 'use-auth', label: 'useAuth.ts', icon: 'file-ts' },
					{ id: 'use-api', label: 'useApi.ts', icon: 'file-ts' },
				],
			},
			{ id: 'app-vue', label: 'App.vue', icon: 'file-vue' },
			{ id: 'main-ts', label: 'main.ts', icon: 'file-ts' },
		],
	},
	{
		id: 'public',
		label: 'public',
		icon: 'folder',
		children: [
			{ id: 'favicon', label: 'favicon.svg', icon: 'file-svg' },
			{ id: 'robots', label: 'robots.txt', icon: 'file-txt' },
		],
	},
	{ id: 'package-json', label: 'package.json', icon: 'file-json' },
	{ id: 'readme', label: 'README.md', icon: 'file-md' },
]

/** Все папки дерева — для «Развернуть всё» */
function folderIds(nodes: readonly TreeNode[]): string[] {
	return nodes.flatMap(node => (node.children?.length ? [node.id, ...folderIds(node.children)] : []))
}

/** Документы с разделом без доступа: единственный отключённый узел — в корне */
const DOCUMENTS: TreeNode[] = [
	{
		id: 'docs',
		label: 'Документы',
		icon: 'folder',
		children: [
			{
				id: 'contracts',
				label: 'Договоры',
				icon: 'folder',
				children: [
					{ id: 'contract-1', label: 'Договор поставки.pdf', icon: 'file' },
					{ id: 'contract-2', label: 'Договор аренды.pdf', icon: 'file' },
				],
			},
			{ id: 'report', label: 'Отчёт за май.pdf', icon: 'file' },
		],
	},
	{
		id: 'archive',
		label: 'Архив — нет доступа',
		icon: 'folder',
		isDisabled: true,
		children: [{ id: 'archive-2019', label: '2019.zip', icon: 'file' }],
	},
	{
		id: 'photos',
		label: 'Фото',
		icon: 'folder',
		children: [{ id: 'photo-1', label: 'Офис.jpg', icon: 'file-img' }],
	},
]

/** Навигация по документации: страницы — маршруты (`to`), внешний адрес (`href`) открывается в новой вкладке */
const DOCS_NAV: TreeNode[] = [
	{ id: 'intro', label: 'Введение', icon: 'home', to: '/docs/intro' },
	{
		id: 'components',
		label: 'Компоненты',
		icon: 'folder',
		to: '/docs/components',
		children: [
			{ id: 'button', label: 'Кнопка', icon: 'file-md', to: '/docs/components/button' },
			{ id: 'input', label: 'Поле ввода', icon: 'file-md', to: '/docs/components/input' },
			{ id: 'tree', label: 'Дерево', icon: 'file-md', to: '/docs/components/tree' },
		],
	},
	{ id: 'changelog', label: 'Изменения', icon: 'file-md', to: '/docs/changelog' },
	{ id: 'github', label: 'Исходный код', icon: 'link', href: 'https://github.com', target: '_blank' },
]

/** Длинные названия и глубокая вложенность */
const DEEP: TreeNode[] = [
	{
		id: 'l1',
		label: 'Годовой отчёт о финансово-хозяйственной деятельности за 2024 год',
		icon: 'folder',
		children: [
			{
				id: 'l2',
				label: 'Приложения к отчёту',
				icon: 'folder',
				children: [
					{
						id: 'l3',
						label: 'Бухгалтерская отчётность',
						icon: 'folder',
						children: [
							{
								id: 'l4',
								label: 'Пояснения к бухгалтерскому балансу и отчёту о финансовых результатах.xlsx',
								icon: 'file',
							},
						],
					},
				],
			},
		],
	},
]

/** Метка узла в дереве (без скрытой подписи чекбокса) */
function nodeLabel(canvasElement: HTMLElement, text: string): HTMLElement {
	const label = [...canvasElement.querySelectorAll<HTMLElement>('.base-tree__label')].find(item => item.textContent?.trim() === text)
	if (!label) throw new Error(`Узел «${text}» не найден`)
	return label
}

/** Строка узла (фокусируемый заголовок) по тексту метки */
function nodeHeader(canvasElement: HTMLElement, text: string): HTMLElement {
	return nodeLabel(canvasElement, text).closest('.base-tree__header') as HTMLElement
}

/** Узел целиком (заголовок и дочерние узлы) по тексту метки */
function treeNode(canvasElement: HTMLElement, text: string): HTMLElement {
	return nodeLabel(canvasElement, text).closest('.base-tree__node') as HTMLElement
}

const meta = {
	title: 'Data/BaseTree',
	component: BaseTree,
	parameters: {
		docs: {
			description: {
				component: [
					'Дерево показывает иерархию: файлы и папки, разделы каталога, структуру организации.',
					'',
					'- Узлы задаёт `items` (`id`, `label`, `icon`, `children`, `isDisabled`, `to`/`href`); дочерние узлы монтируются при первом раскрытии.',
					'- Раскрытие — клик по узлу или шеврону, стрелки ←/→, Enter; `v-model:expanded-ids`, `isDefaultExpandAll` — всё раскрыто сразу.',
					'- Выбор: `selectionMode` `single` — один узел, `multiple` — чекбоксы с выбором всего поддерева; `v-model:selected-ids`.',
					'- Узел с `to` или `href` — ссылка (BaseLink): маршрут открывает RouterLink приложения, внешний адрес — `<a>`.',
					'- Слоты `icon`, `label`, `arrow` меняют части строки, `actions` — кнопки справа (видны при наведении и фокусе).',
					'- Клавиатура по образцу APG Tree View: в порядке Tab один узел, по дереву — стрелки, Home/End, `*` и буквы. Имя дерева — `ariaLabel`.',
					'- Строки 32px как пункты меню; уровень — отступ 20px с направляющей линией.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: TREE_VARIANTS }),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		arrowPosition: { control: 'inline-radio', options: ['left', 'right'], table: propGroup(ARG_GROUP.appearance) },
		selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'], table: propGroup(ARG_GROUP.behavior) },
		expandedIds: { control: 'object', table: propGroup(ARG_GROUP.state) },
		selectedIds: { control: 'object', table: propGroup(ARG_GROUP.state) },
		isDefaultExpandAll: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
		isVirtual: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
		itemSize: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	},
	args: {
		items: FILES,
		ariaLabel: 'Файлы проекта',
		variant: 'default',
		sizeScale: 100,
		selectionMode: 'none',
		arrowPosition: 'left',
		isDefaultExpandAll: false,
		expandedIds: ['src'],
		selectedIds: [],
		onToggle: fn(),
		onSelect: fn(),
		'onUpdate:expandedIds': fn(),
		'onUpdate:selectedIds': fn(),
	},
	// Раскрытые и выбранные узлы хранятся в args: клик по дереву обновляет Controls, а изменение в Controls — дерево.
	render: args => {
		const onExpanded = useModelArg('expandedIds')
		const onSelected = useModelArg('selectedIds')
		return {
			components: { BaseTree },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onExpanded, onSelected }),
			template: '<div class="story-narrow"><BaseTree v-bind="props" @update:expanded-ids="onExpanded" @update:selected-ids="onSelected" /></div>',
		}
	},
} satisfies Meta<typeof BaseTree>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: клик по папке раскрывает её, раскрытые узлы попадают в `expandedIds` (видно в Controls). */
export const Default: Story = {
	play: async ({ canvasElement, userEvent, args }) => {
		await userEvent.click(nodeHeader(canvasElement, 'components'))
		await expect(treeNode(canvasElement, 'components')).toHaveClass('base-tree__node--expanded')
		await waitFor(() => expect(nodeLabel(canvasElement, 'UserCard.vue')).toBeVisible())
		await expect(args.onToggle).toHaveBeenLastCalledWith('components', true)
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов: `default` — без контейнера, `ghost` — ещё и без внутреннего отступа (дерево в боковой панели),
 * `outline` — рамка, `shadow` — рамка и тень, `soft` — мягкий фон. Строки узлов одинаковые во всех вариантах.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'selectionMode', 'arrowPosition'] },
		docs: { source: { code: TREE_VARIANTS.map(variant => `<BaseTree :items="items" variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseTree },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'expandedIds', 'selectedIds']), variants: TREE_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<div v-for="variant in variants" :key="variant" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ variant }}</span>
					<BaseTree v-bind="props" :variant="variant" :expanded-ids="['src', 'components']" :selected-ids="['user-card']" selection-mode="single" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: высота строки 24, 32 и 40px, отступ уровня и иконки масштабируются вместе с текстом. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant', 'arrowPosition'] },
		docs: { source: { code: ['xs', 'md', 'xl'].map(name => `<BaseTree :items="items" :size-scale="${SIZE_PRESETS.find(p => p.name === name)?.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseTree },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale', 'expandedIds', 'selectedIds']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px;">
				<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseTree v-bind="props" :size-scale="preset.sizeScale" :expanded-ids="['src', 'composables']" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg.base` — фон дерева, `bg.hover` — строка под курсором, `text.base` / `text.hover` —
 * текст узлов. Чекбоксы и содержимое слотов цвет не наследуют.
 */
export const CustomColor: Story = {
	args: {
		variant: 'outline',
		selectionMode: 'multiple',
		expandedIds: ['src', 'composables'],
		selectedIds: ['composables', 'use-auth', 'use-api'],
		color: { bg: { base: '#fefce8', hover: '#fef9c3' }, text: { base: '#713f12', hover: '#422006' } },
	},
	play: async ({ canvasElement }) => {
		const tree = canvasElement.querySelector('.base-tree') as HTMLElement
		await expect(getComputedStyle(tree).backgroundColor).toBe('rgb(254, 252, 232)')
		await expect(getComputedStyle(nodeHeader(canvasElement, 'public')).color).toBe('rgb(113, 63, 18)')
		// Переменные цвета сброшены на чекбоксе: он остаётся в цветах основного цвета темы
		const checkbox = treeNode(canvasElement, 'useAuth.ts').querySelector('.base-tree__checkbox') as HTMLElement
		await expect(getComputedStyle(checkbox).getPropertyValue('--custom-bg')).toBe('')
	},
}

/** Стрелка раскрытия справа (`arrowPosition="right"`): слева остаются только иконки, как в навигационных меню. */
export const ArrowRight: Story = {
	args: { arrowPosition: 'right', expandedIds: ['src', 'components'] },
	play: async ({ canvasElement, userEvent }) => {
		const arrow = treeNode(canvasElement, 'public').querySelector('.base-tree__arrow--right') as HTMLElement
		await userEvent.click(arrow)
		await expect(treeNode(canvasElement, 'public')).toHaveClass('base-tree__node--expanded')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Отключённый узел (`isDisabled`) приглушён и помечен `aria-disabled`: клик и Enter не раскрывают и не выбирают его.
 * Приглушена только его строка — остальное дерево работает как обычно.
 */
export const Disabled: Story = {
	args: { items: DOCUMENTS, expandedIds: undefined, selectionMode: 'single' },
	play: async ({ canvasElement, userEvent, args }) => {
		const header = nodeHeader(canvasElement, 'Архив — нет доступа')
		await expect(header).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(header)
		await expect(treeNode(canvasElement, 'Архив — нет доступа')).not.toHaveClass('base-tree__node--selected')
		await expect(args.onSelect).not.toHaveBeenCalled()
		await expect(args.onToggle).not.toHaveBeenCalled()
	},
}

/**
 * Пустой список: дерево ничего не выводит. Пустое состояние показывает страница — например, `BaseEmpty`
 * вместо дерева, пока узлов нет.
 */
export const Empty: Story = {
	args: { items: [] },
	parameters: {
		docs: {
			source: {
				code: ['<BaseTree v-if="items.length" :items="items" />', '<BaseEmpty v-else variant="soft" icon="folder" title="Папка пуста" description="Загрузите первый файл" />'].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseEmpty },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<div class="story-narrow">
				<BaseTree v-if="props.items.length" v-bind="props" />
				<BaseEmpty v-else variant="soft" icon="folder" title="Папка пуста" description="Загрузите первый файл" />
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('heading', { name: 'Папка пуста' })).toBeVisible()
		await expect(canvasElement.querySelectorAll('.base-tree__header')).toHaveLength(0)
	},
}

/** Длинные метки обрезаются многоточием в одну строку, глубокая вложенность сдвигает узлы на 20px за уровень. */
export const LongContent: Story = {
	args: { items: DEEP, isDefaultExpandAll: true, expandedIds: undefined },
	render: args => ({
		components: { BaseTree },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<div style="width: 300px;"><BaseTree v-bind="props" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const label = nodeLabel(canvasElement, 'Пояснения к бухгалтерскому балансу и отчёту о финансовых результатах.xlsx')
		await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Режимы выбора: `none` — клик только раскрывает папки; `single` — клик выбирает один узел (подсветка primary-soft);
 * `multiple` — чекбоксы, выбор папки отмечает всё её содержимое. Под деревьями — значение `v-model:selected-ids`.
 */
export const SelectionModes: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'arrowPosition'] },
		docs: {
			source: {
				code: [
					'<BaseTree :items="items" />',
					'<BaseTree v-model:selected-ids="selected" :items="items" selection-mode="single" />',
					'<BaseTree v-model:selected-ids="checked" :items="items" selection-mode="multiple" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTree },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['selectionMode', 'expandedIds', 'selectedIds', 'onUpdate:expandedIds', 'onUpdate:selectedIds']),
			// У каждого дерева своё состояние: раскрыта папка src, в single и multiple есть начальный выбор
			expandedNone: ref(['src']),
			expandedSingle: ref(['src']),
			expandedMultiple: ref(['src', 'composables']),
			single: ref(['app-vue']),
			multiple: ref(['composables', 'use-auth', 'use-api']),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<div class="story-stack" style="gap: 8px;">
					<span class="story-label">none</span>
					<BaseTree v-bind="props" v-model:expanded-ids="expandedNone" />
				</div>
				<div class="story-stack" style="gap: 8px;">
					<span class="story-label">single</span>
					<BaseTree v-bind="props" v-model:expanded-ids="expandedSingle" v-model:selected-ids="single" selection-mode="single" />
					<span class="story-label">Выбрано: {{ single.join(', ') || '—' }}</span>
				</div>
				<div class="story-stack" style="gap: 8px;">
					<span class="story-label">multiple</span>
					<BaseTree v-bind="props" v-model:expanded-ids="expandedMultiple" v-model:selected-ids="multiple" selection-mode="multiple" />
					<span class="story-label">Выбрано: {{ multiple.join(', ') || '—' }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const [, singleTree, multipleTree] = canvas.getAllByText(/^(none|single|multiple)$/).map(label => label.nextElementSibling as HTMLElement)
		await userEvent.click(nodeHeader(singleTree, 'package.json'))
		await expect(canvas.getByText('Выбрано: package-json')).toBeVisible()
		await expect(singleTree.querySelectorAll('.base-tree__node--selected')).toHaveLength(1)

		await expect(nodeHeader(singleTree, 'package.json')).toHaveAttribute('aria-selected', 'true')

		// В multiple флажок — только вид: отметку объявляет aria-checked узла, клик по строке отмечает всё поддерево
		await userEvent.click(nodeHeader(multipleTree, 'public'))
		await expect(nodeHeader(multipleTree, 'public')).toHaveAttribute('aria-checked', 'true')
		await expect(canvas.getByText(/Выбрано: composables, use-auth, use-api, public, favicon, robots/)).toBeVisible()
		await expect(multipleTree.querySelectorAll('.base-tree__node--selected').length).toBeGreaterThan(1)
	},
}

/**
 * Слоты: `icon` — своя иконка (здесь одна для всех файлов), `label` — своя разметка метки (счётчик файлов у папки),
 * `actions` — кнопки справа. Действия видны при наведении на строку и при фокусе на узле с клавиатуры.
 */
export const Slots: Story = {
	args: { expandedIds: ['src'] },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'arrowPosition'] },
		docs: {
			source: {
				code: [
					'<BaseTree :items="items">',
					`  <template #icon="{ node }"><BaseIcon :name="node.children ? 'folder' : 'file'" /></template>`,
					'  <template #label="{ node }">{{ node.label }} <BaseBadge v-if="node.children" :label="node.children.length" /></template>',
					'  <template #actions="{ node }">',
					'    <BaseButton variant="ghost" :padding="{ x: 3, y: 3 }" :aria-label="`Скачать ${node.label}`" @click.stop>',
					'      <BaseIcon name="download" :size-scale="80" />',
					'    </BaseButton>',
					'  </template>',
					'</BaseTree>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onExpanded = useModelArg('expandedIds')
		return {
			components: { BaseTree, BaseBadge, BaseButton, BaseIcon },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onExpanded }),
			template: `
				<div class="story-narrow">
					<BaseTree v-bind="props" @update:expanded-ids="onExpanded">
						<template #icon="{ node }">
							<BaseIcon :name="node.children ? 'folder' : 'file'" :size-scale="80" style="color: var(--rise-text-muted);" />
						</template>
						<template #label="{ node }">
							<span style="display: inline-flex; align-items: center; gap: 8px;">
								{{ node.label }}
								<BaseBadge v-if="node.children" variant="outline" :label="String(node.children.length)" />
							</span>
						</template>
						<template #actions="{ node }">
							<BaseButton variant="ghost" :padding="{ x: 3, y: 3 }" :aria-label="'Скачать ' + node.label" @click.stop>
								<BaseIcon name="download" :size-scale="80" />
							</BaseButton>
						</template>
					</BaseTree>
				</div>
			`,
		}
	},
	play: async ({ canvasElement, userEvent }) => {
		const header = nodeHeader(canvasElement, 'package.json')
		const actions = header.querySelector('.base-tree__actions') as HTMLElement
		// Подпись папки со слотом — «src 4» (со счётчиком): первый узел берём по роли
		await tabTo(canvasElement.querySelector('[role="treeitem"]') as HTMLElement, userEvent)
		await userEvent.keyboard('{End}{ArrowUp}')
		await expect(header).toHaveFocus()
		await waitFor(() => expect(getComputedStyle(actions).opacity).toBe('1'))
	},
}

/**
 * Управляемое раскрытие: `v-model:expanded-ids` — кнопки «Развернуть всё» и «Свернуть всё» задают список раскрытых
 * папок, а клик по дереву меняет его.
 */
export const Controlled: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'selectionMode'] },
		docs: {
			source: {
				code: [
					'<BaseButton variant="outline" @click="expanded = allFolderIds">Развернуть всё</BaseButton>',
					'<BaseButton variant="outline" @click="expanded = []">Свернуть всё</BaseButton>',
					'<BaseTree v-model:expanded-ids="expanded" :items="items" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTree, BaseButton },
		setup: () => {
			const expanded = ref<string[]>([])
			return {
				props: useArgsWithoutSlots(args, ['expandedIds', 'onUpdate:expandedIds']),
				expanded,
				expandAll: () => {
					expanded.value = folderIds(FILES)
				},
				collapseAll: () => {
					expanded.value = []
				},
			}
		},
		template: `
			<div class="story-col story-narrow">
				<div class="story-row">
					<BaseButton variant="outline" @click="expandAll">Развернуть всё</BaseButton>
					<BaseButton variant="outline" @click="collapseAll">Свернуть всё</BaseButton>
				</div>
				<BaseTree v-bind="props" v-model:expanded-ids="expanded" style="width: 100%;" />
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Развернуть всё' }))
		await waitFor(() => expect(nodeLabel(canvasElement, 'useApi.ts')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть всё' }))
		await waitFor(() => expect(nodeLabel(canvasElement, 'useApi.ts')).not.toBeVisible())
		await expect(treeNode(canvasElement, 'src')).not.toHaveClass('base-tree__node--expanded')
	},
}

/**
 * Навигация: узел с `to` (маршрут) или `href` (внешний адрес) — подпись-ссылка BaseLink. Клик по подписи и Enter
 * переходят по ссылке и не раскрывают раздел (для этого шеврон и стрелки); в режиме `single` узел становится выбранным —
 * так отмечается текущая страница. Маршруты открывает RouterLink приложения или `linkComponent` плагина.
 */
export const Links: Story = {
	args: { items: DOCS_NAV, selectionMode: 'single', expandedIds: ['components'], selectedIds: ['intro'], ariaLabel: 'Документация' },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'arrowPosition'] },
		docs: {
			source: {
				code: [
					'<!-- { id: "button", label: "Кнопка", to: "/docs/components/button" } -->',
					'<!-- { id: "github", label: "Исходный код", href: "https://github.com/…", target: "_blank" } -->',
					'<BaseTree v-model:selected-ids="current" :items="pages" selection-mode="single" aria-label="Документация" />',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onExpanded = useModelArg('expandedIds')
		const onSelected = useModelArg('selectedIds')
		return {
			components: { BaseTree },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onExpanded, onSelected }),
			template: `
				<div class="story-stack story-narrow" style="gap: 8px;">
					<BaseTree v-bind="props" @update:expanded-ids="onExpanded" @update:selected-ids="onSelected" />
					<span class="story-label">Текущая страница: {{ props.selectedIds?.join(', ') || '—' }}</span>
				</div>
			`,
		}
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const link = canvas.getByRole('link', { name: 'Кнопка' })
		await expect(link).toHaveAttribute('href', '/docs/components/button')
		await expect(canvas.getByRole('link', { name: /Исходный код/ })).toHaveAttribute('rel', 'noopener noreferrer')

		await userEvent.click(link)
		await expect(nodeHeader(canvasElement, 'Кнопка')).toHaveAttribute('aria-selected', 'true')
		await expect(nodeHeader(canvasElement, 'Кнопка')).toHaveFocus()
		await expect(canvas.getByText('Текущая страница: button')).toBeVisible()

		// Enter на разделе-ссылке — переход без сворачивания
		await userEvent.keyboard('{ArrowUp}{Enter}')
		await expect(nodeHeader(canvasElement, 'Компоненты')).toHaveAttribute('aria-expanded', 'true')
		await expect(args.onSelect).toHaveBeenLastCalledWith('components', true)
	},
}

// ─── Виртуальная прокрутка ─────────────────────────────────────────────────────

/** 60 отделов по 80 сотрудников: 4860 узлов при раскрытии всех */
const STAFF: TreeNode[] = Array.from({ length: 60 }, (_, department) => ({
	id: `department-${department + 1}`,
	label: `Отдел ${department + 1}`,
	icon: 'folder',
	children: Array.from({ length: 80 }, (_, person) => ({ id: `person-${department + 1}-${person + 1}`, label: `Сотрудник ${department + 1}.${person + 1}` })),
}))

/**
 * Виртуальная прокрутка (`isVirtual` и `height`): дерево — плоский список видимых узлов, в DOM только видимые и запас.
 * Уровень и позиция объявляются через `aria-level`, `aria-setsize`, `aria-posinset`; узел в порядке Tab остаётся
 * в DOM, а стрелки и Home/End к неотрисованному узлу сначала прокручивают к нему. Анимации раскрытия в этом режиме нет.
 */
export const Virtual: Story = {
	args: { items: STAFF, isVirtual: true, height: 320, isDefaultExpandAll: true, expandedIds: undefined, ariaLabel: 'Сотрудники' },
	parameters: { controls: { include: ['variant', 'sizeScale', 'height', 'itemSize'] } },
	play: async ({ canvas, userEvent }) => {
		const tree = canvas.getByRole('tree', { name: 'Сотрудники' })
		await expect(canvas.getAllByRole('treeitem').length).toBeLessThan(40)
		const first = canvas.getByRole('treeitem', { name: 'Отдел 1' })
		await tabTo(first, userEvent)
		await userEvent.keyboard('{End}')
		await waitFor(() => expect(canvas.getByRole('treeitem', { name: 'Сотрудник 60.80' })).toHaveFocus())
		await expect(tree.scrollTop).toBeGreaterThan(0)
		await userEvent.keyboard('{Home}')
		await waitFor(() => expect(canvas.getByRole('treeitem', { name: 'Отдел 1' })).toHaveFocus())
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура по образцу APG Tree View. В порядке Tab один узел: Tab входит в дерево и выходит из него.
 * ↓/↑ — соседний видимый узел, → — раскрыть папку или перейти к первому вложенному, ← — свернуть или к родителю,
 * Home/End — первый и последний узел, `*` — раскрыть все папки уровня, буквы — к узлу по началу подписи,
 * Enter — действие узла (раскрыть, выбрать, перейти по ссылке), пробел — выбор.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { expandedIds: undefined },
	play: async ({ canvasElement, userEvent }) => {
		const src = nodeHeader(canvasElement, 'src')
		await tabTo(src, userEvent)
		await expect(getComputedStyle(src).outlineStyle).toBe('solid')

		await userEvent.keyboard('{ArrowRight}')
		await expect(src).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{ArrowRight}')
		await expect(nodeHeader(canvasElement, 'components')).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(nodeHeader(canvasElement, 'App.vue')).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		await expect(src).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}')
		await expect(src).toHaveAttribute('aria-expanded', 'false')

		await userEvent.keyboard('{End}')
		await expect(nodeHeader(canvasElement, 'README.md')).toHaveFocus()
		await userEvent.keyboard('p')
		await expect(nodeHeader(canvasElement, 'public')).toHaveFocus()
		await userEvent.keyboard('{Home}*')
		await expect(nodeHeader(canvasElement, 'public')).toHaveAttribute('aria-expanded', 'true')
		await expect(src).toHaveFocus()

		// Остальные узлы вне порядка Tab: следующий Tab уходит из дерева
		await userEvent.tab()
		await expect(canvasElement.querySelector('.base-tree')?.contains(document.activeElement)).toBe(false)
	},
}
