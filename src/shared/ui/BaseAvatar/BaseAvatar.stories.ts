/**
 * Stories для компонента BaseAvatar.
 * Демонстрирует все вариации, размеры, формы и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { BaseText } from '@/shared/ui/BaseText'
import { buildArgTypes } from '@/shared/utils/storybookUtils'

import { AVATAR_SHAPES, AVATAR_VARIANTS } from './BaseAvatar.types'
import BaseAvatar from './BaseAvatar.vue'

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

// ── 1. Default ──

/** С инициалами */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAvatar name="Иван Петров" />',
			},
		},
	},
}

// ── 2. WithImage ──

/** С изображением */
export const WithImage: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAvatar src="https://placehold.co/96x96" alt="Аватар" />',
			},
		},
	},
	args: {
		src: 'https://placehold.co/96x96/f97316/ffffff?text=IP',
		alt: 'Аватар',
	},
}

// ── 3. SrcOverridesInitials ──

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
}

// ── 4. Shapes ──

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
}

// ── 5. Variants ──

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
}

// ── 7. OnlineStatus ──

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
}

// ── 8. SizeScale ──

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
}

// ── 9. HoverState ──

/** Принудительное hover-состояние */
export const HoverState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAvatar name="Hover" class="base-avatar--hover" />',
			},
		},
	},
	render: () => ({
		components: { BaseAvatar },
		setup() {
			return {}
		},
		template: `<BaseAvatar name="Hover" class="base-avatar--hover" />`,
	}),
}

// ── 10. ActiveState ──

/** Принудительное active-состояние */
export const ActiveState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAvatar name="Active" class="base-avatar--active" />',
			},
		},
	},
	render: () => ({
		components: { BaseAvatar },
		setup() {
			return {}
		},
		template: `<BaseAvatar name="Active" class="base-avatar--active" />`,
	}),
}

// ── 11. FocusState ──

/** Принудительное focus-состояние */
export const FocusState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAvatar name="Focus" class="base-avatar--focus" />',
			},
		},
	},
	render: () => ({
		components: { BaseAvatar },
		setup() {
			return {}
		},
		template: `<BaseAvatar name="Focus" class="base-avatar--focus" />`,
	}),
}

// ── 12. InteractiveStates ──

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
}

// ── 13. DarkTheme ──

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
}

// ── 14. Interactive ──

/** Интерактивная story с полными контролами */
export const Interactive: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAvatar :name="name" :size="size" :shape="shape" :variant="variant" :size-scale="sizeScale" />',
			},
		},
	},
}
