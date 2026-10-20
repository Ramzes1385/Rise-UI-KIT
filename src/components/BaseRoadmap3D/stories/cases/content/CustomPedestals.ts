import { CylinderGeometry, Mesh } from 'three'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { expect, fn, waitFor, within } from 'storybook/test'
import type { BaseRoadmap3DProps } from '../../../types/BaseRoadmap3D.types'
import { miniProgress, miniRoadmap } from '@components/BaseRoadmap/stories/demo/mini'
import { docsFrame, literal, STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const data = {
	...miniRoadmap,
	stages: miniRoadmap.stages.map((stage, index) => ({ ...stage, model3d: { model: index === 0 ? 'beacon' : 'tower' } })),
}

const models: NonNullable<BaseRoadmap3DProps['models']> = {
	beacon: { title: 'Маяк', preset: 'rocket', tint: 'var(--rise-chart-3)', scale: 1.2 },
	tower: {
		title: 'Башня',
		create: (_node, context) =>
			new Mesh(
				context.geometry('tower', () => new CylinderGeometry(0.3, 0.45, 1.4, 6)),
				context.material('body'),
			),
	},
}

const template = `
	<BaseRoadmap3D v-bind="args" :data="data" :progress="progress" :models="models" height="460px" />
`

const script = `
const data = ${literal(data)}

const progress = ${literal(miniProgress)}

const models: NonNullable<BaseRoadmap3DProps['models']> = {
	beacon: { title: 'Маяк', preset: 'rocket', tint: 'var(--rise-chart-3)', scale: 1.2 },
	tower: {
		title: 'Башня',
		create: (_node, context) =>
			new Mesh(
				context.geometry('tower', () => new CylinderGeometry(0.3, 0.45, 1.4, 6)),
				context.material('body'),
			),
	},
}
`

export const CustomPedestals: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(680),
			description: {
				story: [
					'Свои модели пьедесталов: `model3d.model` этапа называет ключ из `models`. «Маяк» — встроенная модель `rocket` со своим цветом',
					'и масштабом, «Башня» — фабрика `create`, которая возвращает свой `Object3D` из кода приложения. Геометрия берётся через',
					'`context.geometry` и освобождается китом, материал `context.material` перекрашивается темой и состоянием этапа.',
					'GLB подключается так же: `{ url: "/models/server.glb" }`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/roadmap3d': ['BaseRoadmap3D', 'type BaseRoadmap3DProps'],
					three: ['CylinderGeometry', 'Mesh'],
				},
				script,
			}),
		},
		controls: { include: ['isDisabled', 'sizeScale'] },
	},
	args: { ariaLabel: 'Путь со своими пьедесталами', onModelReady: fn() },
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { slots: [], data: { data, progress: miniProgress, models } }),
		template,
	}),
	play: async ({ canvas, args }) => {
		await expect(await canvas.findByRole('region', { name: 'Путь со своими пьедесталами' })).toBeVisible()
		const steps = canvas.getByRole('list', { name: 'Этапы' })
		await waitFor(() => expect(within(steps).getAllByRole('button')).toHaveLength(2), { timeout: STORY_WAIT_TIMEOUT })
		await waitFor(() => expect(args.onModelReady).toHaveBeenCalled(), { timeout: STORY_WAIT_TIMEOUT })
	},
}
