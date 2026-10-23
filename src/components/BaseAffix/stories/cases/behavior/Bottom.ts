import type meta from '../../BaseAffix.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAffix from '../../../ui/BaseAffix.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div id="story-affix-bottom" tabindex="0" role="region" aria-label="Прокручиваемая страница" style="height: 240px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
		<div v-for="n in 10" :key="n" style="padding: 12px 16px 0">Позиция заказа {{ n }}. Список длиннее видимой области.</div>
		<BaseAffix v-bind="args" :offset-bottom="16" target="#story-affix-bottom">
			<template #default="{ isFixed }">
				<div style="padding: 12px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">{{ isFixed ? 'Итого закреплено внизу' : 'Итого на своём месте' }}</div>
			</template>
		</BaseAffix>
		<div style="padding: 48px 16px">Конец списка</div>
	</div>
`

export const Bottom: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['hasShadow', 'sizeScale'] },
		docs: {
			description: {
				story: 'Прилипание к низу: `offsetBottom` 16. Панель итогов стоит в конце списка, но пока он не долистан, остаётся у нижнего края области; на своё место она возвращается, когда список долистан до конца.',
			},
			source: storySource({ template, imports: ['BaseAffix'], omit: ['offsetBottom', 'target'] }),
		},
	},
	render: args => ({
		components: { BaseAffix },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, args }) => {
		const container = canvasElement.querySelector('#story-affix-bottom') as HTMLElement
		const affix = canvasElement.querySelector('.base-affix') as HTMLElement
		await waitFor(() => expect(affix).toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true))
		await expect(canvas.getByText('Итого закреплено внизу')).toBeVisible()
		const expectedBottom = container.getBoundingClientRect().top + container.clientTop + container.clientHeight - 16
		await expect(Math.abs(affix.getBoundingClientRect().bottom - expectedBottom)).toBeLessThan(1.5)

		container.scrollTop = container.scrollHeight
		await waitFor(() => expect(affix).not.toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false))
		await expect(canvas.getByText('Итого на своём месте')).toBeVisible()
	},
}
