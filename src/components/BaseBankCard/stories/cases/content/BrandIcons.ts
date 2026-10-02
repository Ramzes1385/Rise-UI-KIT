import { expect } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { placeholderImage, storySource, useStorySetup } from '@/stories/helpers'

const ICON = placeholderImage({ width: 64, height: 40, hue: 150 })

const template = `
	<div class="story-col">
		<BaseBankCard v-bind="args" />
		<BaseBankCard v-bind="args" is-compact />
	</div>
`

export const BrandIcons: StoryObj<typeof meta> = {
	args: { brand: 'mir', last4: '9019', brandIcons: { mir: ICON } },
	parameters: {
		docs: {
			description: {
				story: [
					'Официальные знаки марок приложение передаёт само: `brandIcons` — id марки → адрес картинки, он сильнее встроенного значка.',
					'Здесь вместо знака «Мир» — картинка-заглушка: настоящий знак берите из брендбука платёжной системы.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseBankCard'] }),
		},
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const images = canvasElement.querySelectorAll('img.card-brand-mark__image')
		await expect(images).toHaveLength(2)
		await expect(images[0]).toHaveAttribute('src', ICON)
		await expect(canvas.getAllByText('Мир, номер заканчивается на 9019, срок до 12/34')).toHaveLength(2)
	},
}
