import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseWatermark.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../../ui/BaseWatermark.vue'
import { watermarkLayer, waitForPattern } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseWatermark v-bind="args">
		<div class="story-frame story-medium story-stack">
			<strong>Служебная записка</strong>
			<span>Знак восстанавливается, если слой удалили из DOM или изменили его стили в инструментах разработчика.</span>
		</div>
	</BaseWatermark>
`

export const Protected: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`isProtected`: если слой убрали из DOM, он возвращается на место, а изменённые `style` и `class` — прежними.',
					'Play удаляет слой и портит его стили. Защита не действует против правил в таблицах стилей и отключённого JavaScript:',
					'для документов, где это важно, знак ставят на сервере.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseWatermark'] }),
		},
	},
	args: { content: 'Не копировать', isProtected: true },
	render: args => ({
		components: { BaseWatermark },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const layer = watermarkLayer(canvasElement)
		const root = layer.parentElement as HTMLElement
		await waitForPattern(layer)
		const image = layer.style.backgroundImage
		const opacity = layer.style.opacity

		layer.setAttribute('style', 'opacity: 1; background-image: none')
		await waitFor(() => {
			expect(layer.style.backgroundImage).toBe(image)
			expect(layer.style.opacity).toBe(opacity)
		})

		layer.remove()
		await waitFor(() => expect(root.contains(layer)).toBe(true))
		await expect(layer.style.backgroundImage).toBe(image)
		await expect(layer.style.opacity).toBe(opacity)
	},
}
