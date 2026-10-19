import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { reviewArgs, reviewModels } from '../../reviewShared'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 375px; max-width: 100%">
		<BaseFlowMap v-bind="args" v-model:data="data" v-model:suggestions="suggestions" v-model:comments="comments" />
	</div>
`

export const ReviewCompact: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['compactBreakpoint', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'«Правки» на 375 px (мокап FlowMobile): область уже `compactBreakpoint`, поэтому панель правок уходит вниз, а в режиме остаются только свойства и комментарии — предложения и версии разбирают на широком экране.',
					'Булавки комментариев и кнопки панели — не меньше 40 px под палец.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'], models: reviewModels }),
		},
	},
	args: { ...reviewArgs, height: '640px' },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models: reviewModels }),
		template,
	}),
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toHaveClass('base-flow-map--compact'))
	},
}
