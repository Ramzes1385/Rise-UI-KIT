/**
 * Stories для компонента BaseAccordion.
 * Демонстрирует все вариации, режимы и интерактивные состояния.
 */

import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import { BaseText } from '@components/BaseText'
import { buildArgTypes, playShiftTab } from '@utils/storybookUtils'
import { ACCORDION_VARIANTS } from '../model/BaseAccordion.types'
import BaseAccordion from '../ui/BaseAccordion.vue'
import type { BaseAccordionItem } from '../model/BaseAccordion.types'
import type { Meta, StoryObj } from '@storybook/vue3'

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
			customClass: { control: 'object' },
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
/** Базовое состояние с дефолтными пропсами */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAccordion :items="items" />',
			},
		},
	},
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка первого заголовка по Tab', async () => {
			await userEvent.tab()
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-accordion__header' })
		})
	},
}
/** все варианты variant в ряд */
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
					<BaseText tag="h4" :weight="600">{{ v }}</BaseText>
					<BaseAccordion v-bind="args" :variant="v" />
				</template>
			</div>
		`,
	}),
}
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
}
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
/** все интерактивные состояния рядом для сравнения */
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
/** Интерактивная story с полными контролами */
export const Interactive: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseAccordion :items="items" :variant="variant" :size-scale="sizeScale" />',
			},
		},
	},
}
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
/** Закрытие элемента по клику — покрывает pos > -1 ветку в toggleItem */
export const ToggleClose: Story = {
	args: {
		onToggle: fn(),
	},
	play: async ({ args, canvasElement }) => {
		// Первый элемент открыт по умолчанию (defaultOpen: true)
		// Кликаем по нему чтобы закрыть
		const header = canvasElement.querySelector('.base-accordion__header') as HTMLElement
		await userEvent.click(header)
		await waitFor(() => expect(args.onToggle).toHaveBeenCalledWith(0, false))
	},
}
/** Множественное закрытие элемента — покрывает isMultiple + закрытие */
export const MultipleClose: Story = {
	args: {
		isMultiple: true,
		onToggle: fn(),
	},
	play: async ({ args, canvasElement }) => {
		// Первый элемент открыт по умолчанию
		// Кликаем по второму элементу чтобы открыть
		const headers = canvasElement.querySelectorAll('.base-accordion__header')
		await userEvent.click(headers[1] as HTMLElement)
		await waitFor(() => expect(args.onToggle).toHaveBeenCalledWith(1, true))
		// Кликаем по первому элементу чтобы закрыть
		await userEvent.click(headers[0] as HTMLElement)
		await waitFor(() => expect(args.onToggle).toHaveBeenCalledWith(0, false))
	},
}
/** Клавиатурная навигация — покрывает @keydown.enter */
export const KeyboardToggle: Story = {
	args: {
		onToggle: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const header = canvasElement.querySelector('.base-accordion__header') as HTMLElement
		header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
		await waitFor(() => expect(args.onToggle).toHaveBeenCalledWith(0, false))
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		color: { bg: { base: '#fef3c7' }, text: { base: '#92400e' } },
	},
}
/** Без элементов с defaultOpen — onMounted не добавляет индексы */
export const NoDefaultOpen: Story = {
	args: {
		items: [
			{ label: 'Закрытый 1', content: 'Контент 1' },
			{ label: 'Закрытый 2', content: 'Контент 2' },
		],
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
		const openItems = canvasElement.querySelectorAll('.base-accordion__item--open')
		expect(openItems.length).toBe(0)
	},
}
/** Клик по отключённому элементу — покрывает toggleItem early return при isDisabled */
export const ToggleDisabled: Story = {
	args: {
		onToggle: fn(),
	},
	play: async ({ args, canvasElement }) => {
		// Четвёртый элемент (индекс 3) — isDisabled: true
		const headers = canvasElement.querySelectorAll('.base-accordion__header')
		const disabledHeader = headers[3] as HTMLElement
		disabledHeader.click()
		// onToggle не должен быть вызван
		expect(args.onToggle).not.toHaveBeenCalled()
	},
}
/** Открытие другого элемента в не-multiple режиме — покрывает openIndexes.value = [index] */
export const SwitchOpenItem: Story = {
	args: {
		onToggle: fn(),
	},
	play: async ({ args, canvasElement }) => {
		// Первый элемент открыт по умолчанию (defaultOpen: true)
		// Кликаем по второму элементу чтобы открыть его (первый должен закрыться)
		const headers = canvasElement.querySelectorAll('.base-accordion__header')
		await userEvent.click(headers[1] as HTMLElement)
		await waitFor(() => expect(args.onToggle).toHaveBeenCalledWith(1, true))
		// Проверяем что только второй элемент открыт
		const openItems = canvasElement.querySelectorAll('.base-accordion__item--open')
		expect(openItems.length).toBe(1)
	},
}
/** Аккордеон без элементов */
export const Empty: Story = {
	tags: ['!a11y'],
	args: {
		items: [],
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
/** Кастомные CSS-классы через customClass */
export const WithCustomClass: Story = {
	args: {
		customClass: {
			root: 'acc-root',
			item: 'acc-item',
			header: 'acc-header',
			icon: 'acc-icon',
			label: 'acc-label',
			arrow: 'acc-arrow',
			arrowIcon: 'acc-arrowIcon',
			collapse: 'acc-collapse',
			content: 'acc-content',
			contentText: 'acc-contentText',
		},
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.acc-root')).toBeTruthy()
	},
}
