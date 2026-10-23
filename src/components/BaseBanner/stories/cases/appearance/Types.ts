import { MESSAGES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseBanner.stories'
import BaseBanner from '../../../ui/BaseBanner.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { BANNER_TYPES } from '../../../types/BaseBanner.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const types = BANNER_TYPES

const messages = MESSAGES

const template = `
	<div class="story-stack">
		<BaseBanner v-for="type in types" :key="type" v-bind="args" :type="type" :text="messages[type]" :label="'Объявление ' + type" />
	</div>
`

export const Types: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isClosable'] },
		docs: {
			description: { story: 'Пять типов: цвет роли и иконка по умолчанию. Вариант меняется в Controls.' },
			source: storySource({
				template,
				imports: ['BaseBanner'],
				script: [`const types = ${literal(types)}`, `const messages = ${literal(messages)}`].join('\n'),
			}),
		},
	},
	render: args => ({
		components: { BaseBanner },
		setup: useStorySetup(args, { data: { types, messages } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('region')).toHaveLength(5)
		await expect(canvas.getByRole('region', { name: 'Объявление error' })).toHaveTextContent(MESSAGES.error)
	},
}
