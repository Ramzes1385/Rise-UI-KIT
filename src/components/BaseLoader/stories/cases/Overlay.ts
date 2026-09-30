import { expect } from 'storybook/test'
import type meta from '../BaseLoader.stories'
import BaseLoader from '../../ui/BaseLoader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-frame story-narrow" data-testid="container">
		<div class="story-col">
			<strong>Отчёт за май</strong>
			<span>Выручка выросла на 12%, число заказов — на 8%. Данные обновляются раз в час.</span>
		</div>
		<BaseLoader v-bind="args" />
	</div>
`

export const Overlay: StoryObj<typeof meta> = {
	args: { isOverlay: true, hasLabel: true, label: 'Обновление…' },
	parameters: {
		controls: { include: ['variant', 'hasLabel', 'label', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Оверлей: `isOverlay` накрывает родительский контейнер подложкой с индикатором по центру — например, пока',
					'обновляется карточка или таблица. Родителю нужен `position: relative`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseLoader'] }),
		},
	},
	render: args => ({
		components: { BaseLoader },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const container = canvas.getByTestId('container')
		const overlay = canvas.getByRole('status', { name: 'Обновление' }).getBoundingClientRect()
		await expect(overlay.width).toBeCloseTo(container.clientWidth, 0)
		await expect(overlay.height).toBeCloseTo(container.clientHeight, 0)
	},
}
