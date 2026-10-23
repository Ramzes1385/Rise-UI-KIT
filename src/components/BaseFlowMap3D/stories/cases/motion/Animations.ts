import { waitForCanvas } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { camera: 'camera', isLayered: 'isLayered' } as const

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="camera = camera === 'iso' ? 'iso-90' : 'iso'">Повернуть камеру</BaseButton>
			<BaseButton variant="outline" @click="isLayered = !isLayered">{{ isLayered ? 'Свернуть слои' : 'Разнести слои' }}</BaseButton>
		</div>
		<BaseFlowMap3D v-bind="args" v-model:camera="camera" v-model:is-layered="isLayered" />
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['quality', 'particles', 'sizeScale'] },
		docs: {
			description: {
				story: [
					"Движение 3D-карты берётся из токенов области. Переход камеры между пресетами и наезд на узел идут по `--rise-duration-xslow`, «Слои» — вдвое дольше, плашки состояний проявляются через `--rise-duration`. Частицы трафика и анимации моделей шагов сценария живут только при включённом движении: при пресете «Сдержанно» частиц нет, а «уменьшить движение» и `motion: 'none'` ставят камеру и ярусы сразу в конец, останавливают частицы и токен, и сцена в покое кадров не рисует.",
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда. Холст WebGL тяжёлый, поэтому здесь один экземпляр, а не колонки четырёх пресетов: пресет области задаёт `data-rise-motion` на контейнере карты, переключатель «Движение» панели Storybook меняет его для всей страницы.",
					'«Повернуть камеру» переключает `iso` и `iso-90`, «Разнести слои» включает ярусы.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton'],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
				models: MODELS,
				types: { camera: 'Scene3DCameraPreset', isLayered: 'boolean' },
			}),
		},
	},
	args: { camera: 'iso', isLayered: false },
	render: args => ({
		components: { BaseFlowMap3D, BaseButton },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		await userEvent.click(canvas.getByRole('button', { name: 'Повернуть камеру' }))
		await waitFor(() =>
			expect(canvas.getByRole('button', { name: 'Вид 2: изометрия, поворот на 90°' })).toHaveAttribute('aria-pressed', 'true'),
		)
		await userEvent.click(canvas.getByRole('button', { name: 'Разнести слои' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Слои' })).toHaveAttribute('aria-pressed', 'true'))
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть слои' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Слои' })).toHaveAttribute('aria-pressed', 'false'))
	},
}
