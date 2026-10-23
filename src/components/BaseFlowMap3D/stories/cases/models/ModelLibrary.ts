import { waitForCanvas } from '../../shared'
import { setup } from './ModelLibrary.setup'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import setupSource from './ModelLibrary.setup.ts?raw'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { MODEL3D_PRESET_IDS } from '@/scene3d/types/model3d.types'
import { scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseFlowMap3D v-bind="args" :data="data" height="640px" @ready="controller = $event" />
		<ul class="story-grid" aria-label="Модели библиотеки">
			<li v-for="model in models" :key="model.key" class="story-col">
				<b>{{ model.title }}</b>
				<code>model: '{{ model.key }}'</code>
				<span>{{ model.kind ?? 'фигура' }} · {{ model.animation }}</span>
				<BaseButton variant="outline" :aria-label="'Показать действие: ' + model.title" @click="play(model.key, model.animation)">
					Действие
				</BaseButton>
			</li>
		</ul>
	</div>
`

export const ModelLibrary: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['quality', 'camera', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Справочник встроенных моделей (мокап FlowModels3D): все ключи `MODEL3D_PRESETS` на одной сцене — 24 модели карты сервисов («На схеме оформления заказа» и «Ещё в реестре»), 9 пьедесталов роадмапа и две запасные (`server`, `shape`). Подпись под сценой — название, ключ `model3d.model`, вид и действие модели; «Действие» запускает его (`controller.getModel(id).play(...)`), как это делает шаг сценария.',
					'Модель узла подбирается по порядку: ключ `model3d.model`, затем модель вида в нотации, затем слова названия и меток (`web`, `оплата`, `kafka`…), иначе запасная (`server`). Свою модель — GLB по адресу или фабрику — подключает проп `models` (история `CustomModels`).',
					'Модели рисуются плоскими материалами кита без текстур: цвет задаёт роль детали (корпус, акцент, экран, металл, стекло, свет) и состояние узла.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton'],
				vue: ['ref'],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/flow3d': [
						'BaseFlowMap3D',
						'MODEL3D_PRESETS',
						'type FlowMap3DController',
						'type Model3DPresetId',
					],
					'@ramzes1385/rise-ui-kit': ['type FlowMapData'],
				},
				script: [`const LIBRARY_TITLES: Record<string, string> = { /* ключ модели → название */ }`, scriptSource(setupSource)].join(
					'\n\n',
				),
			}),
		},
	},
	args: { height: '640px' },
	render: args => ({
		components: { BaseFlowMap3D, BaseButton },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await waitForCanvas(canvasElement)
		const models = canvas.getByRole('list', { name: 'Модели библиотеки' })
		await expect(models.querySelectorAll('li')).toHaveLength(MODEL3D_PRESET_IDS.length)
		await expect(canvasElement.querySelectorAll('.base-flow-map-3d__tag')).toHaveLength(MODEL3D_PRESET_IDS.length)
		await waitFor(() => expect(args.onReady).toHaveBeenCalled())
		const controller = (args.onReady as unknown as { mock: { calls: [{ getModels: () => unknown[] }][] } }).mock.calls[0][0]
		await waitFor(() => expect(controller.getModels()).toHaveLength(MODEL3D_PRESET_IDS.length))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать действие: Платежи' }))
		await expect(args.onFallback).not.toHaveBeenCalled()
	},
}
