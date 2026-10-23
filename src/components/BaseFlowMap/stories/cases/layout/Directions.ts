import { flowNode } from '../../shared'
import { expect, within } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { FLOW_DIRECTIONS } from '../../../types/data/flowData.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const directions = [...FLOW_DIRECTIONS]

const template = `
	<div class="story-grid" style="--story-grid-min: min(480px, 100%)">
		<div v-for="direction in directions" :key="direction">
			<span class="story-label">{{ direction }}</span>
			<BaseFlowMap v-bind="args" :layout="{ direction }" :aria-label="'Направление ' + direction" height="440px" :panels="['toolbar']" />
		</div>
	</div>
`

export const Directions: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Направление слоистой раскладки `layout.direction`: `LR` — слева направо, `TB` — сверху вниз (по умолчанию), `RL` и `BT` — обратные.',
					'Ярусы «Клиенты · Периметр · Сервисы · Данные» следуют за направлением, а связи и порты разворачиваются симметрично.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseFlowMap'],
				script: `const directions = ${literal(directions)}`,
				omit: ['layout', 'height', 'panels'],
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { directions } }),
		template,
	}),
	play: async ({ canvas }) => {
		const center = (direction: string, label: string) => {
			const rect = flowNode(within(canvas.getByRole('region', { name: `Направление ${direction}` })), label).getBoundingClientRect()
			return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
		}
		const tb = [center('TB', 'Web'), center('TB', 'Orders')]
		await expect(tb[1].y).toBeGreaterThan(tb[0].y)
		const lr = [center('LR', 'Web'), center('LR', 'Orders')]
		await expect(lr[1].x).toBeGreaterThan(lr[0].x)
		const rl = [center('RL', 'Web'), center('RL', 'Orders')]
		await expect(rl[1].x).toBeLessThan(rl[0].x)
		const bt = [center('BT', 'Web'), center('BT', 'Orders')]
		await expect(bt[1].y).toBeLessThan(bt[0].y)
	},
}
