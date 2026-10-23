import { expect } from 'storybook/test'
import { SCROLL_LAYOUT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { layout: 'layout' }

const template = `
	<div data-scroll-box style="height: 360px; overflow: auto">
		<BaseDashboardGrid v-bind="args" v-model:layout="layout">
			<template #item="{ item }">
				<strong>{{ item.label }}</strong>
			</template>
		</BaseDashboardGrid>
	</div>
`

export const AutoScroll: StoryObj<typeof meta> = {
	args: { layout: SCROLL_LAYOUT, isEditable: true, rowHeight: 56 },
	parameters: {
		controls: { include: ['isEditable', 'compactType', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Сетка внутри прокручиваемого блока высотой 360px. Возьмите виджет мышью за полосу-ручку или за карточку и подведите указатель к верхней или нижней кромке блока (или окна страницы):',
					'область прокручивается сама, чем ближе к краю — тем быстрее, а виджет едет за указателем. Прокрутка идёт, пока кнопка нажата, и останавливается по отпусканию, `pointercancel` и Escape.',
					'Так же работает изменение размера за уголок. При «уменьшить движение» прокрутка остаётся: она следует за указателем и не является анимацией.',
					'Play указателем в Chromium невозможен (`setPointerCapture` на синтетическом указателе), поведение покрыто интеграционными тестами; клавиатурный режим прокручивает область фокусом.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'], models }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const box = canvasElement.querySelector('[data-scroll-box]') as HTMLElement
		await expect(box.scrollHeight).toBeGreaterThan(box.clientHeight)

		const last = canvas.getByRole('group', { name: 'Виджет 12' })
		await tabTo(last, userEvent)
		await expect(last).toHaveFocus()
		await expect(last.querySelector('[data-handle]')).not.toBeNull()
	},
}
