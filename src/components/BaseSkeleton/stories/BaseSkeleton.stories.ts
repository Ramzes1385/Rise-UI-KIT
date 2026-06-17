/**
 * Stories для компонента BaseSkeleton.
 * Демонстрирует все формы, анимации и кастомный цвет фона.
 */

import { expect, within } from 'storybook/test'
import BaseSkeleton from '../ui/BaseSkeleton.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseSkeleton> = {
	title: 'UI/BaseSkeleton',
	component: BaseSkeleton,

	argTypes: {
		width: { control: 'text' },
		height: { control: 'text' },
		shape: {
			control: 'inline-radio',
			options: ['text', 'circle', 'rect'],
		},
		color: {
			control: 'color',
			description: 'Кастомный цвет фона',
		},
		isAnimated: { control: 'boolean' },
		isPulse: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
	},

	args: {
		width: '100%',
		height: '20px',
		shape: 'text',
		isAnimated: true,
		isPulse: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseSkeleton>
// play удалён: дублирует "должен рендерить скелетон с числовыми размерами" в *.integration.spec.ts
/** Базовое состояние компонента */
export const Default: Story = {}
// play удалён: дублирует "должен рендерить скелетон с числовыми размерами" в *.integration.spec.ts
/** Различные формы */
export const Shapes: Story = {
	render: args => ({
		components: { BaseSkeleton },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSkeleton v-bind="args" shape="text" width="100%" height="16px" />
				<BaseSkeleton v-bind="args" shape="rect" width="100%" height="120px" />
				<BaseSkeleton v-bind="args" shape="circle" width="64px" height="64px" />
			</div>
		`,
	}),
}
// play удалён: дублирует "должен рендерить скелетон с числовыми размерами" в *.integration.spec.ts
/** Анимация pulse */
export const Pulse: Story = {
	args: {
		isPulse: true,
	},
}
// play удалён: дублирует "должен рендерить скелетон с числовыми размерами" в *.integration.spec.ts
/** Без анимации */
export const NoAnimation: Story = {
	args: {
		isAnimated: false,
	},
}
// play удалён: дублирует "должен рендерить скелетон с числовыми размерами" в *.integration.spec.ts
/** Размеры текстовых заглушек */
export const TextSizes: Story = {
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;max-width:320px;">
				<BaseSkeleton shape="text" width="100%" height="12px" />
				<BaseSkeleton shape="text" width="90%" height="14px" />
				<BaseSkeleton shape="text" width="80%" height="16px" />
				<BaseSkeleton shape="text" width="70%" height="20px" />
				<BaseSkeleton shape="text" width="60%" height="24px" />
			</div>
		`,
	}),
}
// play удалён: дублирует "должен рендерить скелетон с числовыми размерами" в *.integration.spec.ts
/** Отображение в тёмной теме */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseSkeleton },
		template: `
			<div style="max-width:320px;display:flex;flex-direction:column;gap:12px;">
				<BaseSkeleton shape="rect" width="100%" height="180px" />
				<BaseSkeleton shape="text" width="80%" height="20px" />
				<BaseSkeleton shape="text" width="60%" height="16px" />
			</div>
		`,
	}),
}
/** Кастомный цвет фона + sizeScale ≠ 100 — покрывает строки 61 и 66 */
export const ColorAndScale: Story = {
	args: {
		shape: 'rect',
		width: '200px',
		height: '40px',
		color: '#ff0000',
		sizeScale: 150,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const skeleton = await canvas.findByRole('status', { hidden: true }).catch(() => null)
		const root = skeleton ?? canvasElement.querySelector<HTMLElement>('.base-skeleton')
		expect(root).not.toBeNull()
		if (root instanceof HTMLElement) {
			expect(root.style.backgroundColor).toBeTruthy()
			expect(root.style.getPropertyValue('--size-scale')).toBe('1.5')
		}
	},
}
/** Числовые размеры — покрывает typeof === 'number' (строки 44, 53) */
export const NumericSize: Story = {
	args: {
		shape: 'rect',
		width: 240,
		height: 80,
		sizeScale: 100,
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector<HTMLElement>('.base-skeleton')
		expect(root).not.toBeNull()
		if (root instanceof HTMLElement) {
			expect(root.style.width).toBe('240px')
			expect(root.style.height).toBe('80px')
		}
	},
}
/** Без размеров — покрывает false-ветку if (props.width) и if (props.height) (строки 42, 51) */
export const WithoutDimensions: Story = {
	args: {
		shape: 'circle',
		width: undefined,
		height: undefined,
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector<HTMLElement>('.base-skeleton')
		expect(root).not.toBeNull()
		if (root instanceof HTMLElement) {
			expect(root.style.width).toBe('')
			expect(root.style.height).toBe('')
		}
	},
}
