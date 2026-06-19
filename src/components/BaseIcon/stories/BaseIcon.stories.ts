/**
 * Stories для компонента BaseIcon.
 * Демонстрирует масштабирование, трансформации, цвета и использование с иконками из спрайта.
 */

import { buildArgTypes } from '@utils/storybookUtils'
import BaseIcon from '../ui/BaseIcon.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Список иконок из спрайта */
const ICON_NAMES = [
	'close',
	'check',
	'plus',
	'x-mark',
	'chevron-down',
	'chevron-up',
	'chevron-left',
	'chevron-right',
	'arrow-right',
	'arrow-left',
	'arrow-down',
	'eye-open-icon',
	'eye-closed-icon',
	'search',
	'menu',
	'attach',
	'mic',
	'send',
	'play',
	'pause',
	'reply',
	'sort',
	'sort-up',
	'sort-down',
]

const meta: Meta<typeof BaseIcon> = {
	title: 'UI/BaseIcon',
	component: BaseIcon,

	argTypes: buildArgTypes({
		props: {
			name: { control: 'select', options: ICON_NAMES },
			color: { control: 'text', description: 'CSS-значение цвета или переменная' },
			rotate: { control: { type: 'range', min: 0, max: 360, step: 15 } },
			isFlipX: { control: 'boolean' },
			isFlipY: { control: 'boolean' },
			ariaLabel: { control: 'text' },
			sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 } },
			customClass: { control: 'object' },
		},
	}),

	args: {
		name: 'close',
		color: '',
		rotate: 0,
		isFlipX: false,
		isFlipY: false,
		ariaLabel: '',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseIcon>
// play удалён: дублирует "должен рендерить SVG-элемент с реальным useIcon" в *.integration.spec.ts
/** Базовое состояние компонента */
export const Default: Story = {}
// play удалён: дублирует "должен рендерить SVG-элемент с реальным useIcon" в *.integration.spec.ts
/** Масштабирование размера через sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args, scales: [60, 80, 100, 140, 180] }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div v-for="s in scales" :key="s" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" :size-scale="s" />
					<span style="font-size:10px;color:var(--color-text-muted);">{{ s }}%</span>
				</div>
			</div>
		`,
	}),
}
// play удалён: дублирует "должен рендерить SVG-элемент с реальным useIcon" в *.integration.spec.ts
/** Галерея всех доступных иконок */
export const AllIcons: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args, icons: ICON_NAMES }
		},
		template: `
			<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
				<div v-for="icon in icons" :key="icon" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">
					<BaseIcon v-bind="args" :name="icon" :size-scale="140" />
					<span style="font-size:10px;color:var(--color-text-muted);word-break:break-all;">{{ icon }}</span>
				</div>
			</div>
		`,
	}),
}
// play удалён: дублирует "должен рендерить SVG-элемент с реальным useIcon" в *.integration.spec.ts
/** Поворот иконки */
export const Rotate: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args, angles: [0, 45, 90, 180, 270] }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div v-for="angle in angles" :key="angle" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" :rotate="angle" :size-scale="140" />
					<span style="font-size:10px;color:var(--color-text-muted);">{{ angle }}°</span>
				</div>
			</div>
		`,
	}),
}
// play удалён: дублирует "должен рендерить SVG-элемент с реальным useIcon" в *.integration.spec.ts
/** Отражение иконки по осям */
export const Flip: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" :size-scale="140" />
					<span style="font-size:10px;color:var(--color-text-muted);">Оригинал</span>
				</div>
				<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" :size-scale="140" :is-flip-x="true" />
					<span style="font-size:10px;color:var(--color-text-muted);">FlipX</span>
				</div>
				<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" :size-scale="140" :is-flip-y="true" />
					<span style="font-size:10px;color:var(--color-text-muted);">FlipY</span>
				</div>
			</div>
		`,
	}),
}
// play удалён: дублирует "должен рендерить SVG-элемент с реальным useIcon" в *.integration.spec.ts
/** Кастомный цвет иконки */
export const WithColor: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return {
				args,
				colors: ['var(--color-primary)', 'var(--color-accent)', 'var(--color-error)', 'var(--color-success)'],
			}
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseIcon v-for="c in colors" :key="c" v-bind="args" :color="c" :size-scale="140" />
			</div>
		`,
	}),
}
// play удалён: дублирует "должен рендерить SVG-элемент с реальным useIcon" в *.integration.spec.ts
/** Отображение в тёмной теме */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: {
		sizeScale: 140,
	},
}
/** С ariaLabel — покрывает ложную ветку `isDecorative` (role='img', aria-hidden=undefined) */
export const WithAriaLabel: Story = {
	args: {
		name: 'check',
		ariaLabel: 'Подтверждение действия',
		sizeScale: 140,
	},
}
