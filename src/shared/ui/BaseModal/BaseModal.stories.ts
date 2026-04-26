/**
 * Stories для компонента BaseModal.
 * Демонстрирует все размеры, варианты, состояния и закрытие.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BaseModal from './BaseModal.vue'

const meta: Meta<typeof BaseModal> = {
	title: 'UI/BaseModal',
	component: BaseModal,

	argTypes: {
		isOpen: { control: 'boolean' },
		title: { control: 'text' },
		size: {
			control: 'inline-radio',
			options: ['sm', 'md', 'lg', 'xl', 'full'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		closeOnOverlay: { control: 'boolean' },
		onClose: { table: { disable: true } },
		onConfirm: { table: { disable: true } },
		'onUpdate:isOpen': { table: { disable: true } },
	},

	args: {
		isOpen: false,
		title: 'Модальное окно',
		size: 'md',
		variant: 'default',
		closeOnOverlay: true,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseModal>

/** Базовое модальное окно */
export const Default: Story = {
	render: args => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = true">Открыть</button>
				<BaseModal v-bind="args" v-model:is-open="isOpen">
					<p>Содержимое модального окна</p>
				</BaseModal>
			</div>
		`,
	}),
}

/** Все размеры */
export const Sizes: Story = {
	render: () => ({
		components: { BaseModal },
		setup() {
			const size = ref<'sm' | 'md' | 'lg' | 'xl' | 'full'>('sm')
			const isOpen = ref(false)
			const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const
			return { size, isOpen, sizes }
		},
		template: `
			<div style="display:flex;gap:8px;">
				<button v-for="s in sizes" :key="s"
					style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;"
					@click="size = s; isOpen = true">
					{{ s }}
				</button>
				<BaseModal :is-open="isOpen" :size="size" title="Размер" @update:is-open="isOpen = $event" @close="isOpen = false">
					<p>Размер: {{ size }}</p>
				</BaseModal>
			</div>
		`,
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpenDefault = ref(false)
			const isOpenGhost = ref(false)
			const isOpenOutline = ref(false)
			const isOpenShadow = ref(false)
			const isOpenSoft = ref(false)
			return { isOpenDefault, isOpenGhost, isOpenOutline, isOpenShadow, isOpenSoft }
		},
		template: `
			<div style="display:flex;gap:8px;flex-wrap:wrap;">
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpenDefault = true">default</button>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpenGhost = true">ghost</button>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpenOutline = true">outline</button>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpenShadow = true">shadow</button>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpenSoft = true">soft</button>

				<BaseModal v-model:is-open="isOpenDefault" variant="default" title="Default">
					<p>Стандартное модальное окно</p>
				</BaseModal>
				<BaseModal v-model:is-open="isOpenGhost" variant="ghost" title="Ghost">
					<p>Призрачное модальное окно</p>
				</BaseModal>
				<BaseModal v-model:is-open="isOpenOutline" variant="outline" title="Outline">
					<p>Контурное модальное окно</p>
				</BaseModal>
				<BaseModal v-model:is-open="isOpenShadow" variant="shadow" title="Shadow">
					<p>Модальное окно с тенью</p>
				</BaseModal>
				<BaseModal v-model:is-open="isOpenSoft" variant="soft" title="Soft">
					<p>Мягкое модальное окно</p>
				</BaseModal>
			</div>
		`,
	}),
}

/** Без закрытия по оверлею */
export const NoOverlayClose: Story = {
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = true">Открыть</button>
				<BaseModal v-model:is-open="isOpen" title="Без закрытия по оверлею" :close-on-overlay="false">
					<p>Клик по оверлею не закроет окно. Используйте кнопку ✕.</p>
				</BaseModal>
			</div>
		`,
	}),
}

/** Маленькое окно */
export const Small: Story = {
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = true">SM</button>
				<BaseModal v-model:is-open="isOpen" size="sm" title="Маленькое окно">
					<p>Компактное модальное окно</p>
				</BaseModal>
			</div>
		`,
	}),
}

/** Большое окно */
export const Large: Story = {
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = true">LG</button>
				<BaseModal v-model:is-open="isOpen" size="lg" title="Большое окно">
					<p>Широкое модальное окно для большого контента</p>
				</BaseModal>
			</div>
		`,
	}),
}

/** Полноэкранное окно */
export const FullScreen: Story = {
	render: () => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = true">Full</button>
				<BaseModal v-model:is-open="isOpen" size="full" title="Полноэкранное">
					<p>Полноэкранное модальное окно</p>
				</BaseModal>
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
		components: { BaseModal },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;color:var(--color-text);" @click="isOpen = true">Открыть</button>
				<BaseModal v-bind="args" v-model:is-open="isOpen">
					<p>Тёмная тема</p>
				</BaseModal>
			</div>
		`,
	}),
}

/** Интерактивное */
export const Interactive: Story = {
	render: args => ({
		components: { BaseModal },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div>
				<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = true">Открыть</button>
				<BaseModal v-bind="args" v-model:is-open="isOpen">
					<p>Контент</p>
				</BaseModal>
			</div>
		`,
	}),
}
