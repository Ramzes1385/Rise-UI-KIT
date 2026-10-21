import { setup } from './Medium.setup'
import setupSource from './Medium.setup.ts?raw'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { docsFrame, scriptImports, scriptSource, storySource, STORY_WAIT_TIMEOUT, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseRoadmap3D
		v-bind="args"
		:data="mediumRoadmap"
		:progress="mediumProgress"
		height="640px"
		aria-label="Путь архитектора из двенадцати этапов" />
`

const kit = scriptImports(setupSource, { importsFrom: { '@ramzes1385/rise-ui-kit/roadmap3d': ['BaseRoadmap3D'] } })

export const Medium: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(720),
			description: {
				story: [
					'Средний путь: 12 этапов, пять пройдены. Остров растёт змейкой по три этапа в ряд, подписи разрежаются:',
					'полные у главных этапов, у остальных кружок с номером, полное название остаётся в полосе этапов и для скринридера.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				importsFrom: kit.importsFrom,
				vue: kit.vue,
				script: scriptSource(setupSource),
			}),
		},
		controls: { include: ['quality', 'isDisabled', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { slots: [], setup }),
		template,
	}),
	play: async ({ canvas }) => {
		const steps = await canvas.findByRole('list', { name: 'Этапы' })
		await waitFor(() => expect(within(steps).getAllByRole('button')).toHaveLength(12), { timeout: STORY_WAIT_TIMEOUT })
		await expect(within(steps).getAllByRole('button')[11]).toHaveAccessibleName(/^Этап 12 из 12: Этап 12\./)
		await expect(canvas.getByRole('heading', { level: 2, name: /^Путь архитектора/ })).toBeVisible()
	},
}
