import { expect } from 'storybook/test'
import type meta from '../BaseBanner.stories'
import BaseBanner from '../../ui/BaseBanner.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { isOpen: 'isOpen' } as const

const template = `<BaseBanner v-bind="args" v-model:is-open="isOpen" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: меняйте тип, вариант, текст и положение в панели Controls. Показ — `v-model:is-open`.' },
			source: storySource({ template, imports: ['BaseBanner'], models: MODELS }),
		},
	},
	render: args => ({
		components: { BaseBanner },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas }) => {
		const banner = canvas.getByRole('region', { name: 'Объявление' })
		await expect(banner).toHaveTextContent('Новый тариф «Команда» уже доступен')
	},
}
