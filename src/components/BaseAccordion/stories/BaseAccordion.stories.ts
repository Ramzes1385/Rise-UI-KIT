import { expect, fn } from 'storybook/test'
import BaseAccordion from '../ui/BaseAccordion.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ACCORDION_VARIANTS } from '../types/BaseAccordion.types'
import type { BaseAccordionItem } from '../types/BaseAccordion.types'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'

const ITEMS: BaseAccordionItem[] = [
	{
		label: 'Как оформить заказ?',
		content: 'Добавьте товары в корзину, укажите адрес доставки и выберите способ оплаты. Подтверждение придёт на почту.',
		defaultOpen: true,
	},
	{ label: 'Сколько стоит доставка?', content: 'Курьером по городу — 290 ₽, при заказе от 3000 ₽ — бесплатно.' },
	{ label: 'Можно ли вернуть товар?', content: 'Да, в течение 14 дней с момента получения, если сохранены упаковка и чек.' },
	{ label: 'Как связаться с поддержкой?', content: 'Напишите в чат на сайте или позвоните по номеру 8 800 555-35-35.' },
]

const EXTRA_ITEM: BaseAccordionItem = { label: 'Есть ли подарочная упаковка?', content: 'Да, её можно выбрать при оформлении заказа.' }

/**
 * Три пункта для i-го экземпляра витрины: вопросы сдвинуты по кругу, первый открыт. Открытые панели — ориентиры `region`
 * с именем заголовка, поэтому у каждого экземпляра открыт свой вопрос: имена ориентиров на странице не повторяются.
 */
function showcaseItems(index: number): BaseAccordionItem[] {
	const pool = [...ITEMS, EXTRA_ITEM].map(item => ({ ...item, defaultOpen: false }))
	return [0, 1, 2].map(offset => ({ ...pool[(index + offset) % pool.length], defaultOpen: offset === 0 }))
}

const DISABLED_ITEMS: BaseAccordionItem[] = [
	ITEMS[0],
	ITEMS[1],
	{ label: 'Оплата при получении', content: 'Способ временно недоступен.', isDisabled: true },
	ITEMS[3],
]

const ICON_ITEMS: BaseAccordionItem[] = [
	{ label: 'Документы', icon: 'file', content: 'Договор, счёт и акт доступны в личном кабинете.', defaultOpen: true },
	{ label: 'Календарь поставок', icon: 'calendar', content: 'Отгрузки по вторникам и пятницам.' },
	{ label: 'Адрес склада', icon: 'pin', content: 'Москва, Складская улица, 12, ворота 3.' },
]

const LONG_ITEMS: BaseAccordionItem[] = [
	{
		label: 'Какие документы нужны для оформления юридическим лицом с отсрочкой платежа и доставкой в регионы?',
		content: [
			'Понадобятся карточка организации с реквизитами, доверенность на получение товара и подписанный договор поставки.',
			'Для отсрочки платежа дополнительно запросим бухгалтерскую отчётность за последний год и справку об отсутствии',
			'задолженности. Доставка в регионы оформляется через транспортную компанию, накладную пришлём после отгрузки.',
		].join(' '),
		defaultOpen: true,
	},
	ITEMS[1],
]

const SLOT_ITEMS: BaseAccordionItem[] = [
	{ label: 'Контакты', slot: 'contacts' },
	{ label: 'Реквизиты', content: 'ООО «Райз», ИНН 7700000000, КПП 770001001.' },
]

