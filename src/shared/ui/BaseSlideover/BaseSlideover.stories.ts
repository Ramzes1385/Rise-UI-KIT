/**
 * Stories для компонента BaseSlideover.
 * Демонстрирует все стороны, масштабы ширины и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseInput } from '@/shared/ui/BaseInput'
import BaseSlideover from './BaseSlideover.vue'

const meta: Meta<typeof BaseSlideover> = {
	title: 'UI/BaseSlideover',
	component: BaseSlideover,

	argTypes: {
		isOpen: { control: 'boolean' },
		title: { control: 'text' },
		side: {
			control: 'inline-radio',
			options: ['left', 'right'],
		},
		width: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
		},
		isFullWidth: { control: 'boolean' },
		closeOnOverlay: { control: 'boolean' },
		closeOnEscape: { control: 'boolean' },
		onClose: { table: { disable: true } },
	},

	args: {
		isOpen: false,
		title: 'Боковая панель',
		side: 'right',
		width: 100,
		isFullWidth: false,
		closeOnOverlay: true,
		closeOnEscape: true,
	},
}

export default meta
type Story = StoryObj<typeof BaseSlideover>

/** Базовая панель справа */
export const Default: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<p>Содержимое боковой панели</p>
				</BaseSlideover>
			</div>
		`,
	}),
}

/** Слева */
export const Left: Story = {
	args: {
		side: 'left',
	},
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Слева</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<p>Панель слева</p>
				</BaseSlideover>
			</div>
		`,
	}),
}

/** Узкая панель (width: 75) */
export const Narrow: Story = {
	args: {
		width: 75,
	},
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Узкая панель</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<p>Узкая панель (width: 75)</p>
				</BaseSlideover>
			</div>
		`,
	}),
}

/** Широкая панель (width: 150) */
export const Wide: Story = {
	args: {
		width: 150,
	},
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Широкая панель</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<p>Широкая панель (width: 150)</p>
				</BaseSlideover>
			</div>
		`,
	}),
}

/** Полноэкранная */
export const FullWidth: Story = {
	args: {
		isFullWidth: true,
	},
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Полная ширина</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<p>Полноэкранная панель</p>
				</BaseSlideover>
			</div>
		`,
	}),
}

/** Без закрытия по оверлею */
export const NoOverlayClose: Story = {
	render: () => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Без закрытия по оверлею</BaseButton>
				<BaseSlideover v-model:is-open="isOpen" title="Без закрытия по оверлею" :close-on-overlay="false">
					<p>Клик по оверлею не закроет панель</p>
				</BaseSlideover>
			</div>
		`,
	}),
}

/** С формой */
export const WithForm: Story = {
	render: () => ({
		components: { BaseSlideover, BaseButton, BaseInput },
		setup() {
			const isOpen = ref(false)
			const name = ref('')
			const phone = ref('')
			return { isOpen, name, phone }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Форма заказа</BaseButton>
				<BaseSlideover v-model:is-open="isOpen" title="Оформить заказ" :width="100">
					<div style="display:flex;flex-direction:column;gap:16px;">
						<BaseInput v-model="name" placeholder="Ваше имя" label="Имя" />
						<BaseInput v-model="phone" placeholder="+7 999 123-45-67" label="Телефон" />
					</div>
				</BaseSlideover>
			</div>
		`,
	}),
}

/** С длинным контентом */
export const WithLongContent: Story = {
	render: () => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Длинный контент</BaseButton>
				<BaseSlideover v-model:is-open="isOpen" title="Подробности" :width="100">
					<div style="display:flex;flex-direction:column;gap:12px;">
						<p v-for="i in 20" :key="i">Параграф {{ i }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
					</div>
				</BaseSlideover>
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
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<p>Тёмная тема</p>
				</BaseSlideover>
			</div>
		`,
	}),
}

/** Интерактивная */
export const Interactive: Story = {
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<BaseButton @click="isOpen = true">Открыть</BaseButton>
				<BaseSlideover v-bind="args" v-model:is-open="isOpen">
					<p>Контент</p>
				</BaseSlideover>
			</div>
		`,
	}),
}
