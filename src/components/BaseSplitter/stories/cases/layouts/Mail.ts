import { expect } from 'storybook/test'
import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { literal, staticStorySource, tabTo, useStorySetup } from '@/stories/helpers'

const folders = ['Входящие', 'Отправленные', 'Черновики', 'Архив']

const letters = ['Счёт за сентябрь', 'Договор поставки', 'Сверка остатков', 'Отгрузка № 1048']

const state = { sizes: [20, 35, 45] }

const template = `
	<div style="height: 320px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model:sizes="sizes" :min="15" :max="60" :pane-labels="['Папки', 'Список писем']">
			<template #pane-1>
				<ul aria-label="Папки" style="margin: 0; padding: 12px 16px; list-style: none; display: grid; gap: 8px">
					<li v-for="folder in folders" :key="folder">{{ folder }}</li>
				</ul>
			</template>
			<template #pane-2>
				<ul aria-label="Письма" style="margin: 0; padding: 12px 16px; list-style: none; display: grid; gap: 8px">
					<li v-for="letter in letters" :key="letter">{{ letter }}</li>
				</ul>
			</template>
			<template #pane-3>
				<article style="padding: 12px 16px">
					<h3 style="margin-top: 0">Счёт за сентябрь</h3>
					<p style="margin: 0">Добрый день! Во вложении счёт за сентябрь, оплата до 10 октября.</p>
				</article>
			</template>
		</BaseSplitter>
	</div>
`

export const Mail: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Почта в три колонки: папки, список писем и письмо. `v-model:sizes` — размеры всех панелей, панели — слоты `pane-1`, `pane-2`, `pane-3`.',
					'Разделитель двигает только границу двух соседних панелей; `min` и `max` ограничивают каждую панель, `paneLabels` называют разделители.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter'],
				state,
				types: { sizes: 'number[]' },
				script: [`const folders = ${literal(folders)}`, `const letters = ${literal(letters)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter },
		setup: useStorySetup(args, { state, data: { folders, letters } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const [folderSeparator, listSeparator] = canvas.getAllByRole('separator')
		await expect(folderSeparator).toHaveAccessibleName('Папки')
		await expect(listSeparator).toHaveAccessibleName('Список писем')
		await expect(listSeparator).toHaveAttribute('aria-valuemax', '60')
		await tabTo(folderSeparator, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(folderSeparator).toHaveAttribute('aria-valuenow', '25')
		await expect(listSeparator).toHaveAttribute('aria-valuenow', '30')
	},
}
