/**
 * BaseBackTop — stories.
 *
 * Разделы: Default (кнопка в углу прокручиваемого блока) → с подписью → клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, useArgsWithoutSlots } from '@/stories/helpers'
import BaseBackTop from '../ui/BaseBackTop.vue'
import { BACK_TOP_VARIANTS } from '../model/BaseBackTop.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Лента новостей для прокрутки */
const NEWS = Array.from({ length: 40 }, (_, index) => `Новость ${index + 1}: склад в Волгограде принял ${20 + index} поставок`)

const meta = {
	title: 'Navigation/BaseBackTop',
	component: BaseBackTop,
	parameters: {
		docs: {
			description: {
				component: [
					'Кнопка «Наверх» для длинных страниц и списков: появляется после прокрутки и возвращает к началу.',
					'',
					'- `target` — прокручиваемый контейнер (селектор или элемент), по умолчанию окно; `visibilityHeight` — после',
					'  какой прокрутки кнопка появляется.',
					'- Прокрутка плавная, если пользователь не включил «уменьшение движения» (`prefers-reduced-motion`).',
					'- После прокрутки фокус переходит в начало: в контейнер или в `<main>` страницы (`focusTarget` — своё место),',
					'  иначе он остался бы внизу, на исчезнувшей кнопке.',
					'- Оформление и положение — как у BaseFab: `variant`, `position`, `isExtended` (с подписью), `isContained`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: BACK_TOP_VARIANTS }),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
		visibilityHeight: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		isExtended: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		position: {
			control: 'inline-radio',
			options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
			table: propGroup(ARG_GROUP.appearance),
		},
		isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		target: { control: false, table: propGroup(ARG_GROUP.behavior) },
		focusTarget: { control: false, table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		variant: 'default',
		visibilityHeight: 200,
		isExtended: false,
		position: 'bottom-right',
		isContained: true,
		sizeScale: 100,
		onClick: fn(),
	},
	render: (args, { id }) => ({
		components: { BaseBackTop },
		setup: () => ({ props: useArgsWithoutSlots(args), news: NEWS, listId: `news-${id}` }),
		template: `
			<div style="position: relative; max-width: 480px">
				<div :id="listId" tabindex="0" role="region" aria-label="Лента новостей" style="height: 280px; overflow: auto; border: 1px solid var(--rise-border); border-radius: 8px">
					<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 12px">
						<li v-for="item in news" :key="item">{{ item }}</li>
					</ul>
				</div>
				<BaseBackTop v-bind="props" :target="'#' + listId" />
			</div>
		`,
	}),
} satisfies Meta<typeof BaseBackTop>

export default meta
type Story = StoryObj<typeof meta>

/** Прокрутить список примера и дождаться кнопки */
async function scrollList(canvasElement: HTMLElement): Promise<HTMLElement> {
	const list = canvasElement.querySelector('[id^="news-"]') as HTMLElement
	list.scrollTop = 600
	list.dispatchEvent(new Event('scroll'))
	return list
}

// ─── Default ───────────────────────────────────────────────────────────────────

/** Прокрутите ленту: кнопка появится в углу, клик вернёт ленту к началу и переведёт в неё фокус. */
export const Default: Story = {
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const list = await scrollList(canvasElement)
		await userEvent.click(await canvas.findByRole('button', { name: 'Наверх' }))
		await waitFor(() => expect(list.scrollTop).toBe(0))
		await expect(list).toHaveFocus()
		await expect(args.onClick).toHaveBeenCalledOnce()
		await waitFor(() => expect(canvas.queryByRole('button', { name: 'Наверх' })).not.toBeInTheDocument())
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** С подписью (`isExtended`) и мягким вариантом. */
export const Extended: Story = {
	args: { isExtended: true, variant: 'soft', label: 'К началу ленты' },
	play: async ({ canvas, canvasElement }) => {
		await scrollList(canvasElement)
		const button = await canvas.findByRole('button', { name: 'К началу ленты' })
		await waitFor(() => expect(button).toBeVisible())
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: Tab до кнопки, Enter — лента в начале, фокус в ленте. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent }) => {
		const list = await scrollList(canvasElement)
		const button = await canvas.findByRole('button', { name: 'Наверх' })
		button.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(list.scrollTop).toBe(0))
		await expect(list).toHaveFocus()
	},
}
