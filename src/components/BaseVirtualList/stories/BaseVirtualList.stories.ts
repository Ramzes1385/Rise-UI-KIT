import type { ConcreteComponent } from 'vue'
import { expect, waitFor } from 'storybook/test'
import BaseVirtualList from '../ui/BaseVirtualList.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { BaseVirtualListProps } from '../types/BaseVirtualList.types'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, tabTo, useArgsWithoutSlots } from '@/stories/helpers'

/** 10 000 заказов: номер, город и сумма */
const CITIES = ['Москва', 'Казань', 'Волгоград', 'Самара', 'Пермь']
const ORDERS = Array.from({ length: 10000 }, (_, index) => ({
	id: 1000 + index,
	title: `Заказ № ${1000 + index}`,
	city: CITIES[index % CITIES.length],
	total: `${((index * 7919) % 90000) + 1000} ₽`,
}))

/** Сообщения разной длины: высота строки известна только после отрисовки */
const PHRASES = [
	'Принято.',
	'Посылку передали в доставку, трек-номер пришлём отдельным сообщением.',
	'Курьер задерживается из-за пробок на мосту: ожидаемое время прибытия сдвигается примерно на сорок минут. Если так неудобно, можно перенести доставку на завтра.',
]
const MESSAGES = Array.from({ length: 2000 }, (_, index) => ({ id: index, text: `${index + 1}. ${PHRASES[index % PHRASES.length]}` }))

const ROW_STYLE =
	'display: flex; justify-content: space-between; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--rise-border)'

const meta = {
	title: 'Data/BaseVirtualList',
	// Обобщённый компонент (generic T): Meta описывает его пропсы для строк-объектов
	component: BaseVirtualList as unknown as ConcreteComponent<BaseVirtualListProps<Record<string, unknown>>>,
	parameters: {
		docs: {
			description: {
				component: [
					'Список на тысячи строк: в DOM только видимые строки и небольшой запас, остальные — высотой внутреннего блока.',
					'',
					'- `items` и слот по умолчанию (`item`, `index`); `itemKey` — поле или функция ключа (по умолчанию `id`).',
					'- `itemSize` — высота строки до замера: строки замеряются после отрисовки, разная высота допустима.',
					'- `height` — высота области; `overscan` — сколько строк держать сверх видимых.',
					'- Доступность: `role="list"` с именем (`ariaLabel`), строки — `listitem` с `aria-setsize` и `aria-posinset`,',
					'  чтобы скринридер знал длину всего списка. Область с прокруткой — в порядке Tab; строка с фокусом',
					'  не уходит из DOM при прокрутке.',
					'- `scrollToIndex(index, align)` через ref. Под капотом — composable `useVirtualList`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant', 'color'),
		items: { control: false, table: propGroup(ARG_GROUP.content) },
		itemSize: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
		overscan: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	},
	args: {
		items: ORDERS,
		itemSize: 41,
		overscan: 5,
		height: 320,
		ariaLabel: 'Заказы',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseVirtualList },
		setup: () => ({ props: useArgsWithoutSlots(args), rowStyle: ROW_STYLE }),
		template: `
			<BaseVirtualList v-bind="props" style="max-width: 480px; border: 1px solid var(--rise-border); border-radius: 8px">
				<template #default="{ item }">
					<div :style="rowStyle">
						<span>{{ item.title }}</span>
						<span style="color: var(--rise-text-muted)">{{ item.city }}</span>
						<strong>{{ item.total }}</strong>
					</div>
				</template>
			</BaseVirtualList>
		`,
	}),
} satisfies Meta<BaseVirtualListProps<Record<string, unknown>>>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** 10 000 заказов: в DOM около двадцати строк. Прокрутите в конец — отрисуются последние. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const list = canvas.getByRole('list', { name: 'Заказы' })
		const rows = canvas.getAllByRole('listitem')
		await expect(rows.length).toBeLessThan(30)
		await expect(rows[0]).toHaveAttribute('aria-setsize', '10000')
		list.scrollTop = list.scrollHeight
		await waitFor(() => expect(canvas.getByText('Заказ № 10999')).toBeVisible())
	},
}

// ─── Строки разной высоты ──────────────────────────────────────────────────────

/** Строки разной высоты: каждая замеряется после отрисовки, полоса прокрутки уточняется по мере прокрутки. */
export const VariableHeight: Story = {
	args: { items: MESSAGES, itemSize: 60, ariaLabel: 'Сообщения' },
	render: args => ({
		components: { BaseVirtualList },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseVirtualList v-bind="props" style="max-width: 420px; border: 1px solid var(--rise-border); border-radius: 8px">
				<template #default="{ item }">
					<p style="margin: 0; padding: 10px 16px; border-bottom: 1px solid var(--rise-border)">{{ item.text }}</p>
				</template>
			</BaseVirtualList>
		`,
	}),
	play: async ({ canvas }) => {
		const rows = canvas.getAllByRole('listitem')
		await waitFor(() => expect(rows[2].getBoundingClientRect().top).toBeGreaterThanOrEqual(rows[1].getBoundingClientRect().bottom - 1))
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: Tab ставит фокус на список (стрелки прокручивают его), следующий Tab — на кнопку в строке. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { items: ORDERS.slice(0, 500) },
	render: args => ({
		components: { BaseVirtualList },
		setup: () => ({ props: useArgsWithoutSlots(args), rowStyle: ROW_STYLE }),
		template: `
			<BaseVirtualList v-bind="props" style="max-width: 480px; border: 1px solid var(--rise-border); border-radius: 8px">
				<template #default="{ item }">
					<div :style="rowStyle">
						<span>{{ item.title }}</span>
						<button type="button">Открыть</button>
					</div>
				</template>
			</BaseVirtualList>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const list = canvas.getByRole('list', { name: 'Заказы' })
		await tabTo(list, userEvent)
		await userEvent.tab()
		const button = canvas.getAllByRole('button', { name: 'Открыть' })[0]
		await expect(button).toHaveFocus()
		// Строка с фокусом остаётся в DOM, даже когда список прокручен далеко от неё
		list.scrollTop = 8000
		await waitFor(() => expect(canvas.getByText('Заказ № 1200')).toBeInTheDocument())
		await expect(button).toHaveFocus()
	},
}
