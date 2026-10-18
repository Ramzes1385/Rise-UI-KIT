import { flowNode } from '../../shared'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :panels="['toolbar', 'search', 'minimap', 'details']" />
`

export const Search: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель `search` — поле «Найти узел» (BaseSearch): ищет по подписи и id узла, показывает до восьми совпадений со значком и подзаголовком.',
					'Выбор результата (Enter или щелчок) приближает карту к узлу, переводит на него фокус клавиатуры, выделяет и открывает подробности.',
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
		const field = canvas.getByPlaceholderText('Найти узел')
		await userEvent.type(field, 'kaf')
		const option = await screen.findByRole('option', { name: /Kafka/ })
		await userEvent.click(option)
		await waitFor(() => expect(flowNode(canvas, 'Kafka')).toHaveAttribute('aria-current', 'true'))
		await expect(canvas.getByRole('region', { name: 'Подробности узла' })).toHaveTextContent('Kafka')
	},
}
