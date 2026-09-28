/** Stories с панелью поверх всей страницы видны только в сайдбаре: в Docs они закрыли бы страницу. */

import { ref } from 'vue'
import { BaseText } from '@components/BaseText'
import { BaseInput } from '@components/BaseInput'
import BaseSlideover from '../ui/BaseSlideover.vue'
import { BaseButton } from '@components/BaseButton'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'

/** Args, которые витрины задают сами: их нет в v-bind, чтобы не перебить значения примера. */
const SHOWCASE_OWN_ARGS = ['isOpen', 'title', 'isContained', 'onUpdate:isOpen'] as const

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

const HISTORY = [
	'Анна Смирнова загрузила серию 1 и субтитры к ней.',
	'Иван Петров назначил роли: Мария — главная героиня, Олег — рассказчик.',
	'Мария Кузнецова записала реплики 1–48, дубли отмечены в таймлайне.',
	'Олег Соколов перезаписал вступление: исправлено ударение в названии.',
	'Екатерина Волкова проверила синхронизацию и оставила 6 комментариев.',
	'Анна Смирнова поправила громкость фоновой музыки на 12-й минуте.',
	'Иван Петров отправил серию 1 на согласование.',
	'Мария Кузнецова ответила на комментарии к репликам 20–26.',
	'Екатерина Волкова приняла правки и закрыла проверку.',
	'Анна Смирнова выгрузила финальный микс в формате WAV.',
	'Иван Петров опубликовал серию 1 в сообществе.',
	'Олег Соколов начал запись серии 2.',
	'Мария Кузнецова загрузила черновые дубли серии 2.',
	'Екатерина Волкова составила список правок к серии 2.',
] as const

