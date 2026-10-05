import { isLiveMap } from '../../shared'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { MAP_PROVIDERS } from '../../../types/BaseMap.types'
import { storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const template = `
	<div class="story-grid" style="--story-grid-min: 280px">
		<BaseMap v-for="provider in MAP_PROVIDERS" :key="provider" v-bind="args" :provider="provider" :aria-label="provider" />
	</div>
`

export const Providers: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: 'Один API для Яндекс Карт и Google Maps: те же `center`, `zoom`, `markers` и события. Без ключа у каждой — заглушка с названием поставщика; у Google, кроме ключа, обязателен Map ID стиля карты (`mapId`): без него — заглушка «Нужен Map ID».',
			},
			source: storySource({ template, imports: ['BaseMap', 'MAP_PROVIDERS'] }),
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: { height: '240px' },
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { MAP_PROVIDERS } }),
		template,
	}),
	play: async ({ canvas }) => {
		const yandex = canvas.getByRole('region', { name: 'yandex' })
		if (isLiveMap) {
			await expect(canvas.getByRole('region', { name: 'google' })).toHaveTextContent('Нужен Map ID')
			await waitFor(() => expect(yandex).not.toHaveAttribute('aria-busy'))
			await expect(yandex).not.toHaveTextContent('Нужен ключ API')
			return
		}
		await expect(canvas.getByRole('region', { name: 'google' })).toHaveTextContent('Google Maps')
		await expect(yandex).toHaveTextContent('Яндекс Карты')
	},
}
