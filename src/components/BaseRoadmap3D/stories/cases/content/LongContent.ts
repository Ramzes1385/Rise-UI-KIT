import { setup } from './LongContent.setup'
import type meta from '../../BaseRoadmap3D.stories'
import setupSource from './LongContent.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { docsFrame, scriptImports, scriptSource, storySource, STORY_WAIT_TIMEOUT, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseRoadmap3D
		v-bind="args"
		:data="longRoadmap"
		:progress="longProgress"
		height="640px"
		aria-label="Длинный путь архитектора" />
`

const kit = scriptImports(setupSource, { importsFrom: { '@ramzes1385/rise-ui-kit/roadmap3d': ['BaseRoadmap3D'] } })

export const LongContent: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(720),
			description: {
				story: [
					'Длинное содержимое: 24 этапа с названиями в несколько строк, девять пройдены. Остров растёт змейкой по четыре этапа в ряд,',
					'берег и дорога не пересекаются, подписи обрезаются многоточием, а полное название остаётся в полосе этапов и для скринридера.',
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
		await waitFor(() => expect(within(steps).getAllByRole('button')).toHaveLength(24), { timeout: STORY_WAIT_TIMEOUT })
		await expect(within(steps).getAllByRole('button')[23]).toHaveAccessibleName(/^Этап 24 из 24: Этап 24\. Безопасная работа/)
		await expect(canvas.getByRole('heading', { level: 2, name: /^Полный путь архитектора/ })).toBeVisible()
	},
}
