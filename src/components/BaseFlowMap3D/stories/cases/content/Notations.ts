import { expect, waitFor } from 'storybook/test'
import { flowBpmn } from '@components/BaseFlowMap'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { flowLive, flowScene, tagNames, waitForCanvas } from '../../shared'
import { RETURN_PROCESS } from '@components/BaseFlowMap/stories/fixtures/process/bpmn'

const template = `
	<BaseFlowMap3D v-bind="args" :notations="[flowBpmn]" />
`

export const Notations: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Нотации ядра карты работают и в 3D: BPMN «Возврат товара» с пулами и дорожками. Узлы нотации без своей модели рисуются моделью `shape` — фигурой нотации (круг события, скруглённая задача, ромб шлюза) на подставке; вид задаётся полем `shape` вида узла, цвет — состоянием.',
					'Нотация подключается пропом `notations` (`[flowBpmn]`), как у BaseFlowMap; связи и подписи идут по раскладке нотации. Узлы можно заменить моделями из реестра: `node.model3d.model` или `modelResolver`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['flowBpmn'],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
			}),
		},
	},
	args: { data: RETURN_PROCESS, height: '640px' },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { data: { flowBpmn } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		await expect(tagNames(canvasElement)).toContain('Заявка корректна?')
		await tabTo(flowScene(canvas, 'Возврат товара'), userEvent)
		await userEvent.keyboard('Заявка')
		await waitFor(() => expect(flowLive(canvasElement)).toHaveTextContent(/^Заявка/))
		await expect(flowScene(canvas, 'Возврат товара')).toHaveFocus()
	},
}
