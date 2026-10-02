import { IMAGE_MAP_MALL } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'active', layer: 'layer', search: 'search' } as const

const template = `
	<BaseImageMap v-bind="args" v-model:active="active" v-model:layer="layer" v-model:search="search" />
`

export const Directory: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Список объектов слева от карты (`hasDirectory`): поиск без учёта регистра и «ё» по названию, описанию, группе и `keywords` (`v-model:search`), разделы по группам, подпись «группа · этаж». Поиск сужает только список, карту не трогает.',
					'Выбор строки переключает этаж и открывает окно объекта, после закрытия фокус возвращается в строку. Наведение на строку подсвечивает объект на карте, и наоборот. Лестницы скрыты из списка (`isHiddenInDirectory`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMap'],
				models: MODELS,
				types: { active: 'string | null', layer: 'string', search: 'string' },
			}),
		},
	},
	args: { data: IMAGE_MAP_MALL, hasDirectory: true, layer: 'floor-1', search: '', hasFilters: false },
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const directory = canvas.getByRole('complementary', { name: 'Список объектов' })
		const list = within(directory)
		await expect(list.getAllByRole('listitem')).toHaveLength(18)
		await userEvent.type(list.getByRole('textbox', { name: 'Поиск по карте' }), 'магазин 20')
		await waitFor(() => expect(list.getAllByRole('listitem')).toHaveLength(4))
		await expect(list.getByRole('status')).toHaveTextContent('Найдено 4 результата')
		const entry = list.getByRole('button', { name: /Магазин 205/ })
		await tabTo(entry, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(await screen.findByRole('dialog', { name: 'Магазин 205' })).toBeVisible()
		await waitFor(() => expect(canvas.getByRole('radio', { name: '2' })).toBeChecked())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(entry).toHaveFocus())
		await expect(entry).toHaveAttribute('aria-current', 'true')
		const shop = canvasElement.querySelector('[data-image-map-object="f2-shop-6"]')
		await userEvent.hover(list.getByRole('button', { name: /Магазин 206/ }))
		await waitFor(() => expect(shop).toHaveClass('base-image-map__object--hover'))
	},
}
