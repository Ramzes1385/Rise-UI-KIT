import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { FLOW_EDGE_ROUTINGS } from '../../../types/data/flowData.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { FlowEdgeRouting, FlowMapData } from '../../../types/data/flowData.types'

const routings = [...FLOW_EDGE_ROUTINGS]

const models = { data: 'data' }

const routed = (source: FlowMapData, routing: FlowEdgeRouting): FlowMapData => ({
	...source,
	edges: source.edges.map(edge => ({ ...edge, routing })),
})

const template = `
	<div class="story-grid" style="--story-grid-min: 480px">
		<div v-for="routing in routings" :key="routing">
			<span class="story-label">{{ routing }}</span>
			<BaseFlowMap v-bind="args" :data="routed(data, routing)" :aria-label="'Линии ' + routing" height="360px" :panels="['toolbar']" />
		</div>
	</div>
`

export const Routing: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Вид линии связи — поле `routing` связи: `curved` — плавные кривые, `orthogonal` — ломаные под прямым углом со скруглением, `straight` — прямые.',
					'Без поля вид берётся у вида связи нотации (у «Карты сервисов» — кривая), затем из `layout.routing` данных. Концы линий всегда на контуре фигур, подписи не накладываются друг на друга.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseFlowMap', 'type FlowEdgeRouting', 'type FlowMapData'],
				models,
				script: `const routings = ${literal(routings)}\n\nconst routed = (source: FlowMapData, routing: FlowEdgeRouting): FlowMapData => ({\n\t...source,\n\tedges: source.edges.map(edge => ({ ...edge, routing })),\n})`,
				omit: ['height', 'panels'],
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models, data: { routings, routed } }),
		template,
	}),
	play: async ({ canvas }) => {
		const path = (routing: string) =>
			canvas
				.getByRole('region', { name: `Линии ${routing}` })
				.querySelector('[data-flow-id="e9"] .base-flow-map__edge-line')
				?.getAttribute('d') ?? ''
		const [curved, orthogonal, straight] = [path('curved'), path('orthogonal'), path('straight')]
		await expect(curved).not.toBe('')
		await expect(curved.match(/L/g)!.length).toBeGreaterThan(10)
		await expect(orthogonal).toMatch(/Q/)
		await expect(straight.match(/L/g)).toHaveLength(1)
	},
}