const meta = {
	title: 'Overlay/BaseSlideover',
	component: BaseSlideover,
	parameters: {
		docs: {
			description: {
				component: [
					'Панель у края экрана: фильтры, детали записи, форма, которую удобно заполнять, не уходя со страницы.',
					'',
					'- Открытие и закрытие — `v-model:is-open`; закрывают кнопка «Закрыть» в шапке, Escape (`closeOnEscape`)',
					'  и клик по подложке (`closeOnOverlay`).',
					'- Доступность как у `BaseModal`: `role="dialog"`, `aria-modal`, имя из `title`, фокус внутри панели,',
					'  возврат фокуса на кнопку после закрытия, блокировка прокрутки страницы.',
					'- `side` — край экрана, `width` — ширина в процентах от 420px, `isFullWidth` — на весь экран;',
					'  на телефоне панель всегда во всю ширину.',
					'- `isContained` или `container` — панель внутри блока (немодальная). `padding` — отступы секций.',
					'',
					'Диалог по центру экрана — `BaseModal`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant'),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		side: { control: 'inline-radio', options: ['left', 'right'], table: propGroup(ARG_GROUP.appearance) },
		width: { control: { type: 'range', min: 50, max: 200, step: 10 }, table: propGroup(ARG_GROUP.appearance) },
		isFullWidth: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		hasOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		closeOnOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		container: { control: false, table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
		header: { control: false },
		footer: { control: false },
	},
	args: {
		isOpen: false,
		title: 'Фильтры',
		side: 'right',
		width: 100,
		isFullWidth: false,
		hasOverlay: true,
		sizeScale: 100,
		closeOnOverlay: true,
		closeOnEscape: true,
		isContained: false,
		onClose: fn(),
		'onUpdate:isOpen': fn(),
	},
	// isOpen хранится в args: кнопка открывает панель, закрытие панели обновляет Controls, а переключатель в Controls — панель.
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseSlideover, BaseButton, BaseInput },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, project: ref(''), author: ref('') }),
			template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Открыть фильтры</BaseButton>
				<BaseSlideover v-bind="props" @update:is-open="onUpdate">
					<div class="story-stack">
						<BaseInput v-model="project" label="Проект" placeholder="Название проекта" />
						<BaseInput v-model="author" label="Автор" placeholder="Имя или почта" />
					</div>
					<template #footer>
						<BaseButton variant="outline" @click="onUpdate(false)">Сбросить</BaseButton>
						<BaseButton @click="onUpdate(false)">Применить</BaseButton>
					</template>
				</BaseSlideover>
			`,
		}
	},
} satisfies Meta<typeof BaseSlideover>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: кнопка открывает панель, `isOpen` синхронизирован с Controls. Панель закрывают «Закрыть» в шапке,
 * Escape и клик по подложке; кнопки подвала закрывают её из кода примера.
 */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть фильтры' }))
		const dialog = await screen.findByRole('dialog', { name: 'Фильтры' })
		await expect(dialog).toHaveAttribute('aria-modal', 'true')

		await userEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Сторона появления `side`: скругление у панели только со стороны страницы, у края экрана углы прямые. */
export const Sides: Story = {
	parameters: {
		controls: { include: ['width', 'sizeScale', 'hasOverlay'] },
		docs: { source: { code: '<BaseSlideover v-model:is-open="isOpen" side="left" title="Слева">…</BaseSlideover>' } },
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'side']), sides: ['left', 'right'] as const }),
		template: `
			<div class="story-stack">
				<div v-for="side in sides" :key="side" class="story-frame" style="height: 200px;">
					<BaseSlideover v-bind="props" :is-open="true" is-contained :side="side" :title="side === 'left' ? 'Слева' : 'Справа'">
						<BaseText>Панель открыта внутри рамки.</BaseText>
					</BaseSlideover>
				</div>
			</div>
		`,
	}),
}

/** Ширина: `width` — проценты от 420px (здесь 75 и 100), `isFullWidth` — на всю ширину, без скругления. */
export const Widths: Story = {
	parameters: {
		controls: { include: ['side', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseSlideover v-model:is-open="isOpen" :width="75" title="75%">…</BaseSlideover>',
					'<BaseSlideover v-model:is-open="isOpen" title="100%">…</BaseSlideover>',
					'<BaseSlideover v-model:is-open="isOpen" is-full-width title="На всю ширину">…</BaseSlideover>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'width', 'isFullWidth']),
			widths: [
				{ title: '75%', width: 75, isFullWidth: false },
				{ title: '100% — 420px', width: 100, isFullWidth: false },
				{ title: 'На всю ширину', width: 100, isFullWidth: true },
			],
		}),
		template: `
			<div class="story-stack">
				<div v-for="item in widths" :key="item.title" class="story-frame" style="height: 160px;">
					<BaseSlideover v-bind="props" :is-open="true" is-contained :width="item.width" :is-full-width="item.isFullWidth" :title="item.title">
						<BaseText>Содержимое панели.</BaseText>
					</BaseSlideover>
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: пропорционально меняются отступы, кегль, кнопка закрытия и ширина панели. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['side'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(
					preset =>
						`<BaseSlideover v-model:is-open="isOpen" :size-scale="${preset.sizeScale}" title="${preset.name}">…</BaseSlideover>`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'sizeScale']),
			presets: SIZE_PRESETS.filter(preset => ['sm', 'md', 'lg'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-frame" style="height: 170px;">
					<BaseSlideover v-bind="props" :is-open="true" is-contained :size-scale="preset.sizeScale" :title="sizeLabel(preset)">
						<BaseText>Содержимое панели.</BaseText>
					</BaseSlideover>
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: фон и текст панели. Подойдёт любой CSS-цвет; токены `var(--rise-…)` сохраняют контраст
 * в обеих темах. Компоненты в теле и подвале `color` не наследуют — кнопка «Сохранить» сохраняет свой цвет.
 */
export const CustomColor: Story = {
	args: {
		title: 'Заметки к серии',
		color: {
			bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-primary-soft-hover)' },
			text: { base: 'var(--rise-primary-text)' },
		},
	},
	parameters: { controls: { include: ['color', 'sizeScale'] } },
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]) }),
		template: `
			<div class="story-frame" style="height: 260px;">
				<BaseSlideover v-bind="props" :is-open="true" is-contained title="Заметки к серии">
					Перезаписать реплики 12–15: в оригинале пауза длиннее.
					<template #footer>
						<BaseButton>Сохранить</BaseButton>
					</template>
				</BaseSlideover>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const dialog = canvas.getByRole('dialog', { name: 'Заметки к серии' })
		await expect(getComputedStyle(dialog).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(dialog).color).toBe(resolveColor('var(--rise-primary-text)'))
		const save = within(dialog).getByRole('button', { name: 'Сохранить' })
		await expect(getComputedStyle(save).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Длинное содержимое прокручивается внутри тела: шапка и подвал остаются на месте. Тело с прокруткой получает
 * `tabindex="0"`, поэтому его можно прокрутить с клавиатуры, даже если внутри нет кнопок и полей.
 */
export const LongContent: Story = {
	tags: ['!autodocs'],
	args: { isOpen: true, title: 'История проекта' },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseSlideover, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args), history: HISTORY, onUpdate }),
			template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Открыть историю</BaseButton>
				<BaseSlideover v-bind="props" @update:is-open="onUpdate">
					<div class="story-stack">
						<BaseText v-for="(entry, index) in history" :key="index">{{ entry }}</BaseText>
					</div>
					<template #footer>
						<BaseButton @click="onUpdate(false)">Готово</BaseButton>
					</template>
				</BaseSlideover>
			`,
		}
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'История проекта' })
		const body = within(dialog).getByText(HISTORY[0]).closest('.base-slideover__body') as HTMLElement
		await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
		await waitFor(() => expect(body).toHaveAttribute('tabindex', '0'))
		const done = within(dialog).getByRole('button', { name: 'Готово' })
		await expect(done.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Панель внутри блока (`isContained`): рендерится на месте и перекрывает только родителя с `position: relative`.
 * Диалог немодальный — страница за пределами блока доступна, прокрутка не блокируется.
 * `container` делает то же для блока в другом месте страницы (CSS-селектор или элемент).
 */
export const Contained: Story = {
	parameters: { controls: { include: ['side', 'width', 'closeOnOverlay', 'closeOnEscape'] } },
	render: args => ({
		components: { BaseSlideover, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]), isOpen: ref(false) }),
		template: `
			<div class="story-frame" style="height: 240px;">
				<BaseButton variant="outline" @click="isOpen = true">Открыть в блоке</BaseButton>
				<BaseSlideover v-bind="props" v-model:is-open="isOpen" is-contained title="Панель в блоке">
					<BaseText>Панель перекрывает только этот блок.</BaseText>
				</BaseSlideover>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть в блоке' }))
		const dialog = await canvas.findByRole('dialog', { name: 'Панель в блоке' })
		await expect(dialog).not.toHaveAttribute('aria-modal')
		await expect(document.body.style.overflow).toBe('')

		// Панель выезжает из-за края блока: границы проверяются после окончания анимации
		const frame = (dialog.closest('.story-frame') as HTMLElement).getBoundingClientRect()
		await waitFor(() => expect(dialog.getBoundingClientRect().right).toBeLessThanOrEqual(frame.right))
		await expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(frame.bottom)

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

/**
 * Отступы шапки, тела и подвала — `padding`. Без него — 16px по вертикали и 20px по горизонтали из стилей;
 * число задаёт только горизонталь, объект `{ x, y, top, right, bottom, left }` — стороны напрямую.
 */
export const Padding: Story = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseSlideover v-model:is-open="isOpen" title="Из стилей">…</BaseSlideover>',
					'<BaseSlideover v-model:is-open="isOpen" :padding="32" title="padding: 32">…</BaseSlideover>',
					'<BaseSlideover v-model:is-open="isOpen" :padding="{ x: 12, y: 8 }" title="{ x: 12, y: 8 }">…</BaseSlideover>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'padding']),
			items: [
				{ title: 'Из стилей', padding: undefined },
				{ title: 'padding: 32', padding: 32 },
				{ title: '{ x: 12, y: 8 }', padding: { x: 12, y: 8 } },
			],
		}),
		template: `
			<div class="story-stack">
				<div v-for="item in items" :key="item.title" class="story-frame" style="height: 160px;">
					<BaseSlideover v-bind="props" :is-open="true" is-contained :padding="item.padding" :title="item.title">
						<BaseText>Содержимое панели.</BaseText>
					</BaseSlideover>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [themed, numeric, object] = canvas.getAllByRole('dialog')
		await expect(themed?.getAttribute('style')).toBeNull()
		await expect(numeric?.style.getPropertyValue('--slideover-pad-left')).toBe('32px')
		await expect(numeric?.style.getPropertyValue('--slideover-pad-top')).toBe('')
		await expect(object?.style.getPropertyValue('--slideover-pad-top')).toBe('8px')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Enter на кнопке открывает панель и переводит фокус внутрь, Tab и Shift+Tab обходят элементы панели
 * по кругу, Escape закрывает её и возвращает фокус на кнопку.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseSlideover, BaseButton, BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]), isOpen: ref(false), query: ref('') }),
		template: `
			<BaseButton variant="outline" @click="isOpen = true">Поиск по проектам</BaseButton>
			<BaseSlideover v-bind="props" v-model:is-open="isOpen" title="Поиск">
				<BaseInput v-model="query" label="Запрос" />
				<template #footer>
					<BaseButton @click="isOpen = false">Найти</BaseButton>
				</template>
			</BaseSlideover>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Поиск по проектам' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('dialog', { name: 'Поиск' })
		const close = within(dialog).getByRole('button', { name: 'Закрыть' })
		await waitFor(() => expect(close).toHaveFocus())

		await userEvent.tab()
		await expect(within(dialog).getByLabelText('Запрос')).toHaveFocus()
		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Найти' })).toHaveFocus()
		// С последнего элемента Tab возвращается на первый, а не на страницу под подложкой
		await userEvent.tab()
		await expect(close).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(within(dialog).getByRole('button', { name: 'Найти' })).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
