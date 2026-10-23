import { expect } from 'storybook/test'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const template = `
	<div class="story-medium">
		<BaseAccordion v-bind="args" />
	</div>
`

export const Seo: StoryObj<typeof meta> = {
	args: { seo: true },
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` превращает вопросы и ответы в разметку schema.org `FAQPage` (JSON-LD) — под примером она как для поисковика.',
					'Вопрос — `label`, ответ — `content`; если ответ в слоте, текст для разметки — `seoAnswer` пункта.',
					'Google показывает FAQ в выдаче не всем сайтам, но разметка остаётся валидной и читается Яндексом.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAccordion'] }),
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		const data = JSON.parse(script?.textContent ?? '{}')
		await expect(data['@type']).toBe('FAQPage')
		await expect(data.mainEntity[0]).toMatchObject({ '@type': 'Question', name: 'Как оформить заказ?' })
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"acceptedAnswer"')
	},
}
