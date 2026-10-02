import { expect } from 'storybook/test'
import type meta from '../BaseAnchor.stories'
import BaseAnchor from '../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { AnchorItem } from '../../types/BaseAnchor.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items: AnchorItem[] = [
	{ id: 'terms', label: 'Условия возврата товара надлежащего качества, купленного дистанционно через интернет-магазин' },
	{
		id: 'documents',
		label: 'Документы',
		children: [{ id: 'documents-claim', label: 'Заявление на возврат денежных средств с указанием реквизитов банковского счёта' }],
	},
	{ id: 'reallyverylongidentifierwithoutspaces', label: 'Сверхдлинноеслововназванииразделабезпробеловкотороедолжнопереноситься' },
]

const template = `<BaseAnchor v-bind="args" :items="items" style="width: 220px" />`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинные подписи переносятся по словам, слово без пробелов — по символам; ширина не больше контейнера.' },
			source: storySource({ template, imports: ['BaseAnchor'], script: `const items = ${literal(items)}` }),
		},
	},
	render: args => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { items } }),
		template,
	}),
	play: async ({ canvas }) => {
		const nav = canvas.getByRole('navigation', { name: 'Содержание' })
		await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth)
	},
}
