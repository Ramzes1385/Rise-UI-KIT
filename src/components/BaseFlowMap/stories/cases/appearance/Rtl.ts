import { flowNode } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div dir="rtl">
		<BaseFlowMap v-bind="args" :panels="['toolbar', 'search', 'legend']" />
	</div>
`

export const Rtl: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Направление справа налево (`dir="rtl"` на предке, макет FlowMobile): панели, шапка, поиск и панель инструментов зеркалятся, а холст — LTR-островок:',
					'потоки, оси и сценарий читаются слева направо, как у BaseChart и BaseGantt, подписи узлов остаются на своих местах. Стрелки на холсте идут по геометрии, поэтому ← и → не меняются местами.',
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
	play: async ({ canvas }) => {
		const region = canvas.getByRole('region', { name: 'Оформление заказа' })
		await expect(getComputedStyle(region).direction).toBe('rtl')
		const viewport = canvas.getByRole('graphics-document')
		await expect(getComputedStyle(viewport).direction).toBe('ltr')
		const web = flowNode(canvas, 'Web').getBoundingClientRect()
		const mobile = flowNode(canvas, 'Mobile').getBoundingClientRect()
		await expect(web.left).toBeLessThan(mobile.left)
		const toolbar = canvas.getByRole('toolbar', { name: 'Инструменты карты' }).getBoundingClientRect()
		const frame = region.getBoundingClientRect()
		await expect(frame.right - toolbar.right).toBeLessThan(toolbar.left - frame.left)
	},
}
