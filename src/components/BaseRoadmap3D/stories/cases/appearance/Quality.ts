import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<span class="story-label">quality: low — без теней, деревьев, облаков и блёсток</span>
		<BaseRoadmap3D v-bind="args" quality="low" height="380px" aria-label="Путь — качество low" />
		<span class="story-label">quality: high — всё, что есть на острове</span>
		<BaseRoadmap3D v-bind="args" quality="high" height="380px" aria-label="Путь — качество high" />
	</div>
`

export const Quality: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(900),
			description: {
				story: [
					'Качество сцены. `low` — без теней, деревьев, облаков и блёсток, для слабых устройств; `high` — весь декор;',
					'`auto` (по умолчанию) рисует всё, а в узком контейнере (`compactBreakpoint`) — без мелочи.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/roadmap3d': ['BaseRoadmap3D'] },
			}),
		},
		controls: { include: ['isDisabled', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('region', { name: 'Путь — качество low' })).toBeVisible()
		await expect(canvas.getByRole('region', { name: 'Путь — качество high' })).toBeVisible()
	},
}
