import { expect } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'modelValue' } as const

const template = `
	<div class="story-narrow" style="position: relative">
		<p v-for="line in 6" :key="line">Лента новостей: под стеклянной панелью виден размытый текст страницы — строка {{ line }}.</p>
		<BaseBottomNav v-bind="args" v-model="active" style="position: absolute; inset-inline: 0; bottom: 0" />
	</div>
`

export const Glass: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`glass` — полупрозрачная панель: содержимое страницы под ней размыто (`backdrop-filter`). Браузер без `backdrop-filter` получает сплошной приподнятый фон. Выбранный пункт отмечает скользящая подложка.',
			},
			source: storySource({ template, imports: ['BaseBottomNav'], models: MODELS }),
		},
	},
	args: { variant: 'glass' },
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const nav = canvas.getByRole('navigation')
		await expect(nav).toHaveClass('base-bottom-nav--glass')
		await userEvent.click(canvas.getByRole('button', { name: 'Поиск' }))
		await expect(canvas.getByRole('button', { name: 'Поиск' })).toHaveAttribute('aria-current', 'page')
	},
}
