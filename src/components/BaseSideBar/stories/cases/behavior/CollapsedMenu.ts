import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { FRAME_STYLE, GROUP_ITEMS, SLOT_KEYS } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = GROUP_ITEMS

const frameStyle = FRAME_STYLE

const models = { isCollapsed: 'isCollapsed' }

const template = `
	<div :style="frameStyle">
		<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" :items="items" />
	</div>
`

export const CollapsedMenu: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вложенные пункты в свёрнутой панели: пункт с детьми («Каталог») открывает меню справа — сам раздел и его пункты.',
					'Меню — BaseDropdownMenu: стрелки, Enter, Escape и возврат фокуса на пункт панели. У «Входящих» и «Заказов» точка —',
					'бейдж, его значение — в имени пункта («Заказы, 3»).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSideBar'],
				models,
				script: [`const items = ${literal(items)}`, `const frameStyle = ${literal(frameStyle)}`].join('\n'),
				omit: [...SLOT_KEYS, 'linkComponent'],
			}),
		},
	},
	args: { isCollapsed: true },
	render: args => ({
		components: { BaseSideBar },
		setup: useStorySetup(args, { models, data: { items, frameStyle }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('link', { name: 'Заказы, 3' })).toBeVisible()
		const catalog = canvas.getByRole('button', { name: 'Каталог' })
		await userEvent.click(catalog)
		const menu = await screen.findByRole('menu', { name: 'Каталог' })
		await waitFor(() => expect(menu).toBeVisible())
		await expect(screen.getByRole('menuitem', { name: 'Товары' })).toHaveAttribute('href', '/catalog/products')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu', { name: 'Каталог' })).toBeNull())
		await expect(catalog).toHaveFocus()
	},
}
