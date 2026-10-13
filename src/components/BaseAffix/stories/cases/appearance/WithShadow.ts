import type meta from '../../BaseAffix.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAffix from '../../../ui/BaseAffix.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div id="story-affix-shadow" tabindex="0" role="region" aria-label="Прокручиваемая страница" style="height: 240px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
		<div style="padding: 24px 16px">Каталог товаров</div>
		<BaseAffix v-bind="args" has-shadow target="#story-affix-shadow">
			<template #default="{ isFixed }">
				<div style="padding: 12px 16px; background: var(--rise-bg-elevated)">{{ isFixed ? 'Панель закреплена, под ней тень' : 'Сортировка и фильтры' }}</div>
			</template>
		</BaseAffix>
		<div v-for="n in 10" :key="n" style="padding: 12px 16px 0">Товар {{ n }}. Описание товара прокручивается под панелью.</div>
	</div>
`

export const WithShadow: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['offsetTop', 'sizeScale'] },
		docs: {
			description: {
				story: 'Тень `hasShadow`: у блока на месте тени нет, у прилипшего она отделяет панель от прокручиваемого под ней содержимого. Цвет и размер тени — токен `--rise-affix-shadow`.',
			},
			source: storySource({ template, imports: ['BaseAffix'], omit: ['hasShadow', 'target'] }),
		},
	},
	render: args => ({
		components: { BaseAffix },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const container = canvasElement.querySelector('#story-affix-shadow') as HTMLElement
		const affix = canvasElement.querySelector('.base-affix') as HTMLElement
		await expect(affix).toHaveClass('base-affix--shadow')
		await expect(getComputedStyle(affix).boxShadow).toBe('none')

		container.scrollTop = 200
		await waitFor(() => expect(affix).toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(getComputedStyle(affix).boxShadow).not.toBe('none'))
		await expect(canvas.getByText('Панель закреплена, под ней тень')).toBeVisible()
	},
}