const meta = {
	title: 'Data/BaseAccordion',
	component: BaseAccordion,
	parameters: {
		docs: {
			description: {
				component: [
					'Аккордеон показывает список разделов, содержимое которых раскрывается по клику на заголовок: FAQ, настройки, фильтры.',
					'',
					'- Пункты задаёт `items`: заголовок `label`, текст `content` или именованный слот `slot`, `icon`, `defaultOpen`, `isDisabled`.',
					'- По умолчанию открыт один пункт; `isMultiple` позволяет раскрыть несколько. Событие `toggle(index, isOpen)`.',
					'- Доступность по APG Accordion: заголовок — кнопка с `aria-expanded` и `aria-controls`, панель — `region`,',
					'  Enter и Space раскрывают пункт. Закрытая панель помечена `inert`: её ссылки и поля не попадают в порядок Tab.',
					'- Варианты: `default` — линии между пунктами; `ghost` — без линий; `outline`, `shadow`, `soft` — в контейнере.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: ACCORDION_VARIANTS }),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
	},
	args: {
		items: ITEMS,
		isMultiple: false,
		variant: 'default',
		sizeScale: 100,
		onToggle: fn(),
	},
	render: args => ({
		components: { BaseAccordion },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div class="story-medium"><BaseAccordion v-bind="props" /></div>',
	}),
} satisfies Meta<typeof BaseAccordion>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: первый пункт открыт (`defaultOpen`), клик по заголовку раскрывает пункт и закрывает предыдущий.
 * Story открывают e2e-тесты, поэтому play только проверяет начальное состояние.
 */
export const Default: Story = {
	play: async ({ canvas }) => {
		const first = canvas.getByRole('button', { name: 'Как оформить заказ?' })
		await expect(first).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('region', { name: 'Как оформить заказ?' })).toHaveTextContent('Добавьте товары в корзину')
		await expect(canvas.getByRole('button', { name: 'Сколько стоит доставка?' })).toHaveAttribute('aria-expanded', 'false')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Пять вариантов: `default` и `ghost` — для страниц и боковых панелей, `outline`, `shadow`, `soft` — отдельным блоком. */
export const Variants: Story = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: { source: { code: ACCORDION_VARIANTS.map(variant => `<BaseAccordion :items="items" variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseAccordion },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ACCORDION_VARIANTS, showcaseItems }),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<div v-for="(variant, index) in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseAccordion v-bind="props" :items="showcaseItems(index)" :variant="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: текст 12–17px, отступы и иконки масштабируются пропорционально. */
export const Sizes: Story = {
	args: { variant: 'outline' },
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseAccordion :items="items" variant="outline" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel, showcaseItems }),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<div v-for="(preset, index) in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseAccordion v-bind="props" :items="showcaseItems(index)" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/** Кастомный цвет через `color`: `bg.base` и `bg.hover` — фон заголовков и его наведение, `text.base` — цвет заголовков. */
export const CustomColor: Story = {
	args: {
		variant: 'outline',
		color: {
			bg: { base: '#eff6ff', hover: '#dbeafe' },
			text: { base: '#1e3a8a' },
		},
	},
	play: async ({ canvas }) => {
		const header = canvas.getByRole('button', { name: 'Как оформить заказ?' })
		await expect(getComputedStyle(header).backgroundColor).toBe('rgb(239, 246, 255)')
		await expect(getComputedStyle(header).color).toBe('rgb(30, 58, 138)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый пункт приглушён, помечен `aria-disabled` и не раскрывается ни кликом, ни с клавиатуры. */
export const Disabled: Story = {
	args: { items: DISABLED_ITEMS },
	play: async ({ canvas }) => {
		const header = canvas.getByRole('button', { name: 'Оплата при получении' })
		await expect(header).toHaveAttribute('aria-disabled', 'true')
		await expect(header).toHaveAttribute('aria-expanded', 'false')
	},
}

/** Без пунктов аккордеон ничего не выводит. */
export const Empty: Story = {
	args: { items: [] },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
	},
}

/** Длинные заголовки и текст переносятся по словам; шеврон остаётся справа по центру заголовка. */
export const LongContent: Story = {
	args: { items: LONG_ITEMS },
	play: async ({ canvas }) => {
		const header = canvas.getByRole('button', { name: /Какие документы нужны/ })
		await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Иконка перед заголовком — поле `icon` (имя из спрайта). */
export const WithIcons: Story = {
	args: { items: ICON_ITEMS },
}

/**
 * Своё содержимое панели — именованный слот, имя которого задаёт поле `slot` пункта. Пока панель закрыта,
 * ссылки внутри неё недоступны для Tab (`inert`).
 */
export const WithSlot: Story = {
	args: { items: SLOT_ITEMS },
	parameters: {
		docs: {
			source: {
				code: [
					"<BaseAccordion :items=\"[{ label: 'Контакты', slot: 'contacts' }, …]\">",
					'  <template #contacts>',
					'    <a href="mailto:support@example.com">support@example.com</a>',
					'  </template>',
					'</BaseAccordion>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-medium">
				<BaseAccordion v-bind="props">
					<template #contacts>
						Почта поддержки: <a href="mailto:support@example.com">support@example.com</a>
					</template>
				</BaseAccordion>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		// Панель закрыта: она скрыта от скринридера и inert — ссылку нельзя сфокусировать
		const link = canvas.getByRole('link', { name: 'support@example.com', hidden: true })
		link.focus()
		await expect(link).not.toHaveFocus()

		const contacts = canvas.getByRole('button', { name: 'Контакты' })
		await userEvent.click(contacts)
		await expect(contacts).toHaveAttribute('aria-expanded', 'true')
		await userEvent.tab()
		await expect(link).toHaveFocus()
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** `isMultiple`: можно раскрыть несколько пунктов одновременно; открытые пункты закрываются только своим заголовком. */
export const Multiple: Story = {
	args: { isMultiple: true },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('button', { expanded: true })).toHaveLength(1)
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab переводит фокус между заголовками (видно кольцо фокуса), Enter и Space раскрывают и закрывают пункт. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const first = canvas.getByRole('button', { name: 'Как оформить заказ?' })
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		await expect(first).toHaveAttribute('aria-expanded', 'false')
		await expect(args.onToggle).toHaveBeenLastCalledWith(0, false)

		await userEvent.tab()
		const second = canvas.getByRole('button', { name: 'Сколько стоит доставка?' })
		await expect(second).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(second).toHaveAttribute('aria-expanded', 'true')
		await expect(args.onToggle).toHaveBeenLastCalledWith(1, true)
	},
}
