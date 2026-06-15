/**
 * Stories для компонента BaseTour.
 * Демонстрирует пошаговый онбординг-тур: подсветку элементов, навигацию и кастомизацию.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { buildArgTypes } from '@utils/storybookUtils'

import type { TourStep } from '../model/BaseTour.types'
import { TOUR_PLACEMENTS } from '../model/BaseTour.types'
import BaseTour from '../ui/BaseTour.vue'

const STEPS: TourStep[] = [
	{ target: '#tour-logo', title: 'Логотип', content: 'Здесь находится логотип приложения.' },
	{ target: '#tour-search', title: 'Поиск', content: 'Используйте поиск для быстрого доступа.' },
	{ target: '#tour-profile', title: 'Профиль', content: 'Откройте меню профиля здесь.' },
]

const DEMO_LAYOUT = `
	<div style="min-height:320px;padding:24px;">
		<header style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
			<div id="tour-logo" style="padding:8px 12px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">LOGO</div>
			<div id="tour-search" style="flex:1;max-width:320px;padding:8px 12px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Поиск…</div>
			<div id="tour-profile" style="padding:8px 12px;border:1px solid var(--color-border);border-radius:var(--border-radius-full);">👤</div>
		</header>
		<button
			data-testid="start-tour"
			style="margin-top:24px;padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;"
			@click="isOpen = true">
			Запустить тур
		</button>
	</div>
`

const meta: Meta<typeof BaseTour> = {
	title: 'UI/BaseTour',
	component: BaseTour,

	argTypes: buildArgTypes({
		props: {
			isOpen: { control: 'boolean' },
			step: { control: { type: 'number', min: 0 } },
			placement: { control: 'inline-radio', options: TOUR_PLACEMENTS },
			gap: { control: { type: 'number', min: 0, max: 40 } },
			padding: { control: { type: 'number', min: 0, max: 40 } },
			showSkip: { control: 'boolean' },
			showProgress: { control: 'boolean' },
			closeOnOverlayClick: { control: 'boolean' },
			closeOnEscape: { control: 'boolean' },
		},
		hidden: ['onClose', 'onFinish', 'onSkip', 'onNext', 'onPrev', 'onChange', 'onUpdate:isOpen', 'onUpdate:step'],
	}),

	args: {
		isOpen: false,
		step: 0,
		steps: STEPS,
		placement: 'auto',
		showSkip: true,
		showProgress: true,
	},
}

export default meta
type Story = StoryObj<typeof BaseTour>

/** Базовый тур: запускается по кнопке, не открывается автоматически в docs */
export const Default: Story = {
	render: args => ({
		components: { BaseTour },
		setup() {
			const isOpen = ref(false)
			const step = ref(0)
			return { args, isOpen, step }
		},
		template: `
			<div>
				${DEMO_LAYOUT}
				<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByTestId('start-tour'))
		await waitFor(() => {
			expect(document.querySelector('.base-tour')).toBeInTheDocument()
		})
		await waitFor(() => {
			expect(document.body).toHaveTextContent('Логотип')
		})
	},
}

/** Навигация по шагам через кнопку «Далее» */
export const Navigation: Story = {
	args: {
		onNext: fn(),
		'onUpdate:step': fn(),
	},
	render: args => ({
		components: { BaseTour },
		setup() {
			const isOpen = ref(false)
			const step = ref(0)
			return { args, isOpen, step }
		},
		template: `
			<div>
				${DEMO_LAYOUT}
				<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
			</div>
		`,
	}),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByTestId('start-tour'))
		await waitFor(() => {
			expect(document.body).toHaveTextContent('Логотип')
		})
		const next = within(document.body).getByText('Далее')
		await userEvent.click(next)
		await waitFor(() => {
			expect(document.body).toHaveTextContent('Поиск')
		})
		expect(args.onNext).toHaveBeenCalled()
	},
}

/** Завершение тура на последнем шаге */
export const Finish: Story = {
	args: {
		step: 2,
		onFinish: fn(),
		onClose: fn(),
	},
	render: args => ({
		components: { BaseTour },
		setup() {
			const isOpen = ref(false)
			const step = ref(2)
			return { args, isOpen, step }
		},
		template: `
			<div>
				${DEMO_LAYOUT}
				<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
			</div>
		`,
	}),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByTestId('start-tour'))
		await waitFor(() => {
			expect(document.body).toHaveTextContent('Профиль')
		})
		const finish = within(document.body).getByText('Завершить')
		await userEvent.click(finish)
		expect(args.onFinish).toHaveBeenCalled()
		expect(args.onClose).toHaveBeenCalled()
	},
}

/** Пропуск тура по кнопке закрытия */
export const Skip: Story = {
	args: {
		onSkip: fn(),
	},
	render: args => ({
		components: { BaseTour },
		setup() {
			const isOpen = ref(false)
			const step = ref(0)
			return { args, isOpen, step }
		},
		template: `
			<div>
				${DEMO_LAYOUT}
				<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
			</div>
		`,
	}),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByTestId('start-tour'))
		const close = await waitFor(() => {
			const button = document.querySelector<HTMLButtonElement>('.base-tour [aria-label="Пропустить тур"]')
			expect(button).not.toBeNull()
			return button as HTMLButtonElement
		})
		await userEvent.click(close)
		expect(args.onSkip).toHaveBeenCalled()
	},
}

/** Без индикатора прогресса и без кнопки пропуска */
export const Minimal: Story = {
	args: {
		showProgress: false,
		showSkip: false,
	},
	render: args => ({
		components: { BaseTour },
		setup() {
			const isOpen = ref(false)
			const step = ref(0)
			return { args, isOpen, step }
		},
		template: `
			<div>
				${DEMO_LAYOUT}
				<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByTestId('start-tour'))
		await waitFor(() => {
			expect(document.querySelector('.base-tour__card')).toBeInTheDocument()
		})
	},
}

