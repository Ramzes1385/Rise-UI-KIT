import { expect } from 'storybook/test'
import { waitForPattern } from '../../shared'
import type meta from '../../BaseWatermark.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../../ui/BaseWatermark.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-frame', layer: 'story-themed-layer' }
const customClass = { root: 'story-custom-root', layer: 'story-custom-layer' }

const template = `
	<div class="story-stack story-medium">
		<BaseWatermark v-bind="args" :ui="ui">
			<div class="story-stack"><strong>Классы через ui</strong><span>Рамка вокруг обёртки.</span></div>
		</BaseWatermark>
		<BaseWatermark v-bind="args" :custom-class="customClass">
			<div class="story-stack"><strong>Классы через customClass</strong><span>Классы на обёртку и слой.</span></div>
		</BaseWatermark>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['content', 'opacity', 'textColor'] },
		docs: {
			description: {
				story: [
					'Токенов `--rise-watermark-*` у компонента нет: вид задают пропы `textColor`, `opacity`, `fontSize` и классы.',
					'Проп `ui` добавляет классы к частям (`root` — обёртка, `layer` — слой знака); глобально — `defaults.BaseWatermark.ui` плагина.',
					'`customClass` — те же части у отдельного экземпляра: строка идёт на корень, объект — по элементам.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseWatermark'],
				script: [`const ui = ${literal(ui)}`, `const customClass = ${literal(customClass)}`].join('\n'),
			}),
		},
	},
	render: args => ({
		components: { BaseWatermark },
		setup: useStorySetup(args, { data: { ui, customClass } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [classed, custom] = canvasElement.querySelectorAll<HTMLElement>('.base-watermark')
		await expect(classed).toHaveClass('base-watermark', 'story-frame')
		await expect(classed.querySelector('.base-watermark__layer')).toHaveClass('story-themed-layer')
		await expect(custom).toHaveClass('story-custom-root')
		const layer = custom.querySelector('.base-watermark__layer') as HTMLElement
		await expect(layer).toHaveClass('story-custom-layer')
		await waitForPattern(layer)
	},
}
