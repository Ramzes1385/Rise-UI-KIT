import { flowNode } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :panels="['toolbar', 'list', 'details']" />
`

export const ListView: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель `list` — видимый список узлов и связей «Структура карты»: тот же список всегда есть для скринридеров, а с панелью его видят все.',
					'Кнопка списка выбирает элемент так же, как щелчок по карте, — удобно тем, кто не работает мышью и жестами, и на больших картах, где нужный узел не найти глазами.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'], omit: ['panels'] }),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const list = canvas.getByRole('region', { name: 'Структура карты' })
		await expect(list).toBeVisible()
		await expect(list.querySelectorAll('li')).toHaveLength(23)
		const button = Array.from(list.querySelectorAll('button')).find(item => item.textContent?.includes('Payments'))!
		await userEvent.click(button)
		await expect(flowNode(canvas, 'Payments')).toHaveAttribute('aria-current', 'true')
	},
}
