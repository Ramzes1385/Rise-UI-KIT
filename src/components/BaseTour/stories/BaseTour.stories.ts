/** Открытый тур закрывает всю страницу, поэтому в Docs такие примеры показываются в отдельном фрейме. */

import { ref } from 'vue'
import BaseTour from '../ui/BaseTour.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import type { TourStep } from '../types/BaseTour.types'
import { TOUR_PLACEMENTS } from '../types/BaseTour.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { ARG_GROUP, hiddenArgTypes, propGroup, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'

/** Шаги тура по панели инструментов из DEMO_TOOLBAR. */
const STEPS: TourStep[] = [
	{ target: '#tour-create', title: 'Новый проект', content: 'Создайте проект, чтобы загрузить серии и распределить роли.' },
	{ target: '#tour-import', title: 'Импорт', content: 'Загрузите видео и субтитры из файла или по ссылке.' },
	{ target: '#tour-settings', title: 'Настройки', content: 'Здесь меняются язык озвучки, голоса и формат экспорта.' },
]

/** Десять шагов: больше восьми — вместо точек прогресса показывается полоса. */
const MANY_STEPS: TourStep[] = Array.from({ length: 10 }, (_, index) => ({
	...STEPS[index % STEPS.length]!,
	title: `Шаг ${index + 1}. ${STEPS[index % STEPS.length]!.title}`,
}))

/** Панель инструментов, по которой идёт тур: цели шагов находятся по id. */
const DEMO_TOOLBAR = `
	<div class="story-row">
		<BaseButton id="tour-create">Создать проект</BaseButton>
		<BaseButton id="tour-import" variant="outline">Импорт</BaseButton>
		<BaseButton id="tour-settings" variant="ghost">Настройки</BaseButton>
	</div>
`

/** Открытый тур закрывает страницу и блокирует прокрутку — в Docs пример показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Overlay/BaseTour',
	component: BaseTour,
	parameters: {
		// Панель инструментов в центре холста: карточке хватает места с любой стороны от цели (у края экрана она не сдвигается).
		layout: 'centered',
		docs: {
			description: {
				component: [
					'Пошаговый тур по интерфейсу: подсвечивает элемент и показывает рядом карточку с пояснением.',
					'',
					'- Шаги — `steps`: CSS-селектор цели, заголовок, текст и сторона карточки. `v-model:is-open` запускает и закрывает',
					'  тур, `v-model:step` — текущий шаг.',
					'- Цель подсвечена кольцом основного цвета, остальная страница — под подложкой; прокрутка блокируется.',
					'- Карточка — модальный диалог: фокус переходит на «Далее», Tab не уходит на страницу, Escape и клик по подложке',
					'  пропускают тур, после закрытия фокус возвращается на кнопку запуска.',
					'- Прогресс — точки (до восьми шагов) или полоса. Подписи кнопок — `labels`, поведение — `behavior`.',
					'- Слоты `title` и `content` меняют заголовок и текст, слот по умолчанию — всю карточку.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...hiddenArgTypes('variant', 'sizeScale', 'color'),
		steps: { control: 'object', table: propGroup(ARG_GROUP.content) },
		labels: { control: 'object', table: propGroup(ARG_GROUP.content) },
		placement: { control: 'inline-radio', options: TOUR_PLACEMENTS, table: propGroup(ARG_GROUP.appearance) },
		gap: { control: { type: 'number', min: 0, max: 40 }, table: propGroup(ARG_GROUP.appearance) },
		padding: { control: { type: 'number', min: 0, max: 40 }, table: propGroup(ARG_GROUP.appearance) },
		radius: { control: { type: 'number', min: 0, max: 40 }, table: propGroup(ARG_GROUP.appearance) },
		showProgress: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		showSkip: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		step: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.state) },
		behavior: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
		title: { control: false },
		content: { control: false },
	},
	args: {
		isOpen: false,
		step: 0,
		steps: STEPS,
		placement: 'auto',
		showSkip: true,
		showProgress: true,
		onSkip: fn(),
		onFinish: fn(),
		onClose: fn(),
		'onUpdate:isOpen': fn(),
		'onUpdate:step': fn(),
	},
	// isOpen и step хранятся в args: кнопка запускает тур, переходы и закрытие обновляют Controls.
	render: args => {
		const onOpen = useModelArg('isOpen')
		const onStep = useModelArg('step')
		return {
			components: { BaseTour, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onOpen, onStep }),
			template: `
				<div class="story-stack">
					${DEMO_TOOLBAR}
					<div>
						<BaseButton variant="soft" @click="onOpen(true)">Запустить тур</BaseButton>
					</div>
				</div>
				<BaseTour v-bind="props" @update:is-open="onOpen" @update:step="onStep" />
			`,
		}
	},
} satisfies Meta<typeof BaseTour>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: кнопка запускает тур по панели инструментов; «Далее» переходит к следующему шагу, Escape и клик
 * по подложке пропускают тур (события `skip` и `close`). Сценарий с клавиатуры проверяет story Keyboard.
 */
export const Default: Story = {}

// ─── Открытый тур ──────────────────────────────────────────────────────────────

/**
 * Первый шаг: цель подсвечена кольцом, карточка — рядом (сторона `auto` — где больше места). Точки показывают прогресс,
 * фокус стоит на «Далее».
 */
export const Opened: Story = {
	args: { isOpen: true },
	parameters: { docs: docsFrame(320) },
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		const next = await within(dialog).findByRole('button', { name: 'Далее' })
		await waitFor(() => expect(next).toHaveFocus())
		await expect(within(dialog).getByText('1 / 3')).toBeInTheDocument()
	},
}

