import { expect } from 'storybook/test'
import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
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

export const Groups: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Разделы и бейджи: пункт с `type` = `group` — подпись раздела («Работа», «Магазин») и его пункты, всегда раскрыт.',
					'Цвет бейджа — `badgeColor`: primary, success, warning, error; по умолчанию нейтральный. В свёрнутой панели',
					'подпись раздела становится линией, бейдж — точкой у иконки, а значение бейджа добавляется к имени пункта.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSideBar'],
				models,
				script: [`const items = ${literal(items)}`, `const frameStyle = ${literal(frameStyle)}`].join('\n'),
				omit: SLOT_KEYS,
			}),
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup: useStorySetup(args, { models, data: { items, frameStyle }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('list', { name: 'Работа' })).toBeVisible()
		await expect(canvas.getByRole('list', { name: 'Магазин' })).toBeVisible()
		await expect(canvas.getByRole('link', { name: /Товары/ })).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('link', { name: /Заказы/ })).toHaveTextContent('3')
	},
}
