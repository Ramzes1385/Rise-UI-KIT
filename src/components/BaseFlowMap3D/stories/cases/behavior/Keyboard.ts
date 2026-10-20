import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { expectDetails, flowLive, flowScene, waitForCanvas } from '../../shared'

const MODELS = { camera: 'camera' } as const

const template = `
	<div class="story-stack">
		<BaseFlowMap3D v-bind="args" v-model:camera="camera" />
		<p class="story-label">Камера: {{ camera }}</p>
	</div>
`

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: [
					'Карта целиком управляется с клавиатуры: одна точка Tab на всю сцену, дальше — клавиши. Стрелки — к ближайшему видимому узлу в эту сторону экрана, Home и End — первый и последний, `]` и `[` — по связям вперёд и назад, буквы — поиск узла по названию, Enter или пробел — выбрать, Escape — снять выбор.',
					'Камера: Q и E (без Shift, вне набора названия) — на четверть оборота, Shift со стрелками — поворот и наклон, `+` и `-` — масштаб, `0` — сброс вида. Каждый переход объявляет live-регион («Orders, Сервис, статус: Работает»); для скринридера основной путь — скрытый список узлов по группам.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
				models: MODELS,
				types: { camera: 'Scene3DCameraPreset' },
			}),
		},
	},
	args: { camera: 'iso' },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		const scene = flowScene(canvas)
		const live = flowLive(canvasElement)
		await tabTo(scene, userEvent)
		await expect(scene).toHaveFocus()
		await userEvent.keyboard('Orders')
		await waitFor(() => expect(live).toHaveTextContent(/^Orders, /))
		await userEvent.keyboard(']')
		await waitFor(() => expect(live).not.toHaveTextContent(/^Orders, /))
		await userEvent.keyboard('[[')
		await waitFor(() => expect(live).toHaveTextContent(/^Orders, /))
		await userEvent.keyboard('{Enter}')
		await expectDetails({ canvas, canvasElement, userEvent }, 'Orders')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('region', { name: 'Подробности узла' })).toBeNull())
		await userEvent.keyboard('e')
		await waitFor(() => expect(canvas.getByText(/^Камера: iso-\d+$/)).toBeVisible(), { timeout: 3000 })
		await waitFor(
			() => expect(canvas.getByRole('button', { name: 'Вид 2: изометрия, поворот на 90°' })).toHaveAttribute('aria-pressed', 'true'),
			{ timeout: 3000 },
		)
		await userEvent.keyboard('q')
		await waitFor(() => expect(canvas.getByText('Камера: iso')).toBeVisible(), { timeout: 3000 })
		await expect(scene).toHaveFocus()
	},
}
