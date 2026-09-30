import { expect } from 'storybook/test'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { MAP_PROVIDERS } from '../../../types/BaseMap.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-grid" style="--story-grid-min: 280px">
		<BaseMap v-for="provider in MAP_PROVIDERS" :key="provider" v-bind="args" :provider="provider" :aria-label="provider" />
	</div>
`

export const Providers: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Один API для Яндекс Карт и Google Maps: те же `center`, `zoom`, `markers` и события. Без ключа у каждой — заглушка с названием поставщика; у Google метки требуют Map ID (`mapId`, по умолчанию `DEMO_MAP_ID`).',
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
		await expect(canvas.getByRole('region', { name: 'google' })).toHaveTextContent('Google Maps')
		await expect(canvas.getByRole('region', { name: 'yandex' })).toHaveTextContent('Яндекс Карты')
	},
}
