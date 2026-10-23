import type meta from '../../BaseAffix.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAffix from '../../../ui/BaseAffix.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div id="story-affix-top" tabindex="0" role="region" aria-label="Прокручиваемая страница" style="height: 240px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
		<div style="padding: 24px 16px">Отчёт за сентябрь</div>
		<BaseAffix v-bind="args" :offset-top="16" target="#story-affix-top">
			<template #default="{ isFixed }">
				<div style="padding: 12px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">{{ isFixed ? 'Закреплено на 16px от верха' : 'Фильтры отчёта' }}</div>
			</template>
		</BaseAffix>
		<div v-for="n in 10" :key="n" style="padding: 12px 16px 0">Строка отчёта {{ n }}. Данные прокручиваются под панелью.</div>
	</div>
`

export const Top: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['hasShadow', 'sizeScale'] },
		docs: {
			description: {
				story: 'Прилипание к верху с отступом: `offsetTop` 16 оставляет над панелью просвет, в котором видно прокручиваемое содержимое. Блок прилипает, когда до верха области остаётся меньше 16px.',
			},
			source: storySource({ template, imports: ['BaseAffix'], omit: ['offsetTop', 'target'] }),
		},
	},
	render: args => ({
		components: { BaseAffix },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, args }) => {
		const container = canvasElement.querySelector('#story-affix-top') as HTMLElement
		const affix = canvasElement.querySelector('.base-affix') as HTMLElement
		await expect(affix).not.toHaveClass('base-affix--fixed')

		container.scrollTop = 200
		await waitFor(() => expect(affix).toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true))
		await expect(canvas.getByText('Закреплено на 16px от верха')).toBeVisible()
		const expectedTop = container.getBoundingClientRect().top + container.clientTop + 16
		await expect(Math.abs(affix.getBoundingClientRect().top - expectedTop)).toBeLessThan(1.5)

		container.scrollTop = 0
		await waitFor(() => expect(affix).not.toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false))
	},
}
