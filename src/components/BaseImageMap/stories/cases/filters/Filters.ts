import { IMAGE_MAP_MALL } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { filters: 'filters', search: 'search' } as const

const template = `
	<div class="story-stack">
		<BaseImageMap v-bind="args" v-model:filters="filters" v-model:search="search" />
		<p>Фильтры: {{ JSON.stringify(filters) }}</p>
	</div>
`

export const Filters: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					"Фильтры из `data.filters` над списком (`v-model:filters`, ключ — id фильтра). Четыре вида: `checkbox` без `options` — по группам; `tags` — метки-переключатели, здесь с `logic: 'and'` (объект должен иметь все выбранные удобства); `switch`; `select` — одно значение и «Все». Разные фильтры сочетаются по «и».",
					'Скрытые фильтром точки пропадают с карты, элементы SVG плана бледнеют и перестают быть кнопками. «Сбросить фильтры» очищает поиск и фильтры.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMap', 'type ImageMapFilterValues'],
				models: MODELS,
				types: { filters: 'ImageMapFilterValues', search: 'string' },
			}),
		},
	},
	args: { data: IMAGE_MAP_MALL, hasDirectory: true, filters: {}, search: '' },
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const list = within(canvas.getByRole('complementary', { name: 'Список объектов' }))
		const filters = within(list.getByRole('group', { name: 'Фильтры' }))
		const parking = filters.getByRole('button', { name: 'Парковка' })
		await expect(parking).toHaveAttribute('aria-pressed', 'false')
		await tabTo(parking, userEvent)
		await userEvent.keyboard(' ')
		await waitFor(() => expect(parking).toHaveAttribute('aria-pressed', 'true'))
		await waitFor(() => expect(list.getAllByRole('listitem')).toHaveLength(9))
		await expect(list.getByRole('status')).toHaveTextContent('Найдено 9 результатов')
		const stairs = canvasElement.querySelector('[data-image-map-object="f1-stairs"]')
		await expect(stairs).toBeNull()
		await expect(canvasElement.querySelectorAll('.base-image-map__object--filtered')).toHaveLength(3)
		await expect(canvas.queryByRole('button', { name: 'Справочная' })).not.toBeInTheDocument()
		await userEvent.click(filters.getByRole('button', { name: 'Wi-Fi' }))
		await waitFor(() => expect(list.getAllByRole('listitem')).toHaveLength(3))
		await expect(canvas.getByText('Фильтры: {"amenities":["parking","wifi"]}')).toBeVisible()
		await userEvent.click(filters.getByRole('switch', { name: 'Детская комната рядом' }))
		await waitFor(() => expect(list.getByRole('status')).toHaveTextContent('Ничего не найдено'))
		await userEvent.click(list.getByRole('button', { name: 'Сбросить фильтры' }))
		await waitFor(() => expect(list.getAllByRole('listitem')).toHaveLength(18))
		await expect(parking).toHaveAttribute('aria-pressed', 'false')
		await expect(canvasElement.querySelectorAll('.base-image-map__object--filtered')).toHaveLength(0)
	},
}
