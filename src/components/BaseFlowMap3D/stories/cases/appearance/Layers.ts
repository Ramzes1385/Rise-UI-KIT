import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowLive, waitForCanvas } from '../../shared'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { isLayered: 'isLayered' } as const

const template = `
	<div class="story-stack">
		<BaseFlowMap3D v-bind="args" v-model:is-layered="isLayered" />
		<p class="story-label">Слои: {{ isLayered ? 'включены' : 'выключены' }}</p>
	</div>
`

export const Layers: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'«Слои» разносят группы верхнего уровня ярусами по высоте: «Клиенты», «Периметр», «Сервисы» и «Данные» встают платформами друг над другом, связи между ярусами идут по стенкам. Включить можно переключателем «Слои» в нижней панели, `v-model:isLayered` или `data.view3d.isLayered`.',
					'Ярус группы — `group.model3d.level` (0 — земля), без него — порядок групп верхнего уровня; расстояние между ярусами — `view3d.levelGap`. Переход анимирован, при «уменьшить движение» — мгновенный; положение узлов в плоскости не меняется.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
				models: MODELS,
				types: { isLayered: 'boolean' },
			}),
		},
	},
	args: { isLayered: false },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		const toggle = canvas.getByRole('button', { name: 'Слои' })
		await expect(toggle).toHaveAttribute('aria-pressed', 'false')
		await userEvent.click(toggle)
		await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'true'))
		await expect(canvas.getByText('Слои: включены')).toBeVisible()
		await waitFor(() => expect(flowLive(canvasElement)).toHaveTextContent('Слои включены'))
		await userEvent.click(toggle)
		await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'false'))
		await expect(canvas.getByText('Слои: выключены')).toBeVisible()
	},
}
