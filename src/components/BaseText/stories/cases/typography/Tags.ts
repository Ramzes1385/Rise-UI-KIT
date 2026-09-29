import { expect } from 'storybook/test'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TEXT_TAGS } from '../../../types/BaseText.types'

export const Tags: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'weight'] },
		docs: {
			description: {
				story: [
					'`tag` меняет только семантику: `h2` озвучивается как заголовок второго уровня, но выглядит как обычный текст.',
					'Размер и начертание заголовка задаются `sizeScale` и `weight` — даже `strong` без `weight` остаётся 400.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseText tag="h2" :size-scale="125" :weight="600">Заголовок раздела</BaseText>',
					'<BaseText tag="p">Абзац текста</BaseText>',
					'<BaseText tag="small" :size-scale="87.5">Примечание</BaseText>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'tag']), tags: TEXT_TAGS }),
		template: `
			<div class="story-col">
				<div v-for="tag in tags" :key="tag" class="story-row">
					<span class="story-label">&lt;{{ tag }}&gt;</span>
					<BaseText v-bind="props" :tag="tag">Итоги квартала</BaseText>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { level: 2, name: 'Итоги квартала' })).toBeVisible()
		const [paragraph] = canvas.getAllByText('Итоги квартала')
		const heading = canvas.getByRole('heading', { level: 1 })
		await expect(getComputedStyle(heading).fontSize).toBe(getComputedStyle(paragraph).fontSize)
	},
}
