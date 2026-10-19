import { expect } from 'storybook/test'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { flowEventStorming } from '@components/BaseFlowMap'
import { storySource, useStorySetup } from '@/stories/helpers'
import { ORDER_STORMING } from '../../../fixtures/architecture/eventStorming'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowEventStorming]" />
`

export const EventStorming: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Event Storming (мокап Notation-EventStorming): «Оформление заказа» стикерами на временной шкале — ранг по ходу потока слева направо, полосы по видам стикеров, пунктирные рамки ограниченных контекстов (каждый охватывает соседние шаги потока) «Заказы», «Оплата», «Склад», «Отчётность».',
					'Стикеры: актор, команда, агрегат, событие домена, политика, модель чтения, внешняя система; пометки — горячая точка и возможность — связываются с любым стикером. Грамматика потока даёт предупреждения, не запреты.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowEventStorming'] }),
		},
	},
	args: { data: ORDER_STORMING, height: '640px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowEventStorming } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(flowNodes(canvas)).toHaveLength(16)
		await expect(flowNode(canvas, 'Заказ оформлен')).toBeVisible()
		await expect(flowNode(canvas, 'Что, если оплата отклонена?')).toBeVisible()
	},
}
