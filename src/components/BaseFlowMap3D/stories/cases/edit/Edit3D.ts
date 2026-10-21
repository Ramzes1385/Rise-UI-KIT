import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { flowLive, flowScene, waitForCanvas } from '../../shared'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { data: 'data', mode: 'mode' } as const

const template = `
	<BaseFlowMap3D v-bind="args" v-model:data="data" v-model:mode="mode" />
`

const EDIT_WIDTH = 768

export const Edit3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					"Правка прямо в сцене (мокап FlowMap3D, «Режим правки»): `mode=\"edit\"` с кнопкой «Правка» в нижней панели (`modes: ['view', 'edit']`). Узел переносят по земле — ярус не меняется, положение привязывается к сетке, на занятой клетке перенос отклоняется; R поворачивает на 90°, «Заменить модель» открывает палитру (модели схемы, «Ещё в реестре» и своя GLB по адресу), C или «Связать» тянет связь к узлу-цели с проверкой правил нотации, Delete удаляет.",
					'Справа — свойства узла: название, тип, статус, модель, акцент, положение, масштаб и подъём. Все действия идут через ядро карты: `v-model:data` получает новые данные, `@change` — событие, правка в 3D отменяется в 2D и наоборот (Ctrl или ⌘ + Z и Y). Хуки `beforeConnect`, `beforeDelete`, `beforeChange` могут отклонить действие.',
					'Клавиатура: буквы ищут узел по названию; одиночные R и C (без набора и без Shift) — поворот и связь, поэтому название с R или C в начале набирают с Shift («Redis»); стрелки сдвигают узел на шаг сетки (подряд — одной правкой в истории), Alt со стрелками переходит к соседнему узлу, Enter открывает свойства, Escape отменяет перенос и связывание. Правка в 3D доступна от 768 px ширины контейнера; на узком контейнере и телефоне кнопки нет, а `mode="edit"` открывает правку ядра карты в 2D.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
				models: MODELS,
				types: { data: 'FlowMapData', mode: "'view' | 'edit'" },
			}),
		},
	},
	args: { modes: ['view', 'edit'], mode: 'view', height: '680px' },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await waitForCanvas(canvasElement)
		if (canvasElement.getBoundingClientRect().width < EDIT_WIDTH) {
			await expect(canvas.queryByRole('button', { name: 'Правка' })).toBeNull()
			return
		}
		const live = flowLive(canvasElement)
		await userEvent.click(canvas.getByRole('button', { name: 'Правка' }))
		await expect(canvas.getByRole('button', { name: 'Правка' })).toHaveAttribute('aria-pressed', 'true')
		await expect(await canvas.findByText(/^Правка: тяните узел/, {}, { timeout: 15000 })).toBeVisible()
		await tabTo(flowScene(canvas), userEvent)
		await userEvent.keyboard('Kafka')
		await userEvent.keyboard('{Enter}')
		const toolbar = await canvas.findByRole('toolbar', { name: 'Правка объекта' }, { timeout: 15000 })
		await expect(toolbar).toHaveTextContent('Kafka')
		await userEvent.keyboard('r')
		await waitFor(() => expect(live).toHaveTextContent('Узел повёрнут: 90°'))
		await userEvent.click(canvas.getByRole('button', { name: 'Заменить модель' }))
		const palette = await canvas.findByRole('dialog', { name: 'Заменить модель' }, { timeout: 15000 })
		await userEvent.click(canvas.getByRole('button', { name: 'Склад, модель rack' }))
		await waitFor(() => expect(live).toHaveTextContent('Модель заменена: Склад'))
		await expect(palette).not.toBeInTheDocument()
		await tabTo(flowScene(canvas), userEvent)
		await userEvent.keyboard('c')
		await waitFor(() => expect(live).toHaveTextContent('Связать «Kafka»'))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(live).toHaveTextContent('Связывание отменено'))
		await expect(args.onChange).toHaveBeenCalled()
		await userEvent.keyboard('{Control>}z{/Control}')
		await waitFor(() => expect(live).toHaveTextContent(/^Отменено: /))
	},
}
