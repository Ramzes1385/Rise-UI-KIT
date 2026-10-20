import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { miniProgress, miniRoadmap } from '@components/BaseRoadmap/stories/demo/mini'
import { docsFrame, STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { data: 'data', focused: 'focused' } as const

const template = `
	<BaseRoadmap3D v-bind="args" v-model:data="data" v-model:focused="focused" />
`

export const Edit: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Режим `edit`: в панели этапа появляется блок «Правка этапа» — название, порядок («Раньше / Позже»), модель пьедестала,',
					'«Добавить этап» и «Удалить этап». Остров пересобирается по новым данным, `v-model:data` отдаёт их приложению,',
					'перестановку озвучивает `aria-live`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['type RoadmapData'],
				importsFrom: { '@ramzes1385/rise-ui-kit/roadmap3d': ['BaseRoadmap3D'] },
				models: MODELS,
				types: { data: 'RoadmapData', focused: 'string | null' },
			}),
		},
		controls: { include: ['isDisabled', 'sizeScale'] },
	},
	args: { data: miniRoadmap, progress: miniProgress, mode: 'edit', focused: 'basics' },
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { models: MODELS, slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const edit = await canvas.findByRole('region', { name: 'Правка этапа' })
		const title = within(edit).getByRole('textbox', { name: 'Название' })
		await userEvent.clear(title)
		await userEvent.type(title, 'Базовый Vue')
		await userEvent.tab()
		await userEvent.click(within(edit).getByRole('button', { name: 'Позже' }))
		await waitFor(
			() =>
				expect(
					canvas
						.getAllByRole('status')
						.map(item => item.textContent)
						.join(' '),
				).toMatch(/Этап «Базовый Vue» теперь 2 из 2/),
			{
				timeout: STORY_WAIT_TIMEOUT,
			},
		)
	},
}
