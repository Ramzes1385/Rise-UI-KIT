import { expect } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { literal, placeholderImage, storySource, useStorySetup } from '@/stories/helpers'

const cover = placeholderImage({ width: 640, height: 404, hue: 45 })
const gradient = 'linear-gradient(135deg, var(--rise-color-primary-800), var(--rise-color-success-900))'

const template = `
	<div class="story-col">
		<BaseBankCard v-bind="args" :cover="cover" />
		<BaseBankCard v-bind="args" :cover="gradient" :has-cover-overlay="false" />
		<BaseBankCard v-bind="args" :cover="cover" is-compact />
	</div>
`

export const Cover: StoryObj<typeof meta> = {
	args: { brand: 'visa', last4: '4242', expiry: '12/34', holder: 'IVAN IVANOV', label: 'Путешествия' },
	parameters: {
		docs: {
			description: {
				story: [
					'Обложка карты — проп `cover`: адрес картинки или значение CSS `background` (градиент, цвет).',
					'Поверх обложки — затемнение `--rise-media-scrim`: светлый текст читается с контрастом AA даже на самой светлой картинке (здесь — светлое небо).',
					'Свой тёмный градиент может обойтись без затемнения: `:has-cover-overlay="false"` — контраст тогда проверяет приложение.',
					'В `isCompact` обложка — на мини-карте вместо плашки марки. Пока картинка грузится или если не загрузилась, виден фон по марке (`background`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBankCard'],
				script: [`const cover = ${literal(cover)}`, `const gradient = ${literal(gradient)}`].join('\n'),
			}),
		},
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args, { data: { cover, gradient } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [image, fill, compact] = canvasElement.querySelectorAll('.base-bank-card')
		await expect(image.querySelector('img.card-cover__image')).toHaveAttribute('src', cover)
		await expect(image.querySelector('.card-cover__overlay')).not.toBeNull()
		await expect(fill.querySelector('.card-cover__fill')).not.toBeNull()
		await expect(fill.querySelector('.card-cover__overlay')).toBeNull()
		await expect(compact.querySelector('.base-bank-card__brand--cover .card-cover__image')).not.toBeNull()
	},
}
