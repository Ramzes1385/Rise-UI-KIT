import { setup } from './CustomModels.setup'
import { CUSTOM_FLOW } from '../../demo/custom'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import setupSource from './CustomModels.setup.ts?raw'
import { flowScene, waitForCanvas } from '../../shared'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { scriptSource, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap3D v-bind="args" :models="models" />
`

export const CustomModels: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['quality', 'camera', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Свои модели узлов — проп `models` (или плагин `createScene3DModels` для всего приложения), ключ — имя модели в `node.model3d.model`. Определение — три вида, `defineModel3D` сохраняет вывод типов:',
					'- **GLB по адресу** (`url`): грузится один раз на карту, узлам — клон, габариты вписываются в клетку; `parts` связывает узлы файла с ролями окраски (`body`, `accent`, `screen`…), `clips` — клипы анимации с действиями кита. Здесь — киоск из `stories/assets/kiosk.glb`: корпус, экран, лампа и створка с клипом `Open`. Сжатие DRACO и KTX2 подключает `configureLoader`.',
					'- **Фабрика** (`create`): свой `Object3D` из кода; материалы и геометрии берутся у кита (`context.material`, `context.geometry`) и освобождаются им, `animations` — действия модели. Здесь — «Маяк очереди».',
					'- **Встроенная под своим именем** (`preset`): `bank` с золотым акцентом и масштабом 1,1.',
					'У узла «Киоск оплаты» модель не названа: она подобрана по слову «киоск» из `words`. Шаги сценария «Оплата в киоске» играют анимации моделей: створка киоска открывается на шаге оплаты.',
					'Если GLB не загрузился, карта показывает 2D и шлёт `fallback` с причиной `error`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D', 'defineModel3D', 'type Model3DContext', 'type Model3DNode'],
					three: ['ConeGeometry', 'Mesh'],
				},
				script: `const kioskUrl = '/models/kiosk.glb'\n\n${scriptSource(setupSource)}`,
			}),
		},
	},
	args: { data: CUSTOM_FLOW, height: '480px' },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await waitForCanvas(canvasElement)
		await waitFor(() => expect(args.onReady).toHaveBeenCalled())
		const controller = (args.onReady as unknown as { mock: { calls: [{ getModel: (id: string) => unknown }][] } }).mock.calls[0][0]
		await waitFor(() => expect(controller.getModel('kiosk')).not.toBeNull(), { timeout: 8000 })
		await expect(controller.getModel('queue')).not.toBeNull()
		await expect(controller.getModel('bank')).not.toBeNull()
		await expect(args.onFallback).not.toHaveBeenCalled()
		await tabTo(flowScene(canvas, 'Киоски самообслуживания'), userEvent)
		await userEvent.keyboard('Киоск')
		await waitFor(() =>
			expect(canvasElement.querySelector('.base-flow-map-3d__sr[role="status"]')).toHaveTextContent(/^Киоск оплаты, /),
		)
	},
}
