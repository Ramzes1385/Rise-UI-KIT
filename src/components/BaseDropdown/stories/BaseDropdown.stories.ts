/**
 * BaseDropdown — stories.
 *
 * Разделы: Default (песочница: меню действий, isOpen синхронизирован с Controls) → внешний вид (варианты, кастомный цвет) →
 * состояния (пустая панель, длинный список) → сценарии (позиции, у края окна, тёмный блок, поле ввода в панели) → клавиатура.
 * Открытые панели телепортируются в body, поэтому в Docs такие примеры показываются в отдельном фрейме.
 */

import { expect, fn, screen, waitFor } from 'storybook/test'
import { computed, ref } from 'vue'
import { ARG_GROUP, baseArgTypes, propGroup, STORY_USERS, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseMenu } from '@components/BaseMenu'
import { BaseText } from '@components/BaseText'
import { DROPDOWN_VARIANTS } from '../model/BaseDropdown.types'
import BaseDropdown from '../ui/BaseDropdown.vue'
import type { DropdownPosition } from '../model/BaseDropdown.types'
import type { BaseMenuItem } from '@components/BaseMenu'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Все позиции панели относительно триггера. */
const POSITIONS: DropdownPosition[] = [
	'bottom-start',
	'bottom',
	'bottom-end',
	'top-start',
	'top',
	'top-end',
	'left-start',
	'left',
	'left-end',
	'right-start',
	'right',
	'right-end',
]

/** Меню действий с файлом: одна группа, чтобы центр меню приходился на пункт (на это опирается e2e). */
const FILE_ACTIONS: BaseMenuItem[][] = [
	[
		{ label: 'Скопировать ссылку', icon: 'link' },
		{ label: 'Скачать', icon: 'download' },
		{ label: 'Удалить', icon: 'trash' },
	],
]

/** Длинный список проектов для примера с прокруткой. */
const PROJECTS: BaseMenuItem[][] = [
	[
		'Сайт студии',
		'Мобильное приложение',
		'Сериал «Северный ветер», сезон 1',
		'Сериал «Северный ветер», сезон 2',
		'Аниме «Лисья тропа»',
		'Документальный фильм о реставрации',
		'Подкаст «Голоса»',
		'Аудиокнига «Старый маяк»',
		'Трейлеры осеннего сезона',
		'Архив 2024',
		'Черновики',
		'Шаблоны субтитров',
	].map(label => ({ label })),
]

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

/** Открытые панели телепортируются в body и перекрыли бы страницу Docs — там пример показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Overlay/BaseDropdown',
	component: BaseDropdown,
	parameters: {
		docs: {
			description: {
				component: [
					'Выпадающая панель у триггера: меню действий, фильтр, небольшая форма. Основа для `BasePopover`,',
					'`BaseSelect` и `BaseSearch`.',
					'',
					'- Триггер — слот по умолчанию, содержимое панели — слот `dropdown`. Открытием управляет родитель:',
					'  `v-model:is-open` и обработчик клика на триггере. Панель закрывается кликом снаружи и по Escape.',
					'- Панель телепортируется в body (или в контейнер `teleportTo` из плагина и BaseApp) и позиционируется по',
					'  триггеру (`position`, `gap`). Если на выбранной стороне не хватает места, панель открывается с противоположной,',
					'  а вдоль края окна сдвигается, оставляя 8px. `matchWidth` — ширина как у триггера, `maxHeight` — высота,',
					'  после которой содержимое прокручивается. Тема панели — `data-theme` ближайшего предка триггера.',
					'- Escape и клик снаружи закрывают только верхнюю панель: список внутри окна или поповера закрывается первым,',
					'  клик в панели вложенного списка не закрывает внешнюю.',
					'- Фокус остаётся на триггере (`preventMousedown`); поля ввода в панели получают фокус, а при закрытии он',
					'  возвращается на триггер.',
					'',
					'Для меню действий положите в панель `BaseMenu variant="ghost"`, для подсказки со стрелкой возьмите `BasePopover`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: DROPDOWN_VARIANTS }),
		position: { control: 'select', options: POSITIONS, table: propGroup(ARG_GROUP.appearance) },
		gap: { control: { type: 'number', min: 0, max: 32 }, table: propGroup(ARG_GROUP.appearance) },
		maxHeight: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		matchWidth: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		panelClass: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		preventMousedown: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
		dropdown: { control: false },
	},
	args: {
		isOpen: false,
		position: 'bottom-start',
		variant: 'default',
		gap: 4,
		maxHeight: '320px',
		matchWidth: false,
		closeOnEscape: true,
		preventMousedown: true,
		sizeScale: 100,
		onClose: fn(),
		'onUpdate:isOpen': fn(),
	},
	// isOpen хранится в args: триггер переключает панель, закрытие кликом снаружи или Escape обновляет Controls.
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu },
			setup: () => ({ props: useArgsWithoutSlots(args, []), isOpen: computed(() => args.isOpen), onUpdate, actions: FILE_ACTIONS }),
			template: `
				<BaseDropdown v-bind="props" @update:is-open="onUpdate">
					<BaseButton variant="outline" data-testid="trigger" @click="onUpdate(!isOpen)">
						Действия
						<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
					</BaseButton>
					<template #dropdown>
						<div data-testid="panel">
							<BaseMenu variant="ghost" :items="actions" @select="onUpdate(false)" />
						</div>
					</template>
				</BaseDropdown>
			`,
		}
	},
} satisfies Meta<typeof BaseDropdown>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: меню действий. Триггер открывает и закрывает панель, выбор пункта закрывает её, `isOpen` виден в Controls.
 * Без play-функции: story открывают e2e-тесты, и автоматические клики мешали бы им (сценарий проверяет Keyboard).
 */
