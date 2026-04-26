/**
 * Stories для компонента BaseAnimation.
 * Демонстрирует все типы анимаций, режимы и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BaseButton from '@/shared/ui/BaseButton/BaseButton.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { buildArgTypes } from '@/shared/utils/storybookUtils'

import { ANIMATION_MODES, ANIMATION_NAMES } from './BaseAnimation.types'
import BaseAnimation from './BaseAnimation.vue'

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

// ── 1. Default ──

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
}

// ── 2. AllTypes ──

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
}

// ── 3. SizeScale ──

/** Масштабирование sizeScale */
export const SizeScale: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAnimation :size-scale="75" />
<BaseAnimation :size-scale="100" />
<BaseAnimation :size-scale="150" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton, BaseText },
		setup() {
			const show = ref(true)
			const scales = [75, 100, 150]
			return { args, show, scales }
		},
		template: `
			<div>
				<BaseButton variant="outline" @click="show = !show" style="margin-bottom:16px;">
					Переключить
				</BaseButton>
				<div style="display:flex;gap:24px;align-items:end;">
					<div v-for="s in scales" :key="s">
						<BaseText tag="p" size="xs" style="margin-bottom:4px;">{{ s }}%</BaseText>
						<BaseAnimation v-bind="args" name="scale" :size-scale="s" :show="show">
							<div style="padding:16px;background:var(--color-surface-muted);border-radius:var(--border-radius-base);">
								Контент {{ s }}%
							</div>
						</BaseAnimation>
					</div>
				</div>
			</div>
		`,
	}),
}

// ── 4. Modes ──

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
}

// ── 5. GroupAnimation ──

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
}

// ── 6. DarkTheme ──

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
}

// ── 7. Interactive ──

/** Интерактивная story с полными контролами */
export const Interactive: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAnimation :show="show" :name="name" :mode="mode" :size-scale="sizeScale" />',
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
}
