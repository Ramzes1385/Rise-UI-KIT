import { expect } from 'storybook/test'
import type meta from '../../BaseQrCode.stories'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-qr', caption: 'story-themed-caption' }

const template = `
	<div class="story-row">
		<BaseQrCode v-bind="args" variant="outline" show-value="host" label="По умолчанию" />
		<div style="--rise-qr-code-radius: var(--rise-radius-xl); --rise-qr-code-border: var(--rise-primary); --rise-qr-code-shadow: var(--rise-shadow-md); --rise-qr-code-caption-text: var(--rise-primary-text);">
			<BaseQrCode v-bind="args" variant="outline" show-value="host" label="Токены на контейнере" />
		</div>
		<BaseQrCode v-bind="args" variant="outline" show-value="host" :ui="ui" label="Классы через ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['value', 'size', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-qr-code-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `radius`, `shadow`, `border` и `padding` (рамка и поле',
					'варианта `outline`), `gap` (код — подпись), `caption-text` и `caption-font-size` (подпись). Цвета самого кода —',
					'пропы `moduleColor` и `backgroundColor`: тёмный код на светлом фоне нужен сканерам, поэтому токенами они не меняются.',
					'Проп `ui` добавляет классы к частям `root`, `box`, `svg`, `modules`, `finder`, `logo`, `message`, `reveal`, `caption`;',
					'глобально — `defaults.BaseQrCode.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseQrCode'],
				script: `const ui = ${literal(ui)}`,
				omit: ['variant', 'showValue', 'label'],
			}),
		},
	},
	render: args => ({
		components: { BaseQrCode },
		setup: useStorySetup(args, { data: { ui }, slots: ['variant', 'showValue', 'label'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('img', { name: 'По умолчанию' })
		const themed = canvas.getByRole('img', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('img', { name: 'Классы через ui' })
		const caption = (box: HTMLElement) => box.parentElement!.querySelector<HTMLElement>('.base-qr-code__caption')!

		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).boxShadow).not.toBe('none')
		await expect(getComputedStyle(plain).boxShadow).toBe('none')
		await expect(getComputedStyle(caption(themed)).color).not.toBe(getComputedStyle(caption(plain)).color)
		await expect(classed.parentElement).toHaveClass('base-qr-code', 'story-themed-qr')
		await expect(caption(classed)).toHaveClass('story-themed-caption')
	},
}