export const Default: Story = {}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов панели. `default` — рамка и тень; `outline` — рамка заметнее, без тени; `shadow` — только тень;
 * `soft` — мягкий нейтральный фон; `ghost` — без фона, рамки и тени, когда оформление даёт содержимое.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'position'] },
		docs: {
			...docsFrame(200),
			source: {
				code: DROPDOWN_VARIANTS.map(variant => `<BaseDropdown v-model:is-open="isOpen" variant="${variant}">…</BaseDropdown>`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, ['isOpen', 'variant', 'onUpdate:isOpen']), variants: DROPDOWN_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 140px;">
				<div v-for="variant in variants" :key="variant" style="height: 110px;">
					<BaseDropdown v-bind="props" :is-open="true" :variant="variant">
						<BaseButton variant="outline">{{ variant }}</BaseButton>
						<template #dropdown>
							<BaseText style="padding: 6px 8px;">Панель {{ variant }}</BaseText>
						</template>
					</BaseDropdown>
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: фон и текст панели. Подойдёт любой CSS-цвет; токены `var(--rise-…)` сохраняют контраст
 * в обеих темах. Содержимое панели `color` не наследует — кнопка «Скачать всё» сохраняет свой цвет.
 */
export const CustomColor: Story = {
	args: {
		isOpen: true,
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	parameters: { controls: { include: ['color', 'variant'] }, docs: docsFrame(200) },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseDropdown, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), isOpen: computed(() => args.isOpen), onUpdate }),
			template: `
				<BaseDropdown v-bind="props" @update:is-open="onUpdate">
					<BaseButton variant="outline" @click="onUpdate(!isOpen)">Загрузки</BaseButton>
					<template #dropdown>
						<div class="story-col" style="padding: 8px;">
							Готово к скачиванию: 3 файла
							<BaseButton>Скачать всё</BaseButton>
						</div>
					</template>
				</BaseDropdown>
			`,
		}
	},
	play: async () => {
		const action = await screen.findByRole('button', { name: 'Скачать всё' })
		const panel = action.closest('.base-dropdown__panel') as HTMLElement
		await expect(getComputedStyle(panel).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(panel).color).toBe(resolveColor('var(--rise-primary-text)'))
		await expect(getComputedStyle(action).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Пустая панель: вместо пунктов — короткое пояснение приглушённым текстом. */
export const Empty: Story = {
	args: { isOpen: true },
	parameters: { controls: { include: ['variant', 'sizeScale'] }, docs: docsFrame(160) },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseDropdown, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args, []), isOpen: computed(() => args.isOpen), onUpdate }),
			template: `
				<BaseDropdown v-bind="props" @update:is-open="onUpdate">
					<BaseButton variant="outline" @click="onUpdate(!isOpen)">Недавние</BaseButton>
					<template #dropdown>
						<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }" style="padding: 6px 8px;">
							Вы ещё не открывали проекты
						</BaseText>
					</template>
				</BaseDropdown>
			`,
		}
	},
	play: async () => {
		await waitFor(() => expect(screen.getByText('Вы ещё не открывали проекты')).toBeVisible())
	},
}

