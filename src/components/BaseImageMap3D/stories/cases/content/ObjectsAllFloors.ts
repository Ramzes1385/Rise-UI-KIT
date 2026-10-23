import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { IMAGE_MAP_FLOORS } from '@components/BaseImageMap/stories/fixtures'

const MODELS = { layer: 'layer', active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:layer="layer" v-model:active="active" />
	</div>
`

export const ObjectsAllFloors: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Скрытый от глаз список объектов для скринридеров и переключателей — по списку на каждый этаж, список текущего этажа первым («Список объектов, Этаж 1», затем остальные). Кнопка объекта другого этажа переключает этаж и выбирает объект, а область `aria-live` объявляет «Показан этаж: …».',
					'Фокус на кнопке объекта другого этажа ничего не подсвечивает на сцене: подсветка и карточка относятся к виду на экране. При `hasDirectory` вместо списка работает каталог.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { layer: 'string', active: 'string | null' },
			}),
		},
	},
	args: { data: IMAGE_MAP_FLOORS, layer: 'floor-1', active: null, height: '320px', defaultAction: 'none' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		const lists = canvas.getAllByRole('list').filter(list => (list.getAttribute('aria-label') ?? '').startsWith('Список объектов'))
		await expect(lists.map(list => list.getAttribute('aria-label'))).toEqual([
			'Список объектов, Этаж 1',
			'Список объектов, Этаж 2',
			'Список объектов, Этаж 3',
		])
		const button = within(lists[1]).getAllByRole('button')[0] as HTMLElement
		button.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('radio', { name: '2' })).toBeChecked())
		await expect(canvas.getByText('Показан этаж: Этаж 2')).toBeInTheDocument()
		await tabTo(canvas.getByRole('group', { name: 'Этаж 2' }), userEvent)
		await expect(canvas.getByRole('group', { name: 'Этаж 2' })).toHaveFocus()
	},
}
