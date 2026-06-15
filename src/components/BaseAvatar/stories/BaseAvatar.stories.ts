/**
 * Stories для компонента BaseAvatar.
 * Демонстрирует все вариации, размеры, формы и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { BaseText } from '@components/BaseText'
import { buildArgTypes } from '@utils/storybookUtils'

import { AVATAR_SHAPES, AVATAR_VARIANTS } from '../model/BaseAvatar.types'
import BaseAvatar from '../ui/BaseAvatar.vue'

const meta: Meta<typeof BaseAvatar> = {
	title: 'UI/BaseAvatar',
	component: BaseAvatar,

	argTypes: buildArgTypes({
		props: {
			src: {
				control: 'text',
				description: 'URL изображения или GIF',
			},
			alt: {
				control: 'text',
				description: 'Альтернативный текст',
			},
			name: {
				control: 'text',
				description: 'Текст для генерации инициалов',
			},
			shape: {
				control: 'inline-radio',
				options: AVATAR_SHAPES,
				description: 'Форма аватара',
			},
			variant: {
				control: 'inline-radio',
				options: AVATAR_VARIANTS,
				description: 'Вариант отображения',
			},
			isOnline: {
				control: 'boolean',
				description: 'Онлайн-статус',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus',
			},
		},
	}),

	args: {
		name: 'Иван Петров',
		shape: 'circle',
		variant: 'default',
		isOnline: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseAvatar>
/** С инициалами */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAvatar name="Иван Петров" />',
			},
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup() {
			return { args }
		},
		template: '<BaseAvatar v-bind="args" />',
	}),
	args: {
		onClick: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const avatar = canvasElement.querySelector('.base-avatar') as HTMLElement
		await userEvent.click(avatar)
		expect(args.onClick).toHaveBeenCalled()
	},
}
/** С изображением */
export const WithImage: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAvatar src="https://placehold.co/96x96" alt="Аватар" />',
			},
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup() {
			return { args }
		},
		template: '<BaseAvatar v-bind="args" />',
	}),
	args: {
		src: 'https://placehold.co/96x96/f97316/ffffff?text=IP',
		alt: 'Аватар',
		onClick: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const avatar = canvasElement.querySelector('.base-avatar') as HTMLElement
		await userEvent.click(avatar)
		expect(args.onClick).toHaveBeenCalled()
	},
}
/** Без имени (инициалы по умолчанию '?') */
export const NoName: Story = {
	args: {
		name: '',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const initials = canvas.getByText('?')
		expect(initials).toBeInTheDocument()
	},
}
/** Слот по умолчанию */
export const WithSlot: Story = {
	render: args => ({
		components: { BaseAvatar },
		setup() {
			return { args }
		},
		template: `
			<BaseAvatar v-bind="args">
				<span class="custom-avatar-slot">Custom</span>
			</BaseAvatar>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const slotContent = canvas.getByText('Custom')
		expect(slotContent).toBeInTheDocument()
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		name: 'Кастомный цвет',
		color: {
			bg: {
				base: '#ff0000',
				hover: '#cc0000',
				active: '#990000',
				focus: '#ff0000',
			},
			text: {
				base: '#ffffff',
				hover: '#ffffff',
				active: '#ffffff',
				focus: '#ffffff',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const avatar = canvas.getByText('КЦ')
		expect(avatar).toBeInTheDocument()
	},
}
/** Src перекрывает инициалы */
export const SrcOverridesInitials: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAvatar name="Иван Петров" />
<BaseAvatar src="https://placehold.co/96x96" name="Иван Петров" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAvatar, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">Только имя (инициалы)</BaseText>
					<BaseAvatar v-bind="args" name="Иван Петров" />
				</div>
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">Src + имя (src побеждает)</BaseText>
					<BaseAvatar v-bind="args" src="https://placehold.co/96x96/f97316/ffffff?text=IP" name="Иван Петров" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const avatars = canvasElement.querySelectorAll('.base-avatar')
		expect(avatars.length).toBe(2)
	},
}
/** Все формы */
export const Shapes: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAvatar shape="circle" name="Круг" />
<BaseAvatar shape="square" name="Квадрат" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup() {
			return { args, shapes: AVATAR_SHAPES }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseAvatar v-for="s in shapes" :key="s" v-bind="args" :shape="s" :name="s" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const avatars = canvasElement.querySelectorAll('.base-avatar')
		expect(avatars.length).toBe(AVATAR_SHAPES.length)
	},
}
/** Все варианты */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAvatar variant="default" name="Default" />
<BaseAvatar variant="bordered" name="Bordered" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup() {
			return { args, variants: AVATAR_VARIANTS }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseAvatar v-for="v in variants" :key="v" v-bind="args" :variant="v" :name="v" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const avatars = canvasElement.querySelectorAll('.base-avatar')
		expect(avatars.length).toBe(AVATAR_VARIANTS.length)
	},
}
/** Онлайн-статус */
export const OnlineStatus: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAvatar name="Офлайн" :is-online="false" />
<BaseAvatar name="Онлайн" :is-online="true" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAvatar, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Офлайн</BaseText>
					<BaseAvatar v-bind="args" name="Офлайн" :is-online="false" />
				</div>
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Онлайн</BaseText>
					<BaseAvatar v-bind="args" name="Онлайн" :is-online="true" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const onlineIndicator = canvasElement.querySelector('.base-avatar__online')
		expect(onlineIndicator).toBeInTheDocument()
	},
}
/** Масштабирование sizeScale */
export const SizeScale: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAvatar :size-scale="75" />
<BaseAvatar :size-scale="100" />
<BaseAvatar :size-scale="150" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAvatar, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale">
					<BaseText tag="p" size="sm" style="margin-bottom: 8px; color: var(--color-text-muted);">{{ scale }}%</BaseText>
					<BaseAvatar v-bind="args" :size-scale="scale" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const avatars = canvasElement.querySelectorAll('.base-avatar')
		expect(avatars.length).toBe(3)
	},
}
/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAvatar name="N" />
<BaseAvatar name="H" class="base-avatar--hover" />
<BaseAvatar name="A" class="base-avatar--active" />
<BaseAvatar name="F" class="base-avatar--focus" />`,
			},
		},
	},
	render: () => ({
		components: { BaseAvatar, BaseText },
		setup() {
			return {}
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Normal</BaseText>
					<BaseAvatar name="N" />
				</div>
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Hover</BaseText>
					<BaseAvatar name="H" class="base-avatar--hover" />
				</div>
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Active</BaseText>
					<BaseAvatar name="A" class="base-avatar--active" />
				</div>
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Focus</BaseText>
					<BaseAvatar name="F" class="base-avatar--focus" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const avatars = canvasElement.querySelectorAll('.base-avatar')
		expect(avatars.length).toBe(4)
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	parameters: {
		docs: {
			source: {
				code: `<div data-theme="dark">
  <BaseAvatar name="Тёмная тема" />
</div>`,
			},
		},
	},
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: {
		name: 'Тёмная тема',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const avatar = canvas.getByText('ТТ')
		expect(avatar).toBeInTheDocument()
	},
}
/** Ошибка загрузки изображения — fallback на инициалы */
export const ImageLoadError: Story = {
	args: {
		src: 'https://placehold.co/96x96/f97316/ffffff?text=IP',
		name: 'Иван Петров',
	},
	play: async ({ canvasElement }) => {
		const img = canvasElement.querySelector('.base-avatar__img img') as HTMLImageElement
		expect(img).toBeTruthy()

		img.dispatchEvent(new Event('error'))

		await waitFor(() => {
			const initials = canvasElement.querySelector('.base-avatar__initials')
			expect(initials).toBeTruthy()
			expect(initials?.textContent).toContain('ИП')
		})
	},
}
/** Сброс ошибки при смене src */
export const SrcChangeResetsError: Story = {
	render: () => ({
		components: { BaseAvatar },
		setup() {
			const currentSrc = ref('https://placehold.co/96x96/f97316/ffffff?text=A')
			function changeSrc(): void {
				currentSrc.value = 'https://placehold.co/96x96/3b82f6/ffffff?text=B'
			}
			return { currentSrc, changeSrc }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;">
				<BaseAvatar :src="currentSrc" name="Иван Петров" />
				<button class="change-src-btn" type="button" @click="changeSrc">Сменить src</button>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const img = canvasElement.querySelector('.base-avatar__img img') as HTMLImageElement
		expect(img).toBeTruthy()

		img.dispatchEvent(new Event('error'))

		await waitFor(() => {
			const initials = canvasElement.querySelector('.base-avatar__initials')
			expect(initials).toBeTruthy()
		})

		const button = canvasElement.querySelector('.change-src-btn') as HTMLButtonElement
		await userEvent.click(button)

		await waitFor(() => {
			const imgAfter = canvasElement.querySelector('.base-avatar__img img')
			expect(imgAfter).toBeTruthy()
		})
	},
}
