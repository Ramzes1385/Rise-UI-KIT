import { expect } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { literal, placeholderImage, storySource, useStorySetup } from '@/stories/helpers'

const cover = placeholderImage({ width: 680, height: 429, hue: 270 })

const template = `<div class="story-narrow"><BaseCardInput v-bind="args" :preview-cover="cover" /></div>`

export const PreviewCover: StoryObj<typeof meta> = {
	args: { hasPreview: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Обложка лицевой стороны превью — `previewCover`: адрес картинки или значение CSS `background`, как `cover` у BaseBankCard. Оборот (код) — на фоне `previewBackground`.',
					'Затемнение `--rise-media-scrim` держит контраст AA текста карты на любой картинке; своё содержимое обложки — слот `previewCover`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCardInput'], script: `const cover = ${literal(cover)}` }),
		},
	},
	render: args => ({
		components: { BaseCardInput },
		setup: useStorySetup(args, { data: { cover } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const front = canvasElement.querySelector('.base-card-input__face--front') as HTMLElement
		await expect(front).toHaveClass('base-card-input__face--cover')
		await expect(front.querySelector('img.card-cover__image')).toHaveAttribute('src', cover)
		await expect(front.querySelector('.card-cover__overlay')).not.toBeNull()
		await expect(canvasElement.querySelector('.base-card-input__face--back .card-cover')).toBeNull()
	},
}
