import { MOSCOW } from '../../shared'
import { expect } from 'storybook/test'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const state = { center: MOSCOW, zoom: 11 }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px">
		<BaseMap v-bind="args" v-model:center="center" v-model:zoom="zoom" language="ru_RU" aria-label="Русский" />
		<BaseMap v-bind="args" v-model:center="center" v-model:zoom="zoom" language="en_US" aria-label="English" />
	</div>
`

export const Languages: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Язык подписей карты по умолчанию — язык кита (переключатель «Русский / English» на панели), явный `language` его перекрывает:',
					'`ru_RU`, `en_US` у Яндекса, `ru`, `en` у Google. Обе карты связаны одними `v-model:center` и `v-model:zoom`: сдвиньте одну — поедет и вторая.',
					'Подписи видны только на живой карте (ключ из `.env.local`).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap'], state }),
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: { height: '260px' },
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('region', { name: 'Русский' })).toBeInTheDocument()
		await expect(canvas.getByRole('region', { name: 'English' })).toBeInTheDocument()
	},
}
