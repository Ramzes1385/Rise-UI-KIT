import { expect } from 'storybook/test'
import type meta from '../../BaseLoader.stories'
import BaseLoader from '../../../ui/BaseLoader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow story-stage" data-testid="stage">
		<div class="story-frame" data-testid="container">
			<section class="story-col" aria-label="Отчёт за май">
				<strong>Отчёт за май</strong>
				<span>Выручка выросла на 12%, число заказов — на 8%. Данные обновляются раз в час.</span>
			</section>
			<BaseLoader v-bind="args" />
		</div>
		<div
			class="story-frame story-window"
			role="dialog"
			aria-label="Открытое окно"
			data-testid="window">
			Окно поверх карточки
		</div>
	</div>
`

export const OverlayUnderWindow: StoryObj<typeof meta> = {
	args: { isOverlay: true, hasLabel: true, label: 'Обновление…' },
	parameters: {
		controls: { include: ['variant', 'hasLabel', 'label', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Подложка `isOverlay` лежит над содержимым своего контейнера, но под окнами кита: её слой — на единицу ниже `--rise-z-overlay`.',
					'Контейнер без собственного контекста наложения (`isolation`, `transform`, `z-index`) не прячет открытое окно, диалог или',
					'выпадающий список под подложкой, даже если окно перекрывает контейнер.',
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
		const windowRect = canvas.getByRole('dialog', { name: 'Открытое окно' }).getBoundingClientRect()
		const atWindow = document.elementFromPoint(windowRect.left + windowRect.width / 2, windowRect.top + windowRect.height / 2)
		await expect(atWindow?.closest('[role="dialog"]')).not.toBeNull()
		const containerRect = canvas.getByTestId('container').getBoundingClientRect()
		const atContainer = document.elementFromPoint(containerRect.right - 6, containerRect.bottom - 6)
		await expect(atContainer?.closest('[role="status"]')).not.toBeNull()
	},
}
