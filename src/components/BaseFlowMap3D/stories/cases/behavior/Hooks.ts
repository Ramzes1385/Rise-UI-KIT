import { setup } from './Hooks.setup'
import setupSource from './Hooks.setup.ts?raw'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowScene, waitForCanvas } from '../../shared'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { scriptSource, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseFlowMap3D
			v-bind="args"
			:on-scene-ready="onSceneReady"
			:on-before-render="onBeforeRender"
			:on-model-ready="onModelReady"
			@node-click="onNodeClick" />
		<ul class="story-label" aria-label="Журнал событий">
			<li v-for="(entry, index) in log" :key="index">{{ entry }}</li>
		</ul>
	</div>
`

export const Hooks: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Хуки сцены для приложения: `onSceneReady(context)` — сцена собрана (и собрана заново после смены данных), в ответ можно вернуть функцию очистки; `onBeforeRender(context, { delta, time })` — перед каждым кадром (кадры по требованию, в покое их нет); `onModelReady(model)` — модель узла создана (GLB — после загрузки).',
					'Здесь `onSceneReady` кладёт оранжевый маркер на модель Orders и крутит его через `context.animate` (при «уменьшить движение» — один кадр), а возвращаемая функция убирает маркер и освобождает его ресурсы. События карты — те же, что у BaseFlowMap: `@node-click`, `@change`, `@reject`; `beforeConnect`, `beforeDelete` и другие хуки-пропсы действуют в режиме «Правка» (история `Edit3D`).',
					'Журнал событий — обычный список приложения: порядок записей виден сверху вниз, новые — сверху.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				vue: ['ref'],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D', 'type Model3DHandle', 'type Scene3DContext'],
					'@ramzes1385/rise-ui-kit': ['type FlowElementEvent'],
					three: ['Mesh', 'MeshBasicMaterial', 'SphereGeometry'],
				},
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		const log = canvas.getByRole('list', { name: 'Журнал событий' })
		await waitFor(() => expect(log).toHaveTextContent('Сцена собрана, маркер добавлен'))
		await waitFor(() => expect(log).toHaveTextContent('Модель готова: orders'))
		await tabTo(flowScene(canvas), userEvent)
		await userEvent.keyboard('Ord')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(log).toHaveTextContent('Клик: orders'))
	},
}
