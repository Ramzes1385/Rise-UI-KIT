import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import BaseFooter from '../../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const template = `
	<BaseFooter v-bind="args">
		<template #start>© 2026 Rise Studio</template>
		<BaseLink href="#privacy">Конфиденциальность</BaseLink>
	</BaseFooter>
`

export const Seo: StoryObj<typeof meta> = {
	args: {
		seo: {
			data: {
				name: 'Rise Studio',
				url: 'https://example.com',
				logo: 'https://example.com/logo.png',
				sameAs: ['https://t.me/rise_studio', 'https://vk.com/rise_studio'],
			},
		},
	},
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` — разметка schema.org `Organization` (JSON-LD) в подвале: данные о компании для карточки в поиске.',
					'Из пропсов подвала их не собрать, поэтому все поля — в `seo.data`: `name` обязателен, `url`, `logo`, `sameAs`,',
					'`contactPoint` — по желанию. `@type` можно заменить на подтип: `LocalBusiness`, `Store`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFooter', 'BaseLink'] }),
		},
	},
	render: args => ({
		components: { BaseFooter, BaseLink },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		await expect(JSON.parse(script?.textContent ?? '{}')).toMatchObject({ '@type': 'Organization', name: 'Rise Studio' })
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"sameAs"')
	},
}
