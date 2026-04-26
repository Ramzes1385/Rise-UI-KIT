/**
 * Stories для компонента BaseAccordion.
 * Демонстрирует все вариации, режимы и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import BaseBadge from '@/shared/ui/BaseBadge/BaseBadge.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { buildArgTypes } from '@/shared/utils/storybookUtils'

import type { BaseAccordionItem } from './BaseAccordion.types'
import { ACCORDION_VARIANTS } from './BaseAccordion.types'
import BaseAccordion from './BaseAccordion.vue'

/** Стандартный набор элементов */
const ITEMS: BaseAccordionItem[] = [
	{ label: 'Материалы', content: 'Работаем с металлом, деревом и камнем', defaultOpen: true },
	{ label: 'Доставка', content: 'Доставка по всей России от 3 до 14 дней' },
	{ label: 'Гарантия', content: 'Гарантия 2 года на все изделия' },
	{ label: 'Возврат', content: 'Возврат в течение 14 дней', isDisabled: true },
]

/** Элементы с длинным контентом */
const LONG_ITEMS: BaseAccordionItem[] = [
	{
		label: 'Подробное описание процесса',
		content:
			'Каждое изделие проходит многоэтапный контроль качества. Сначала мастер проверяет заготовку, затем после ковки — форму и пропорции, после шлифовки — поверхность, и финальная проверка перед упаковкой.',
		defaultOpen: true,
	},
	{
		label: 'Условия оплаты',
		content: 'Принимаем оплату банковскими картами, наличными при получении, а также переводом на расчётный счёт.',
	},
	{
		label: 'Сертификаты',
		content: 'Все изделия сопровождаются сертификатами качества и подлинности материалов.',
	},
]

/** Один элемент */
const SINGLE_ITEM: BaseAccordionItem[] = [
	{ label: 'О нас', content: 'Мы — мастерская художественной ковки с 15-летним опытом', defaultOpen: true },
]

/** Элементы со слотами */
const SLOT_ITEMS: BaseAccordionItem[] = [
	{ label: 'Галерея работ', slot: 'gallery' },
	{ label: 'Контакты', content: 'Тел.: +7 (999) 123-45-67' },
]

/** Элементы с иконками */
const ICON_ITEMS: BaseAccordionItem[] = [
	{ label: 'Материалы', icon: 'search', content: 'Работаем с металлом, деревом и камнем', defaultOpen: true },
	{ label: 'Доставка', icon: 'arrow-right', content: 'Доставка по всей России от 3 до 14 дней' },
	{ label: 'Гарантия', icon: 'check', content: 'Гарантия 2 года на все изделия' },
	{ label: 'Возврат', icon: 'close', content: 'Возврат в течение 14 дней', isDisabled: true },
]

const meta: Meta<typeof BaseAccordion> = {
	title: 'UI/BaseAccordion',
	component: BaseAccordion,

	argTypes: buildArgTypes({
		props: {
			isMultiple: {
				control: 'boolean',
				description: 'Возможность открывать несколько элементов одновременно',
			},
			variant: {
				control: 'inline-radio',
				options: ACCORDION_VARIANTS,
				description: 'Вариант отображения аккордеона',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus',
			},
			items: {
				table: { disable: true },
			},
		},
	}),

	args: {
		items: ITEMS,
		isMultiple: false,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseAccordion>

// ── 1. Default ──

/** Базовое состояние с дефолтными пропсами */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAccordion :items="items" />',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const firstItem = canvasElement.querySelectorAll('.base-accordion__item')[0]
		await waitFor(() => {
			expect(firstItem.classList.contains('base-accordion__item--open')).toBe(true)
		})

		const deliveryHeader = canvas.getByText('Доставка')
		await userEvent.click(deliveryHeader)

		const secondItem = canvasElement.querySelectorAll('.base-accordion__item')[1]
		await waitFor(() => {
			expect(secondItem.classList.contains('base-accordion__item--open')).toBe(true)
		})
	},
}

// ── 2. Variants ──

/** Все варианты variant в ряд */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAccordion v-for="v in ['default', 'ghost', 'outline', 'shadow', 'soft']" :key="v" :variant="v" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAccordion, BaseText },
		setup() {
			return { args, variants: ACCORDION_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;max-width:480px;">
				<template v-for="v in variants" :key="v">
					<BaseText tag="h4" weight="semibold">{{ v }}</BaseText>
					<BaseAccordion v-bind="args" :variant="v" />
				</template>
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
				code: `<BaseAccordion :size-scale="75" />
<BaseAccordion :size-scale="100" />
<BaseAccordion :size-scale="150" />`,
			},
		},
	},
	render: args => ({
		components: { BaseAccordion, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale" style="width: 100%; max-width: 480px;">
					<BaseText tag="p" style="margin-bottom: 8px; color: var(--color-text-muted);">{{ scale }}%</BaseText>
					<BaseAccordion v-bind="args" :size-scale="scale" />
				</div>
			</div>
		`,
	}),
}

// ── 4. Disabled ──

/** С отключённым элементом */
export const Disabled: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAccordion :items="items" />
<!-- где items содержит { label: 'Возврат', content: '...', isDisabled: true } -->`,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const disabledHeader = canvas.getByText('Возврат')
		await userEvent.click(disabledHeader)

		const disabledItem = canvasElement.querySelector('.base-accordion__item--disabled')
		await waitFor(() => {
			expect(disabledItem?.classList.contains('base-accordion__item--open')).toBe(false)
		})
	},
}

// ── 5. Loading — не применимо ──
// ── 6. WithError — не применимо ──

// ── 7. WithSlotContent ──

/** Демонстрация именованных слотов */
export const WithSlotContent: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAccordion :items="items">
  <template #gallery>
    <BaseBadge label="Фото" variant="secondary" size="sm" />
  </template>
</BaseAccordion>`,
			},
		},
	},
	args: {
		items: SLOT_ITEMS,
	},
	render: args => ({
		components: { BaseAccordion, BaseBadge },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:480px;">
				<BaseAccordion v-bind="args">
					<template #gallery>
						<div style="display:flex;gap:8px;flex-wrap:wrap;">
							<BaseBadge v-for="i in 4" :key="i" label="Фото" variant="secondary" size="sm" />
						</div>
					</template>
				</BaseAccordion>
			</div>
		`,
	}),
}

