import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import BaseSeparator from '../ui/BaseSeparator.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, slotArgType, useArgsWithoutSlots } from '@/stories/helpers'

const meta = {
	title: 'Element/BaseSeparator',
	component: BaseSeparator,
	parameters: {
		docs: {
			description: {
				component: [
					'Разделитель групп содержимого: секций карточки, пунктов меню, кнопок тулбара.',
					'',
					'- Линия 1px цвета рамок (`--rise-border`); `isDashed` — пунктир, `thickness` — толщина.',
					'- `label` или слот ставят подпись между двумя линиями: «или» в форме входа, дата в ленте сообщений.',
					'- `orientation="vertical"` — вертикальная линия во всю высоту ряда (тулбары, строки с метаданными).',
					'- Доступность: `role="separator"` с `aria-orientation`; подпись — имя разделителя через `aria-labelledby`.',
				].join('\n'),
			},
		},
	},
	decorators: [() => ({ template: '<div class="story-medium"><story /></div>' })],
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant'),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
		isDashed: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		thickness: { control: { type: 'range', min: 1, max: 8, step: 1 }, table: propGroup(ARG_GROUP.appearance) },
		spacing: { control: { type: 'range', min: 0, max: 24, step: 2 }, table: propGroup(ARG_GROUP.appearance) },
		default: slotArgType('Содержимое между линиями вместо label'),
	},
	args: {
		orientation: 'horizontal',
		isDashed: false,
		thickness: 1,
		sizeScale: 100,
	},
} satisfies Meta<typeof BaseSeparator>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Подпись между линиями: 12/16, приглушённый цвет. Подпись становится доступным именем разделителя. */
export const WithLabel: Story = {
	args: { label: 'или' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator', { name: 'или' })).toBeVisible()
	},
}

/** Вертикальный разделитель занимает высоту ряда: пункты тулбара, метаданные в строке. С подписью — выбор между вариантами. */
export const Vertical: Story = {
	args: { orientation: 'vertical' },
	parameters: {
		controls: { include: ['isDashed', 'thickness', 'color', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<div style="display: flex; align-items: center; gap: 12px;">',
					'  <span>Черновик</span>',
					'  <BaseSeparator orientation="vertical" />',
					'  <span>Изменён 15 мая</span>',
					'</div>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label']) }),
		template: `
			<div class="story-stack">
				<div class="story-row" style="flex-wrap: nowrap;">
					<span>Черновик</span>
					<BaseSeparator v-bind="props" />
					<span>Изменён 15 мая</span>
					<BaseSeparator v-bind="props" />
					<span>3 комментария</span>
				</div>
				<div class="story-row" style="flex-wrap: nowrap; height: 96px;">
					<span>Тариф «Старт»</span>
					<BaseSeparator v-bind="props" label="или" />
					<span>Тариф «Команда»</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		for (const separator of canvas.getAllByRole('separator')) {
			await expect(separator).toHaveAttribute('aria-orientation', 'vertical')
		}
		await expect(canvas.getByRole('separator', { name: 'или' })).toBeVisible()
	},
}

/** Пунктир (`isDashed`) — для второстепенных границ: «ниже — необязательные поля», черновые разделы. */
export const Dashed: Story = {
	args: { isDashed: true },
	parameters: { controls: { include: ['thickness', 'color', 'sizeScale'] } },
	render: args => ({
		components: { BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label']) }),
		template: `
			<div class="story-stack">
				<BaseSeparator v-bind="props" />
				<BaseSeparator v-bind="props" label="Необязательные поля" />
			</div>
		`,
	}),
}

/** Толщина линии `thickness` в пикселях: 1 — по умолчанию, 2–4 — для акцентных границ разделов. */
export const Thickness: Story = {
	parameters: {
		controls: { include: ['isDashed', 'color'] },
		docs: { source: { code: [1, 2, 4].map(thickness => `<BaseSeparator :thickness="${thickness}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label', 'thickness']), thicknesses: [1, 2, 4] }),
		template: `
			<div class="story-stack">
				<div v-for="thickness in thicknesses" :key="thickness" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ thickness }}px</span>
					<BaseSeparator v-bind="props" :thickness="thickness" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg` — цвет линии, `text` — цвет подписи. Здесь — токен основного цвета,
 * поэтому подпись контрастна в обеих темах: «новые сообщения» в ленте чата.
 */
export const CustomColor: Story = {
	args: {
		label: 'Новые сообщения',
		color: { bg: { base: 'var(--rise-primary)' }, text: { base: 'var(--rise-primary)' } },
	},
	play: async ({ canvas }) => {
		const separator = canvas.getByRole('separator', { name: 'Новые сообщения' })
		const line = separator.querySelector('.base-separator__line') as HTMLElement
		const label = canvas.getByText('Новые сообщения')
		await expect(getComputedStyle(line).borderTopColor).toBe(getComputedStyle(label).color)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Слот `default` вместо `label`: иконка или дата в ленте сообщений. Текст слота — имя разделителя. */
export const WithSlot: Story = {
	parameters: {
		controls: { include: ['isDashed', 'thickness', 'color', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseSeparator>',
					'  <BaseIcon name="star" />',
					'</BaseSeparator>',
					'<BaseSeparator>15 мая, четверг</BaseSeparator>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSeparator, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label']) }),
		template: `
			<div class="story-stack">
				<BaseSeparator v-bind="props"><BaseIcon name="star" :size-scale="80" /></BaseSeparator>
				<BaseSeparator v-bind="props">15 мая, четверг</BaseSeparator>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator', { name: '15 мая, четверг' })).toBeVisible()
	},
}

/**
 * Отступы подписи `spacing` (px): вдоль линии — значение × 2, поперёк — значение.
 * Без пропа — 12px вдоль линии и 0 поперёк: разделитель с подписью не выше строки текста.
 */
export const Spacing: Story = {
	args: { label: 'или' },
	parameters: {
		controls: { include: ['orientation', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseSeparator label="или" />',
					'<BaseSeparator label="или" :spacing="4" />',
					'<BaseSeparator label="или" :spacing="16" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'spacing']) }),
		template: `
			<div class="story-stack">
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">по умолчанию</span>
					<BaseSeparator v-bind="props" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">spacing 4</span>
					<BaseSeparator v-bind="props" :spacing="4" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">spacing 16</span>
					<BaseSeparator v-bind="props" :spacing="16" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [themed, compact] = canvas.getAllByText('или')
		await expect(getComputedStyle(themed).paddingLeft).toBe('12px')
		await expect(getComputedStyle(compact).paddingLeft).toBe('8px')
	},
}
