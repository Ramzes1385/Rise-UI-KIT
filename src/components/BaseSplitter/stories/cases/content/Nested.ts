import { expect } from 'storybook/test'
import { BaseCode } from '@components/BaseCode'
import { BaseImage } from '@components/BaseImage'
import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { checkSplitterDrag, checkSplitterKeyboard } from '../../play'
import { literal, STORY_IMAGES, staticStorySource, useStorySetup } from '@/stories/helpers'

const image = STORY_IMAGES[1]

const code = ['$ npm run build', 'vite v7 building for production...', '✓ 128 modules transformed.', 'dist/index.html  0.42 kB'].join('\n')

const state = { rowSize: 65, columnSize: 45 }

const template = `
	<div style="height: 400px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model="rowSize" orientation="vertical" label="Просмотр и журнал" :min="30" :max="80">
			<template #start>
				<BaseSplitter v-model="columnSize" label="Фотография" :min="25" :max="70">
					<template #start>
						<BaseImage :src="image.src" :alt="image.alt" width="100%" height="100%" fit="cover" />
					</template>
					<template #end>
						<article aria-label="Описание" style="padding: 12px 16px">
							<h3 style="margin-top: 0">Туман над долиной</h3>
							<p style="margin: 0">Снято в 6:40 с седловины. Облака лежат ниже тропы и к девяти часам рассеиваются.</p>
						</article>
					</template>
				</BaseSplitter>
			</template>
			<template #end>
				<BaseCode :code="code" language="bash" title="Журнал сборки" :has-line-numbers="false" />
			</template>
		</BaseSplitter>
	</div>
`

export const Nested: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вложенные разделители: горизонтальный (картинка и текст) лежит в верхней панели вертикального, а в нижней — журнал.',
					'У каждого разделителя своё имя (`label`) и свои границы; стрелки двигают тот разделитель, на котором стоит фокус:',
					'внешнему нужны ↑/↓, внутреннему — ←/→.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter', 'BaseImage', 'BaseCode'],
				state,
				script: [`const image = ${literal(image)}`, `const code = ${literal(code)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter, BaseImage, BaseCode },
		setup: useStorySetup(args, { state, data: { image, code } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const outer = canvas.getByRole('separator', { name: 'Просмотр и журнал' })
		const inner = canvas.getByRole('separator', { name: 'Фотография' })
		await expect(outer).toHaveAttribute('aria-orientation', 'horizontal')
		await expect(inner).toHaveAttribute('aria-orientation', 'vertical')
		await checkSplitterKeyboard(inner, { min: 25, max: 70, step: 5 }, userEvent)
		await checkSplitterKeyboard(outer, { min: 30, max: 80, step: 5, orientation: 'vertical' }, userEvent)
		await checkSplitterDrag(inner, { min: 25, max: 70 })
		await checkSplitterDrag(outer, { min: 30, max: 80, orientation: 'vertical' })
	},
}