// ── 8. HoverState ──

/** Принудительное hover-состояние */
export const HoverState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAccordion :items="items" class="base-accordion--hover" />',
			},
		},
	},
	render: () => ({
		components: { BaseAccordion },
		setup() {
			return { items: ITEMS }
		},
		template: `
			<div style="max-width:480px;">
				<BaseAccordion :items="items" class="base-accordion--hover" />
			</div>
		`,
	}),
}

// ── 9. ActiveState ──

/** Принудительное active-состояние */
export const ActiveState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAccordion :items="items" class="base-accordion--active" />',
			},
		},
	},
	render: () => ({
		components: { BaseAccordion },
		setup() {
			return { items: ITEMS }
		},
		template: `
			<div style="max-width:480px;">
				<BaseAccordion :items="items" class="base-accordion--active" />
			</div>
		`,
	}),
}

// ── 10. FocusState ──

/** Принудительное focus-состояние */
export const FocusState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAccordion :items="items" class="base-accordion--focus" />',
			},
		},
	},
	render: () => ({
		components: { BaseAccordion },
		setup() {
			return { items: ITEMS }
		},
		template: `
			<div style="max-width:480px;">
				<BaseAccordion :items="items" class="base-accordion--focus" />
			</div>
		`,
	}),
}

// ── 11. InteractiveStates ──

/** Все интерактивные состояния рядом для сравнения */
export const InteractiveStates: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAccordion :items="items" />
<BaseAccordion :items="items" class="base-accordion--hover" />
<BaseAccordion :items="items" class="base-accordion--active" />
<BaseAccordion :items="items" class="base-accordion--focus" />`,
			},
		},
	},
	render: () => ({
		components: { BaseAccordion, BaseText },
		setup() {
			return { items: ITEMS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;max-width:480px;">
				<div>
					<BaseText tag="span">Normal</BaseText>
					<BaseAccordion :items="items" />
				</div>
				<div>
					<BaseText tag="span">Hover</BaseText>
					<BaseAccordion :items="items" class="base-accordion--hover" />
				</div>
				<div>
					<BaseText tag="span">Active</BaseText>
					<BaseAccordion :items="items" class="base-accordion--active" />
				</div>
				<div>
					<BaseText tag="span">Focus</BaseText>
					<BaseAccordion :items="items" class="base-accordion--focus" />
				</div>
			</div>
		`,
	}),
}

// ── 12. DarkTheme ──

/** Тёмная тема */
export const DarkTheme: Story = {
	parameters: {
		docs: {
			source: {
				code: `<div data-theme="dark">
  <BaseAccordion variant="outline" />
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
		variant: 'outline',
	},
}

// ── 13. Interactive ──

/** Интерактивная story с полными контролами */
export const Interactive: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAccordion :items="items" :variant="variant" :size-scale="sizeScale" />',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const firstHeader = canvas.getByText('Материалы')
		await userEvent.click(firstHeader)

		const firstItem = canvasElement.querySelectorAll('.base-accordion__item')[0]
		await waitFor(() => {
			expect(firstItem.classList.contains('base-accordion__item--open')).toBe(false)
		})

		await userEvent.click(firstHeader)
		await waitFor(() => {
			expect(firstItem.classList.contains('base-accordion__item--open')).toBe(true)
		})
	},
}

// ── Дополнительные stories ──

/** Множественное открытие элементов */
export const Multiple: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAccordion :items="items" is-multiple />',
			},
		},
	},
	args: {
		isMultiple: true,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const deliveryHeader = canvas.getByText('Доставка')
		await userEvent.click(deliveryHeader)

		const items = canvasElement.querySelectorAll('.base-accordion__item')
		await waitFor(() => {
			expect(items[0].classList.contains('base-accordion__item--open')).toBe(true)
			expect(items[1].classList.contains('base-accordion__item--open')).toBe(true)
		})
	},
}

/** С длинным контентом */
export const LongContent: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAccordion :items="longItems" />
<!-- где items содержит элементы с длинным content -->`,
			},
		},
	},
	args: {
		items: LONG_ITEMS,
	},
}

/** Один элемент */
export const SingleItem: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAccordion :items="[{ label: 'О нас', content: '...', defaultOpen: true }]" />`,
			},
		},
	},
	args: {
		items: SINGLE_ITEM,
	},
}

/** Аккордеон с иконками */
export const WithIcons: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAccordion :items="iconItems" />
<!-- где items содержит элементы с icon: 'search', 'arrow-right', 'check', 'close' -->`,
			},
		},
	},
	args: {
		items: ICON_ITEMS,
	},
}