/** Длинный список прокручивается внутри панели: высоту ограничивает `maxHeight` (здесь 200px). */
export const LongContent: Story = {
	args: { isOpen: true, maxHeight: '200px' },
	parameters: { controls: { include: ['maxHeight', 'variant', 'sizeScale'] }, docs: docsFrame(280) },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseDropdown, BaseButton, BaseMenu },
			setup: () => ({ props: useArgsWithoutSlots(args, []), isOpen: computed(() => args.isOpen), onUpdate, projects: PROJECTS }),
			template: `
				<BaseDropdown v-bind="props" @update:is-open="onUpdate">
					<BaseButton variant="outline" @click="onUpdate(!isOpen)">Проекты</BaseButton>
					<template #dropdown>
						<BaseMenu variant="ghost" :items="projects" @select="onUpdate(false)" />
					</template>
				</BaseDropdown>
			`,
		}
	},
	play: async () => {
		const panel = (await screen.findByText('Сайт студии')).closest('.base-dropdown__panel') as HTMLElement
		await expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(200)
		await expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Позиция `position`: сторона (`top`, `bottom`, `left`, `right`) и выравнивание (`-start`, по центру, `-end`).
 * Здесь — шесть позиций над и под триггером; `left-*` и `right-*` выбираются в Controls песочницы.
 */
export const Positions: Story = {
	parameters: {
		controls: { include: ['gap', 'variant'] },
		docs: {
			...docsFrame(260),
			source: { code: '<BaseDropdown v-model:is-open="isOpen" position="top-end">…</BaseDropdown>' },
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'position', 'onUpdate:isOpen']),
			positions: ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'] as const,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px; padding: 64px 0;">
				<BaseDropdown v-for="position in positions" :key="position" v-bind="props" :is-open="true" :position="position">
					<BaseButton variant="outline">{{ position }}</BaseButton>
					<template #dropdown>
						<BaseText style="padding: 6px 8px;">Панель</BaseText>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
}

/**
 * У края окна: снизу места не хватает — панель открывается над триггером; справа не хватает — сдвигается влево
 * и оставляет 8px до края окна. Позиция в пропе остаётся `bottom-start`.
 */
export const ViewportEdge: Story = {
	tags: ['!autodocs'],
	parameters: { layout: 'fullscreen', controls: { include: ['gap', 'variant'] } },
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'position', 'onUpdate:isOpen']),
			isOpen: ref(false),
			actions: FILE_ACTIONS,
		}),
		template: `
			<div style="box-sizing: border-box; display: flex; align-items: flex-end; justify-content: flex-end; min-height: 100vh; padding: 16px;">
				<BaseDropdown v-bind="props" v-model:is-open="isOpen" position="bottom-start">
					<BaseButton variant="outline" @click="isOpen = !isOpen">
						Действия
						<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
					</BaseButton>
					<template #dropdown>
						<BaseMenu variant="ghost" :items="actions" @select="isOpen = false" />
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await userEvent.click(trigger)
		const panel = (await screen.findByText('Скачать')).closest('.base-dropdown__panel') as HTMLElement

		await waitFor(() => {
			const panelRect = panel.getBoundingClientRect()
			expect(panelRect.bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top)
			expect(panelRect.right).toBeLessThanOrEqual(document.documentElement.clientWidth - 8)
		})
	},
}

/**
 * Тёмный блок на светлой странице: панель телепортирована в body, но берёт `data-theme` ближайшего предка
 * триггера — её цвета совпадают с блоком, а не со страницей.
 */
export const InDarkBlock: Story = {
	parameters: { controls: { include: ['variant'] }, docs: docsFrame(240) },
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, ['isOpen', 'onUpdate:isOpen']), isOpen: ref(false), actions: FILE_ACTIONS }),
		template: `
			<div data-theme="dark" class="story-stack" style="padding: 16px; border-radius: var(--rise-radius-md); background: var(--rise-bg); color: var(--rise-text);">
				<BaseText>Плеер: тёмная панель на светлой странице</BaseText>
				<BaseDropdown v-bind="props" v-model:is-open="isOpen">
					<BaseButton variant="outline" @click="isOpen = !isOpen">
						Действия
						<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
					</BaseButton>
					<template #dropdown>
						<BaseMenu variant="ghost" :items="actions" @select="isOpen = false" />
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Действия' }))
		const panel = (await screen.findByText('Скачать')).closest('.base-dropdown__panel')
		await expect(panel).toHaveAttribute('data-theme', 'dark')
	},
}

/**
 * Поле ввода в панели: клик ставит фокус в поле, ввод фильтрует список. При закрытии (Escape, клик снаружи, выбор)
 * фокус возвращается на триггер. Остальное содержимое панели фокус с триггера не уводит (`preventMousedown`).
 */
export const WithField: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseInput, BaseMenu },
		setup: () => {
			const isOpen = ref(false)
			const query = ref('')
			const people = computed<BaseMenuItem[][]>(() => [
				STORY_USERS.filter(user => user.name.toLowerCase().includes(query.value.toLowerCase())).map(user => ({ label: user.name })),
			])
			return { props: useArgsWithoutSlots(args, ['isOpen', 'onUpdate:isOpen']), isOpen, query, people }
		},
		template: `
			<BaseDropdown v-bind="props" v-model:is-open="isOpen">
				<BaseButton variant="outline" @click="isOpen = !isOpen">
					Автор
					<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
				</BaseButton>
				<template #dropdown>
					<div class="story-stack" style="gap: 4px; width: 240px;">
						<BaseInput v-model="query" label="Имя" placeholder="Начните вводить" />
						<BaseMenu variant="ghost" :items="people" @select="isOpen = false" />
					</div>
				</template>
			</BaseDropdown>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Автор' })
		await userEvent.click(trigger)
		const field = await screen.findByLabelText('Имя')

		await userEvent.click(field)
		await expect(field).toHaveFocus()
		await userEvent.keyboard('анна')
		await expect(field).toHaveValue('анна')
		await expect(screen.getByText('Анна Смирнова')).toBeInTheDocument()
		await expect(screen.queryByText('Иван Петров')).not.toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByLabelText('Имя')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус на триггер, Enter открывает панель, Escape закрывает её (события `update:isOpen`
 * и `close`), фокус всё это время остаётся на триггере; Space открывает панель снова.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.getByText('Скачать')).toBeVisible())
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByText('Скачать')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard(' ')
		await waitFor(() => expect(screen.getByText('Скачать')).toBeVisible())
		await expect(trigger).toHaveFocus()
	},
}
