import { expect } from 'storybook/test'
import { REACTIONS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEmojiPicker.stories'
import BaseEmojiPicker from '../../../ui/BaseEmojiPicker.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const reactions = REACTIONS

const ui = { root: 'story-themed-picker', emoji: 'story-themed-emoji' }

const template = `
	<div class="story-row" style="align-items: start;">
		<BaseEmojiPicker v-bind="args" :emojis="reactions" :columns="4" />
		<div style="--rise-emoji-picker-bg: var(--rise-bg-muted); --rise-emoji-picker-border: var(--rise-primary); --rise-emoji-picker-radius: var(--rise-radius-xl); --rise-emoji-picker-emoji-radius: var(--rise-radius-full); --rise-emoji-picker-tab-border-selected: var(--rise-success);">
			<BaseEmojiPicker v-bind="args" :emojis="reactions" :columns="4" />
		</div>
		<BaseEmojiPicker v-bind="args" :emojis="reactions" :columns="4" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale', 'hasSearch', 'hasPreview'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-emoji-picker-*` кит только читает: `bg`, `text`, `border`, `radius` — панель',
					'(`bg` и `text` — у варианта `default`, `border` — у `default` и `outline`); `heading-text` — заголовки разделов;',
					'`tab-bg-hover`, `tab-border-selected` — вкладки разделов; `emoji-bg-hover`, `emoji-radius`, `emoji-font-size` — ячейки эмодзи.',
					'Задайте их на `:root`, в теме или на контейнере, как здесь. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `search`, `input`, `nav`, `tab`, `grid`, `heading`, `emoji`, `preview`);',
					'глобально — `defaults.BaseEmojiPicker.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseEmojiPicker', 'type EmojiPickerItem'],
				script: [`const reactions: EmojiPickerItem[] = ${literal(reactions)}`, `const ui = ${literal(ui)}`].join('\n'),
				omit: ['emojis', 'columns', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseEmojiPicker },
		setup: useStorySetup(args, { data: { reactions, ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-emoji-picker')]
		const emoji = (root: HTMLElement) => root.querySelector('.base-emoji-picker__emoji') as HTMLElement
		const tab = (root: HTMLElement) => root.querySelector('.base-emoji-picker__tab[aria-current="true"]') as HTMLElement

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(tab(themed)).borderBottomColor).not.toBe(getComputedStyle(tab(plain)).borderBottomColor)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(emoji(themed)).borderTopLeftRadius).toBe('9999px')
		}
		await expect(classed).toHaveClass('base-emoji-picker', 'story-themed-picker')
		await expect(emoji(classed)).toHaveClass('base-emoji-picker__emoji', 'story-themed-emoji')
	},
}
