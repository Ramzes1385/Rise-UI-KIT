import { expect } from 'storybook/test'
import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const models = { rating: 'modelValue' }

const template = `
	<BaseRating v-bind="args" v-model="rating" />
`

export const Seo: StoryObj<typeof meta> = {
	args: {
		modelValue: 4.5,
		step: 0.5,
		isReadonly: true,
		seo: { data: { itemReviewed: { '@type': 'Product', name: 'Ноутбук Rise 13' }, ratingCount: 128 } },
	},
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` даёт разметку schema.org `AggregateRating` (JSON-LD): оценка — `modelValue`, шкала — `max`.',
					'Что оценивают и сколько оценок, компонент не знает — их передают в `seo.data` (`itemReviewed`, `ratingCount`).',
					'Без них Google не покажет звёзды в выдаче, а в разработке кит предупредит в консоли.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRating'], models }),
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		await expect(JSON.parse(script?.textContent ?? '{}')).toMatchObject({
			'@type': 'AggregateRating',
			ratingValue: 4.5,
			bestRating: 5,
			ratingCount: 128,
			itemReviewed: { name: 'Ноутбук Rise 13' },
		})
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"AggregateRating"')
	},
}
