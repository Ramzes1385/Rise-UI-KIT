import { expect } from 'storybook/test'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const template = `
	<BaseMap v-bind="args" language="en_US" aria-label="English" />
`

export const Language: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Язык подписей карты по умолчанию — язык кита (переключатель «Русский / English» на панели), явный `language` его перекрывает:',
					'`ru_RU`, `en_US` у Яндекса, `ru`, `en` у Google. Язык задаётся при первой загрузке скрипта поставщика и действует на всю страницу:',
					'все карты страницы — на одном языке, смена `language` у уже показанной карты подписи не меняет. Если на холсте API уже загружен',
					'другой историей по-русски, обновите страницу — подписи станут английскими (видно только на живой карте с ключом из `.env.local`).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap'] }),
		},
		controls: { include: ['variant', 'sizeScale', 'height', 'zoom'] },
	},
	args: { height: '280px', zoom: 11 },
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('region', { name: 'English' })).toBeInTheDocument()
	},
}
