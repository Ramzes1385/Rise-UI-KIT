import { IMAGE_MAP_MALL } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'active', layer: 'layer' } as const

const LINKED_OBJECT = 'f3-shop-1'

const template = `
	<BaseImageMap v-bind="args" v-model:active="active" v-model:layer="layer" />
`

export const DeepLink: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ссылка на объект (`hasDeepLinking`): карта открывается с объектом из `?location=<id>` — этаж объекта, выбор и окно; выбор другого объекта меняет параметр через `history.replaceState`, снятие выбора убирает его. Имя параметра — `deepLinkParam`.',
					'На странице истории адрес фрейма получает `?location=f3-shop-1` перед показом; на странице Docs адрес не меняется, и карта открывается как обычно.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMap'],
				models: MODELS,
				types: { active: 'string | null', layer: 'string' },
			}),
		},
	},
	args: { data: IMAGE_MAP_MALL, hasDirectory: true, hasFilters: false, hasDeepLinking: true, layer: 'floor-1' },
	beforeEach: ({ viewMode }) => {
		const url = new URL(window.location.href)
		if (viewMode !== 'story' || url.searchParams.has('location')) return
		url.searchParams.set('location', LINKED_OBJECT)
		window.history.replaceState(window.history.state, '', url)
	},
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(await screen.findByRole('dialog', { name: 'Магазин 301' })).toBeVisible()
		await expect(canvas.getByRole('radio', { name: '3' })).toBeChecked()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Магазин 301' })).not.toBeInTheDocument())
		const list = within(canvas.getByRole('complementary', { name: 'Список объектов' }))
		const entry = list.getByRole('button', { name: /Магазин 302/ })
		await tabTo(entry, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(await screen.findByRole('dialog', { name: 'Магазин 302' })).toBeVisible()
		await waitFor(() => expect(new URL(window.location.href).searchParams.get('location')).toBe('f3-shop-2'))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvasElement.querySelector('[data-image-map-entry="f3-shop-2"]')).toHaveFocus())
	},
}
