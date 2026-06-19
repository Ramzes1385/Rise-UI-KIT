/**
 * Stories для компонента BaseChip.
 * Демонстрирует все вариации, размеры, позиции и интерактивные состояния.
 */

import { expect, fn, userEvent, within } from 'storybook/test'
import { buildArgTypes } from '@utils/storybookUtils'
import { CHIP_VARIANTS } from '../model/BaseChip.types'
import BaseChip from '../ui/BaseChip.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseChip> = {
	title: 'UI/BaseChip',
	component: BaseChip,

	argTypes: buildArgTypes({
		props: {
			content: { control: 'text' },
			placement: {
				control: 'inline-radio',
				options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
			},
			variant: {
				control: 'radio',
				options: CHIP_VARIANTS,
			},
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			isHiddenOnZero: { control: 'boolean' },
			hasOverflow: { control: 'boolean' },
			maxValue: { control: 'number' },
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			'onClick-badge': { table: { disable: true } },
			default: {
				control: 'text',
				description: 'Контент (слот)',
			},
			customClass: { control: 'object' },
		},
	}),

	args: {
		content: 5,
		placement: 'top-right',
		variant: 'default',
		isHiddenOnZero: false,
		hasOverflow: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseChip>
/** Базовый чип */
export const Default: Story = {
	render: args => ({
		components: { BaseChip },
		setup() {
			return { args }
		},
		template: '<BaseChip v-bind="args">{{ args.default }}</BaseChip>',
	}),
	args: {
		default: 'Уведомления',
		'onClick-badge': fn(),
	},
	play: async ({ canvasElement, args }) => {
		const badge = canvasElement.querySelector('.base-chip__badge') as HTMLElement
		await userEvent.click(badge)
		expect(args['onClick-badge']).toHaveBeenCalled()
	},
}
/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseChip },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-bind="args"
					:variant="v"
					:content="3"
				>
					{{ v }}
				</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('default')).toBeInTheDocument()
		expect(canvas.getByText('ghost')).toBeInTheDocument()
		expect(canvas.getByText('outline')).toBeInTheDocument()
	},
}
/** Масштабирование размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseChip },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip v-bind="args" :size-scale="75" :content="3">75%</BaseChip>
				<BaseChip v-bind="args" :size-scale="100" :content="3">100%</BaseChip>
				<BaseChip v-bind="args" :size-scale="150" :content="3">150%</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('75%')).toBeInTheDocument()
		expect(canvas.getByText('150%')).toBeInTheDocument()
	},
}
/** Все позиции */
export const Placements: Story = {
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;gap:24px;align-items:center;">
				<BaseChip v-for="p in ['top-right','top-left','bottom-right','bottom-left']"
					:key="p"
					:placement="p"
					:content="7"
				>
					{{ p }}
				</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('top-right')).toBeInTheDocument()
		expect(canvas.getByText('bottom-left')).toBeInTheDocument()
	},
}
/** Текстовый контент */
export const TextContent: Story = {
	args: {
		content: 'New',
		default: 'Сообщения',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('New')).toBeInTheDocument()
	},
}
/** С maxValue */
export const WithMaxValue: Story = {
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip :content="50" :max-value="9" has-overflow>max 9</BaseChip>
				<BaseChip :content="150" :max-value="99" has-overflow>max 99</BaseChip>
				<BaseChip :content="999" :max-value="999" has-overflow>max 999</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('9+')).toBeInTheDocument()
		expect(canvas.getByText('99+')).toBeInTheDocument()
		expect(canvas.getByText('999')).toBeInTheDocument()
	},
}
/** Скрытие при нулевом значении */
export const HiddenOnZero: Story = {
	args: {
		content: 0,
		isHiddenOnZero: true,
		default: 'Скрыто при 0',
	},
	play: async ({ canvasElement }) => {
		// При isHiddenOnZero и content=0 бейдж не отображается
		const badge = canvasElement.querySelector('.base-chip__badge')
		expect(badge).toBeNull()
	},
}
/** Без контента (только слот) */
export const NoBadge: Story = {
	args: {
		default: 'Без бейджа',
		content: undefined,
	},
	play: async ({ canvasElement }) => {
		// Без content бейдж не отображается
		const badge = canvasElement.querySelector('.base-chip__badge')
		expect(badge).toBeNull()
	},
}
/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseChip content="5" variant="default">default</BaseChip>
					<BaseChip content="5" variant="soft">soft</BaseChip>
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseChip content="5" variant="default" class="base-chip--hover">default</BaseChip>
					<BaseChip content="5" variant="soft" class="base-chip--hover">soft</BaseChip>
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseChip content="5" variant="default" class="base-chip--focus">default</BaseChip>
					<BaseChip content="5" variant="soft" class="base-chip--focus">soft</BaseChip>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Normal')).toBeInTheDocument()
		expect(canvas.getByText('Hover')).toBeInTheDocument()
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					:variant="v"
					:content="3"
				>
					{{ v }}
				</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('default')).toBeInTheDocument()
	},
}
/** Строка-число как content — покрывает ветку Number.isNaN(parsed) === false */
export const StringNumberContent: Story = {
	args: {
		content: '10',
		default: 'Уведомления',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('10')).toBeInTheDocument()
	},
}
/** Пустая строка как content — покрывает ветку content === '' */
export const EmptyStringContent: Story = {
	args: {
		content: '',
		default: 'Без контента',
	},
	play: async ({ canvasElement }) => {
		const badge = canvasElement.querySelector('.base-chip__badge')
		expect(badge).toBeNull()
	},
}
/** Нечисловая строка — покрывает Number.isNaN(parsed) === true (numericValue = null) */
export const NonNumericStringContent: Story = {
	args: {
		content: 'abc',
		default: 'Не число',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('abc')).toBeInTheDocument()
	},
}
/** Нечисловая строка с hasOverflow — покрывает displayContent с numericValue===null и hasOverflow */
export const NonNumericOverflow: Story = {
	args: {
		content: 'xyz',
		hasOverflow: true,
		maxValue: 99,
		default: 'Не число+overflow',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('xyz')).toBeInTheDocument()
	},
}
/** Кастомный цвет — покрывает useCustomColor с переданным color */
export const CustomColor: Story = {
	args: {
		content: 5,
		default: 'Кастомный цвет',
		color: {
			bg: { base: '#ff0000', hover: '#cc0000' },
			text: { base: '#ffffff' },
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('5')).toBeInTheDocument()
		const chip = canvasElement.querySelector('.base-chip') as HTMLElement
		expect(chip.style.getPropertyValue('--custom-bg')).toBe('#ff0000')
	},
}
/** Покрывает: isHiddenOnZero=true с ненулевым контентом (isVisible → true) */
export const HiddenOnZeroWithContent: Story = {
	args: {
		content: 5,
		isHiddenOnZero: true,
		default: 'Не скрыто',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('5')).toBeInTheDocument()
	},
}
/** Покрывает: isHiddenOnZero=true с content=undefined (isVisible → false) */
export const HiddenOnZeroUndefined: Story = {
	args: {
		content: undefined,
		isHiddenOnZero: true,
		default: 'Скрыто',
	},
	play: async ({ canvasElement }) => {
		const badge = canvasElement.querySelector('.base-chip__badge')
		expect(badge).toBeNull()
	},
}
/** Покрывает: content как число с hasOverflow, но не превышает maxValue */
export const OverflowNotExceeded: Story = {
	args: {
		content: 50,
		hasOverflow: true,
		maxValue: 99,
		default: 'Не превышено',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('50')).toBeInTheDocument()
	},
}
/** Покрывает: числовая строка с hasOverflow и значение > maxValue → "99+" */
export const StringNumberOverflow: Story = {
	args: {
		content: '150',
		hasOverflow: true,
		maxValue: 99,
		default: 'Строка-число overflow',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('99+')).toBeInTheDocument()
	},
}
/** Длинный контент — проверка a11y-дерева с длинным лейблом */
export const LongContent: Story = {
	args: {
		content: 5,
		default:
			'Очень длинный текст лейбла чипа который превышает сто символов для проверки корректности обработки длинного контента в a11y-дереве',
	},
	play: async ({ canvasElement }) => {
		const chip = canvasElement.querySelector('.base-chip')
		expect(chip).toBeInTheDocument()
		expect(chip?.textContent?.length).toBeGreaterThan(100)
	},
}
/** Кастомные CSS-классы через customClass */
export const WithCustomClass: Story = {
	args: {
		content: 3,
		customClass: { root: 'chip-root', badge: 'chip-badge' },
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.chip-root')).toBeTruthy()
	},
}
