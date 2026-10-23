import { setup } from './Controller.setup'
import { expect, waitFor } from 'storybook/test'
import setupSource from './Controller.setup.ts?raw'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const models = { data: 'data' }
const kit = scriptImports(setupSource, { imports: ['BaseFlowMap', 'BaseButton'] })

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="fit">Вписать</BaseButton>
			<BaseButton variant="outline" @click="showKafka">Показать Kafka</BaseButton>
			<BaseButton variant="outline" @click="select">Выделить Orders и Payments</BaseButton>
			<BaseButton variant="outline" @click="highlight">Путь Web → Kafka</BaseButton>
			<BaseButton variant="outline" @click="clear">Снять подсветку</BaseButton>
			<BaseButton variant="outline" @click="addNode">Добавить узел</BaseButton>
			<BaseButton variant="outline" @click="undo">Отменить</BaseButton>
			<BaseButton variant="outline" @click="exportJson">Выгрузить JSON</BaseButton>
		</div>
		<BaseFlowMap ref="map" v-bind="args" v-model:data="data" />
		<p class="story-label" role="status">{{ result }}</p>
	</div>
`

export const Controller: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Управление картой через `ref` (то же — `useFlowMap()` в дочерних компонентах): кнопки вызывают методы контроллера `FlowMapController`.',
					'`fitView`, `focus`, `select`, `highlightPath` меняют только вид и выделение; `addNode`, `undo`, `importJson` меняют данные одним шагом истории и возвращают их через `v-model:data`.',
					'Методы возвращают результат с `isApplied` и причиной отказа правила нотации или хука.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				vue: kit.vue,
				importsFrom: kit.importsFrom,
				models,
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap, BaseButton },
		setup: useStorySetup(args, { models, setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Путь Web → Kafka' }))
		await waitFor(() => expect(canvas.getByText('Путь Web → Kafka: e1, e4, e9')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Выделить Orders и Payments' }))
		await expect(flowNode(canvas, 'Orders')).toHaveAttribute('aria-current', 'true')
		await expect(flowNode(canvas, 'Payments')).toHaveAttribute('aria-current', 'true')
		await userEvent.click(canvas.getByRole('button', { name: 'Показать Kafka' }))
		await waitFor(() => expect(flowNode(canvas, 'Kafka')).toHaveFocus())
		await userEvent.click(canvas.getByRole('button', { name: 'Добавить узел' }))
		await waitFor(() => expect(flowNodes(canvas)).toHaveLength(13))
		await expect(flowNode(canvas, 'Search')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Отменить' }))
		await waitFor(() => expect(flowNodes(canvas)).toHaveLength(12))
	},
}
