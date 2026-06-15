/**
 * Stories для компонента BaseAnimation.
 * Демонстрирует все типы анимаций, режимы и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import BaseButton from '@components/BaseButton/ui/BaseButton.vue'
import { BaseText } from '@components/BaseText'
import { buildArgTypes } from '@utils/storybookUtils'

import { ANIMATION_MODES, ANIMATION_NAMES } from '../model/BaseAnimation.types'
import BaseAnimation from '../ui/BaseAnimation.vue'

const meta: Meta<typeof BaseAnimation> = {
	title: 'UI/BaseAnimation',
	component: BaseAnimation,

	argTypes: buildArgTypes({
		props: {
			show: {
				control: 'boolean',
				description: 'Управление видимостью контента',
			},
			name: {
				control: 'select',
				options: ANIMATION_NAMES,
				description: 'Имя анимации',
			},
			mode: {
				control: 'inline-radio',
				options: ANIMATION_MODES,
				description: 'Режим анимации (только для обычного Transition)',
			},
			isGroup: {
				control: 'boolean',
				description: 'Использовать TransitionGroup для списков',
			},
			tag: {
				control: 'text',
				description: 'HTML-тег для TransitionGroup',
			},
		},
	}),

	args: {
		show: true,
		name: 'fade',
		mode: 'out-in',
		isGroup: false,
		tag: 'div',
	},
}

export default meta
type Story = StoryObj<typeof BaseAnimation>
/** Анимация fade */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAnimation :show="show"><div>Контент</div></BaseAnimation>',
			},
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup() {
			const show = ref(true)
			return { args, show }
		},
		template: `
			<div>
				<BaseButton variant="outline" @click="show = !show" style="margin-bottom:16px;">
					Переключить
				</BaseButton>
				<BaseAnimation v-bind="args" :show="show">
					<div style="padding:24px;background:var(--color-surface-muted);border-radius:var(--border-radius-base);">
						Анимированный контент
					</div>
				</BaseAnimation>
			</div>
		`,
	}),
	args: {
		'onAfter-enter': fn(),
		'onAfter-leave': fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)
		const button = canvas.getByRole('button')
		// Кликаем для скрытия — вызовет after-leave
		await userEvent.click(button)
		await waitFor(() => expect(args['onAfter-leave']).toHaveBeenCalled())
		// Кликаем для показа — вызовет after-enter
		await userEvent.click(button)
		await waitFor(() => expect(args['onAfter-enter']).toHaveBeenCalled())
	},
}
/** Все типы анимаций */
export const AllTypes: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAnimation v-for="n in animationNames" :key="n" :name="n" :show="show" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton, BaseText },
		setup() {
			const show = ref(true)
			return { args, show, names: ANIMATION_NAMES }
		},
		template: `
			<div>
				<BaseButton variant="outline" @click="show = !show" style="margin-bottom:16px;">
					Переключить все
				</BaseButton>
				<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
					<div v-for="n in names" :key="n">
						<BaseText tag="p" size="xs" style="margin-bottom:4px;">{{ n }}</BaseText>
						<BaseAnimation v-bind="args" :name="n" :show="show">
							<div style="padding:16px;background:var(--color-surface-muted);border-radius:var(--border-radius-base);">
								{{ n }}
							</div>
						</BaseAnimation>
					</div>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const labels = canvasElement.querySelectorAll('.base-stepper__label, .base-text')
		expect(labels.length).toBeGreaterThan(0)
	},
}
/** Режимы анимации */
export const Modes: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAnimation v-for="m in ['out-in', 'in-out', 'default']" :key="m" :mode="m" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton, BaseText },
		setup() {
			const show = ref(true)
			return { args, show, modes: ANIMATION_MODES }
		},
		template: `
			<div>
				<BaseButton variant="outline" @click="show = !show" style="margin-bottom:16px;">
					Переключить
				</BaseButton>
				<div style="display:flex;gap:24px;">
					<div v-for="m in modes" :key="m">
						<BaseText tag="p" size="xs" style="margin-bottom:4px;">{{ m }}</BaseText>
						<BaseAnimation v-bind="args" name="fade" :mode="m" :show="show">
							<div style="padding:16px;background:var(--color-surface-muted);border-radius:var(--border-radius-base);">
								Контент
							</div>
						</BaseAnimation>
					</div>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('out-in')).toBeInTheDocument()
	},
}
/** Групповая анимация (TransitionGroup) */
export const GroupAnimation: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAnimation name="list" :is-group="true" :show="show" tag="ul" />',
			},
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup() {
			const show = ref(true)
			const items = ref(['Элемент 1', 'Элемент 2', 'Элемент 3', 'Элемент 4'])
			return { args, show, items }
		},
		template: `
			<div>
				<BaseButton variant="outline" @click="show = !show" style="margin-bottom:16px;">
					Переключить
				</BaseButton>
				<BaseAnimation v-bind="args" name="list" :is-group="true" :show="show" tag="ul" style="list-style:none;padding:0;">
					<li v-for="item in items" :key="item" style="padding:8px 16px;margin-bottom:4px;background:var(--color-surface-muted);border-radius:var(--border-radius-base);">
						{{ item }}
					</li>
				</BaseAnimation>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Элемент 1')).toBeInTheDocument()
		expect(canvas.getByText('Элемент 4')).toBeInTheDocument()
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	parameters: {
		docs: {
			source: {
				code: `<div data-theme="dark">
  <BaseAnimation :show="show" />
</div>`,
			},
		},
	},
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup() {
			const show = ref(true)
			return { args, show }
		},
		template: `
			<div>
				<BaseButton variant="outline" @click="show = !show" style="margin-bottom:16px;">
					Переключить
				</BaseButton>
				<BaseAnimation v-bind="args" :show="show">
					<div style="padding:24px;background:var(--color-surface-muted);border-radius:var(--border-radius-base);">
						Анимированный контент
					</div>
				</BaseAnimation>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByRole('button')).toBeInTheDocument()
	},
}
/** Интерактивная story с полными контролами */
export const Interactive: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAnimation :show="show" :name="name" :mode="mode" />',
			},
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup() {
			const show = ref(true)
			return { args, show }
		},
		template: `
			<div>
				<BaseButton variant="outline" @click="show = !show" style="margin-bottom:16px;">
					Переключить
				</BaseButton>
				<BaseAnimation v-bind="args" :show="show">
					<div style="padding:24px;background:var(--color-surface-muted);border-radius:var(--border-radius-base);">
						Анимированный контент
					</div>
				</BaseAnimation>
			</div>
		`,
	}),
	args: {
		'onAfter-enter': fn(),
		'onAfter-leave': fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)
		const button = canvas.getByRole('button')
		await userEvent.click(button)
		await waitFor(() => expect(args['onAfter-leave']).toHaveBeenCalled())
		await userEvent.click(button)
		await waitFor(() => expect(args['onAfter-enter']).toHaveBeenCalled())
	},
}

