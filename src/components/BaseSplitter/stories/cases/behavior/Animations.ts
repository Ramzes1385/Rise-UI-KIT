import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSplitter.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseSplitter from '../../../ui/BaseSplitter.vue'

const motion = motionPresetsStory({
	item: `
		<div style="align-self: stretch; height: 120px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
			<BaseSplitter v-bind="args" :variant="isGhost ? 'ghost' : 'default'">
				<template #start><p style="margin: 12px 16px">Письма</p></template>
				<template #end><p style="margin: 12px 16px">Письмо</p></template>
			</BaseSplitter>
		</div>
	`,
	state: { isGhost: false },
	action: 'isGhost = !isGhost',
	trigger: 'Скрыть или показать линию',
	components: { BaseSplitter, BaseButton },
	imports: ['BaseSplitter'],
	slots: ['default'],
	omit: ['variant'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Пропа `animation` у разделителя нет: перетаскивание и стрелки меняют размеры панелей сразу — граница идёт за пальцем.',
					'Сглаживаются только цвета: линия и ручка при наведении, фокусе и перетаскивании, проявление линии варианта `ghost`',
					'(`--rise-duration-fast`). Кнопка переключает `default` и `ghost` в четырёх пресетах; наведите указатель на разделитель.',
					'В `none` и при «уменьшить движение» цвет меняется сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvasElement, canvas, userEvent }) => {
		const roots = () => [...canvasElement.querySelectorAll('.base-splitter')]

		await expect(canvas.getAllByRole('separator')).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Скрыть или показать линию' }))
		await waitFor(() => roots().forEach(root => expect(root).toHaveClass('base-splitter--ghost')))
		await userEvent.click(canvas.getByRole('button', { name: 'Скрыть или показать линию' }))
		await waitFor(() => roots().forEach(root => expect(root).not.toHaveClass('base-splitter--ghost')))
	},
}
