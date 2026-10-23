import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { IMAGE_MAP_MALL } from '@components/BaseImageMap/stories/fixtures'

const MODELS = { view: 'view', layer: 'layer', active: 'active' } as const

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" v-model:view="view" v-model:layer="layer" v-model:active="active" />
	</div>
`

export const Directory3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Каталог, поиск и фильтры рядом со сценой — те же, что у BaseImageMap (`hasDirectory`, `data.filters`, `hours`, `hasDeepLinking`): объекты, скрытые фильтром, исчезают из сцены и не выбираются; наведение на строку подсвечивает объект и показывает его карточку.',
					'`has2dToggle` — переключатель «3D / 2D» над картой: 2D-вид — BaseImageMap с тем же выбранным объектом, этажом, поиском, фильтрами и маршрутом; изменения из 2D возвращаются в 3D. Без WebGL переключателя нет — карта сразу в 2D.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				models: MODELS,
				types: { view: "'3d' | '2d'", layer: 'string', active: 'string | null' },
			}),
		},
	},
	args: { data: IMAGE_MAP_MALL, hasDirectory: true, has2dToggle: true, layer: 'floor-1', view: '3d', active: null, height: '420px' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		const search = canvas.getByRole('textbox', { name: 'Поиск по карте' })
		await tabTo(search, userEvent)
		await userEvent.keyboard('Магазин 105')
		const row = await canvas.findByRole('button', { name: /Магазин 105/ })
		await userEvent.click(row)
		const dialog = await within(document.body).findByRole('dialog', { name: 'Магазин 105' })
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(dialog).not.toBeInTheDocument())
		const views = canvas.getByRole('radiogroup', { name: 'Вид карты' })
		await userEvent.click(within(views).getByRole('radio', { name: '2D' }))
		await waitFor(() => expect(canvasElement.querySelector('.base-image-map')).not.toBeNull())
		await userEvent.click(within(views).getByRole('radio', { name: '3D' }))
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
	},
}
