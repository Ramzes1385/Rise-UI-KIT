import { expect } from 'storybook/test'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { TEXT_WEIGHT } from '../../../model/textWeight'

export const Hierarchy: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Иерархия текста в блоке: заголовок (`h3`, sizeScale 125, 600), основной текст и подпись (`--rise-text-muted`).',
			},
			source: {
				code: [
					`<BaseText tag="h3" :size-scale="125" :weight="600" :color="{ text: { base: 'var(--rise-text-highlighted)' } }">`,
					'  Ребрендинг',
					'</BaseText>',
					'<BaseText>Новый логотип, палитра и шаблоны презентаций для всех отделов.</BaseText>',
					`<BaseText tag="small" :size-scale="87.5" :color="{ text: { base: 'var(--rise-text-muted)' } }">Обновлено 15 мая</BaseText>`,
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { BaseText },
		setup: () => ({ TEXT_WEIGHT }),
		template: `
			<div class="story-col story-narrow" style="gap: 4px;">
				<BaseText tag="h3" :size-scale="125" :weight="TEXT_WEIGHT.SEMIBOLD" :color="{ text: { base: 'var(--rise-text-highlighted)' } }">
					Ребрендинг
				</BaseText>
				<BaseText>Новый логотип, палитра и шаблоны презентаций для всех отделов.</BaseText>
				<BaseText tag="small" :size-scale="87.5" :color="{ text: { base: 'var(--rise-text-muted)' } }">Обновлено 15 мая</BaseText>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const heading = canvas.getByRole('heading', { level: 3, name: 'Ребрендинг' })
		await expect(getComputedStyle(heading).fontSize).toBe('17.5px')
		await expect(getComputedStyle(heading).fontWeight).toBe('600')
	},
}
