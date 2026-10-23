import { setup } from './Events.setup'
import setupSource from './Events.setup.ts?raw'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseFlowMap.stories'
import { flowEdge, flowNode } from '../../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const kit = scriptImports(setupSource, { imports: ['BaseFlowMap'] })

const template = `
	<div class="story-stack">
		<BaseFlowMap
			v-bind="args"
			@ready="onReady"
			@node-click="onNodeClick"
			@edge-click="onEdgeClick"
			@focus-change="onFocusChange"
			@update:selection="onSelection" />
		<ol class="story-col" aria-label="Журнал событий">
			<li v-for="(line, index) in log" :key="index" class="story-label">{{ line }}</li>
		</ol>
	</div>
`

export const Events: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'События карты: `node-click`, `edge-click`, `focus-change`, `update:selection`, `change`, `node-move`, `scenario-step` и другие — обычные события компонента с данными в аргументе (`FlowEventMap`).',
					'Те же события и отменяемые хуки приложение подписывает из кода: `controller.on(name, handler)` возвращает функцию отписки; ниже `controller.on` ловит двойной щелчок и смену масштаба.',
					'Журнал показывает последние шесть событий.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				vue: kit.vue,
				importsFrom: kit.importsFrom,
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const log = canvas.getByRole('list', { name: 'Журнал событий' })
		await userEvent.click(flowNode(canvas, 'Orders'))
		await waitFor(() => expect(log).toHaveTextContent('node-click: orders'))
		await expect(log).toHaveTextContent('update:selection: orders')
		await userEvent.click(flowEdge(canvas, 'Вызов «gRPC»: API Gateway → Orders').querySelector('.base-flow-map__edge-hit')!)
		await waitFor(() => expect(log).toHaveTextContent('edge-click: e4'))
		await userEvent.dblClick(flowNode(canvas, 'Kafka'))
		await waitFor(() => expect(log).toHaveTextContent('controller.on node-dblclick: kafka'))
		await userEvent.click(canvas.getByRole('button', { name: 'Увеличить' }))
		await waitFor(() => expect(log).toHaveTextContent('controller.on viewport-change'))
	},
}