/** Кастомное содержимое карточки через default-слот */
export const CustomContent: Story = {
	render: args => ({
		components: { BaseTour },
		setup() {
			const isOpen = ref(false)
			const step = ref(0)
			return { args, isOpen, step }
		},
		template: `
			<div>
				${DEMO_LAYOUT}
				<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step">
					<template #default="{ step, index, total, next, skip, isLast, finish }">
						<div style="padding:16px;background:var(--color-surface);border-radius:var(--border-radius-lg);box-shadow:var(--shadow-xl);width:280px;">
							<strong>{{ step.title }}</strong>
							<p style="color:var(--color-text-muted);font-size:14px;">{{ step.content }}</p>
							<div style="display:flex;justify-content:space-between;">
								<button @click="skip">Закрыть</button>
								<button v-if="!isLast" @click="next">Шаг {{ index + 2 }} из {{ total }}</button>
								<button v-else @click="finish">Готово</button>
							</div>
						</div>
					</template>
				</BaseTour>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByTestId('start-tour'))
		await waitFor(() => {
			expect(document.querySelector('.base-tour__card')).toBeInTheDocument()
		})
	},
}

/**
 * Размещение карточки. Управляется контролом `placement` (top/bottom/left/right/auto).
 * Мишень в центре экрана — видно как карточка встаёт с выбранной стороны.
 */
export const Placements: Story = {
	args: {
		placement: 'top',
		steps: [{ target: '#tour-center', title: 'Размещение', content: 'Меняйте контрол placement, чтобы увидеть сторону.' }],
		showProgress: false,
	},
	render: args => ({
		components: { BaseTour },
		setup() {
			const isOpen = ref(false)
			const step = ref(0)
			return { args, isOpen, step }
		},
		template: `
			<div style="min-height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">
				<div id="tour-center" style="padding:12px 20px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">
					Целевой элемент
				</div>
				<button
					data-testid="start-tour"
					style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;"
					@click="isOpen = true">
					Запустить тур
				</button>
				<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
			</div>
		`,
	}),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByTestId('start-tour'))
		await waitFor(() => {
			expect(document.querySelector(`.base-tour__card--${args.placement}`)).toBeInTheDocument()
		})
	},
}

/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: args => ({
		components: { BaseTour },
		setup() {
			const isOpen = ref(false)
			const step = ref(0)
			return { args, isOpen, step }
		},
		template: `
			<div>
				${DEMO_LAYOUT}
				<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByTestId('start-tour'))
		await waitFor(() => {
			expect(document.querySelector('.base-tour__card')).toBeInTheDocument()
		})
	},
}