/** Последний шаг: «Назад» и «Завершить». «Завершить» закрывает тур с событием `finish`. */
export const LastStep: Story = {
	args: { isOpen: true, step: 2 },
	parameters: { docs: docsFrame(320) },
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Настройки' })
		await expect(await within(dialog).findByRole('button', { name: 'Завершить' })).toBeInTheDocument()
		await expect(within(dialog).getByRole('button', { name: 'Назад' })).toBeInTheDocument()
		await expect(within(dialog).getByText('3 / 3')).toBeInTheDocument()
	},
}

/** Больше восьми шагов: вместо точек — полоса прогресса. */
export const ProgressBar: Story = {
	args: { isOpen: true, steps: MANY_STEPS, step: 4 },
	parameters: { docs: docsFrame(320) },
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Шаг 5. Импорт' })
		await expect(await within(dialog).findByText('5 / 10')).toBeInTheDocument()
	},
}

/** Минимальная карточка: без прогресса (`showProgress: false`) и без кнопки пропуска (`showSkip: false`). */
export const Minimal: Story = {
	args: { isOpen: true, showProgress: false, showSkip: false },
	parameters: { docs: docsFrame(320) },
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		await within(dialog).findByRole('button', { name: 'Далее' })
		await expect(within(dialog).queryByRole('button', { name: 'Пропустить тур' })).not.toBeInTheDocument()
	},
}

/**
 * Сторона карточки `placement`: `top`, `bottom`, `left`, `right` или `auto` (где больше места). Шаг может задать
 * свою сторону полем `placement`. Меняйте значение в Controls.
 */
export const Placements: Story = {
	args: {
		isOpen: true,
		placement: 'right',
		showProgress: false,
		steps: [{ target: '#tour-target', title: 'Сторона карточки', content: 'Меняйте placement в Controls.' }],
	},
	parameters: { controls: { include: ['placement', 'gap', 'padding', 'radius'] }, docs: docsFrame(320) },
	render: args => {
		const onOpen = useModelArg('isOpen')
		return {
			components: { BaseTour, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onOpen }),
			template: `
				<BaseButton id="tour-target" variant="outline" @click="onOpen(true)">Цель тура</BaseButton>
				<BaseTour v-bind="props" @update:is-open="onOpen" />
			`,
		}
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Сторона карточки' })
		await within(dialog).findByRole('button', { name: 'Завершить' })
		const card = dialog.querySelector('.base-tour__card') as HTMLElement
		const target = document.getElementById('tour-target') as HTMLElement
		await waitFor(() => expect(card.getBoundingClientRect().left).toBeGreaterThan(target.getBoundingClientRect().right))
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Свои заголовок и текст — слоты `title` и `content` (получают `step` и `index`). Слот по умолчанию заменяет всю
 * карточку и получает ещё `next`, `prev`, `skip`, `finish`.
 */
export const CustomContent: Story = {
	args: { isOpen: true },
	parameters: {
		docs: {
			...docsFrame(320),
			source: {
				code: [
					'<BaseTour v-model:is-open="isOpen" :steps="steps">',
					'  <template #title="{ step }">…</template>',
					'  <template #content="{ step, index }">…</template>',
					'</BaseTour>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onOpen = useModelArg('isOpen')
		const onStep = useModelArg('step')
		return {
			components: { BaseTour, BaseButton, BaseIcon, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onOpen, onStep }),
			template: `
				<div class="story-stack">${DEMO_TOOLBAR}</div>
				<BaseTour v-bind="props" @update:is-open="onOpen" @update:step="onStep">
					<template #title="{ step }">
						<div class="story-row" style="gap: 6px;">
							<BaseIcon name="info" :size-scale="80" />
							<BaseText :color="{ text: { base: 'var(--rise-text-highlighted)' } }" :weight="600">{{ step.title }}</BaseText>
						</div>
					</template>
					<template #content="{ step, index }">
						<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }">{{ step.content }} Шаг {{ index + 1 }} из 3.</BaseText>
					</template>
				</BaseTour>
			`,
		}
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		await expect(await within(dialog).findByText(/Шаг 1 из 3/)).toBeInTheDocument()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Enter на кнопке запускает тур, фокус переходит на «Далее»; Tab обходит кнопки карточки по кругу,
 * Enter переходит к следующему шагу, Escape пропускает тур и возвращает фокус на кнопку запуска.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	// Состояние тура — в самом примере, а не в args: обновление args перерисовывало бы story во время проверок.
	render: args => ({
		components: { BaseTour, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'step', 'onUpdate:isOpen', 'onUpdate:step']),
			isOpen: ref(false),
			step: ref(0),
		}),
		template: `
			<div class="story-stack">
				${DEMO_TOOLBAR}
				<div>
					<BaseButton variant="soft" @click="isOpen = true">Запустить тур</BaseButton>
				</div>
			</div>
			<BaseTour v-bind="props" v-model:is-open="isOpen" v-model:step="step" />
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const start = canvas.getByRole('button', { name: 'Запустить тур' })
		await tabTo(start, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		const next = await within(dialog).findByRole('button', { name: 'Далее' })
		await waitFor(() => expect(next).toHaveFocus())

		// С последней кнопки карточки Tab возвращается на первую, а не на страницу под затемнением
		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Пропустить тур' })).toHaveFocus()
		await userEvent.tab()
		await expect(next).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(await screen.findByRole('dialog', { name: 'Импорт' })).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(start).toHaveFocus()
	},
}
