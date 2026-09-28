import { expect, waitFor } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import BaseScrollArea from '../ui/BaseScrollArea.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const EVENTS = Array.from(
	{ length: 30 },
	(_, index) =>
		`${String(9 + Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')} — отгрузка № ${1200 + index}`,
)

const CARDS = ['Москва', 'Казань', 'Волгоград', 'Самара', 'Пермь', 'Уфа', 'Омск', 'Томск', 'Сочи', 'Тверь']

const meta = {
	title: 'Layout/BaseScrollArea',
	component: BaseScrollArea,
	parameters: {
		docs: {
			description: {
				component: [
					'Область прокрутки с тонкой полосой поверх содержимого — одинаковой в Windows, macOS и Linux.',
					'',
					'- Прокручивает родной элемент: колесо, касание, клавиатура и «Найти на странице» работают как обычно.',
					'  Полосы — только для мыши (`aria-hidden`): клик по полосе, перетаскивание ползунка.',
					'- `orientation`: `vertical`, `horizontal` или `both`; `maxHeight` — наибольшая высота; `scrollbar`: `hover` или `always`.',
					'- Область с прокруткой получает tabindex="0": её можно прокрутить стрелками (WCAG 2.1.1).',
					'  С `ariaLabel` она ещё и ориентир (`role="region"`).',
					'- Методы через ref: `scrollTo`, `scrollToTop`, `scrollToBottom`, `update`, `getViewport`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant', 'color'),
		orientation: { control: 'inline-radio', options: ['vertical', 'horizontal', 'both'], table: propGroup(ARG_GROUP.appearance) },
		maxHeight: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
		scrollbar: { control: 'inline-radio', options: ['hover', 'always'], table: propGroup(ARG_GROUP.appearance) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	},
	args: {
		orientation: 'vertical',
		maxHeight: 220,
		scrollbar: 'hover',
		ariaLabel: 'Журнал склада',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseScrollArea },
		setup: () => ({ props: useArgsWithoutSlots(args), events: EVENTS }),
		template: `
			<BaseScrollArea v-bind="props" style="max-width: 360px; border: 1px solid var(--rise-border); border-radius: 8px">
				<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 8px">
					<li v-for="event in events" :key="event">{{ event }}</li>
				</ul>
			</BaseScrollArea>
		`,
	}),
} satisfies Meta<typeof BaseScrollArea>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: наведите указатель — появится полоса; её можно тянуть и щёлкать. */
export const Default: Story = {
	play: async ({ canvas, canvasElement }) => {
		const region = canvas.getByRole('region', { name: 'Журнал склада' })
		await waitFor(() => expect(region).toHaveAttribute('tabindex', '0'))
		await expect(canvasElement.querySelector('.base-scroll-area__bar--y')).toBeInTheDocument()
		await expect(getComputedStyle(region).scrollbarWidth).toBe('none')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Горизонтальная прокрутка: карточки в ряд. */
export const Horizontal: Story = {
	args: { orientation: 'horizontal', ariaLabel: 'Города', scrollbar: 'always' },
	render: args => ({
		components: { BaseScrollArea },
		setup: () => ({ props: useArgsWithoutSlots(args), cards: CARDS }),
		template: `
			<BaseScrollArea v-bind="props" style="max-width: 420px">
				<ul style="display: flex; gap: 12px; margin: 0; padding: 4px 4px 16px; list-style: none; width: max-content">
					<li v-for="card in cards" :key="card" style="width: 120px; padding: 16px; border: 1px solid var(--rise-border); border-radius: 8px">{{ card }}</li>
				</ul>
			</BaseScrollArea>
		`,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => expect(canvasElement.querySelector('.base-scroll-area__bar--x')).toBeInTheDocument())
		await expect(canvasElement.querySelector('.base-scroll-area__bar--y')).not.toBeInTheDocument()
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус на область, дальше её прокручивают стрелки, PageDown и End (это делает браузер —
 * синтетические нажатия play его не вызывают, поэтому прокрутка ниже задана из кода), и полоса следует за прокруткой.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent }) => {
		const region = canvas.getByRole('region', { name: 'Журнал склада' })
		await waitFor(() => expect(region).toHaveAttribute('tabindex', '0'))
		await tabTo(region, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await expect(region).toHaveFocus()
		region.scrollTop = region.scrollHeight
		const thumb = canvasElement.querySelector('.base-scroll-area__thumb') as HTMLElement
		await waitFor(() => expect(parseFloat(thumb.style.top)).toBeGreaterThan(0))
		await expect(canvasElement.querySelector('.base-scroll-area')).toHaveClass('base-scroll-area--active')
	},
}
