import { expect } from 'storybook/test'
import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import { SHOWCASE_MESSAGES } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const messages = SHOWCASE_MESSAGES

const ui = { root: 'story-themed-chat', list: 'story-themed-list', bubble: 'story-themed-bubble' }

const template = `
	<div class="story-grid" style="--story-grid-min: 320px;">
		<BaseChat v-bind="args" :messages="messages" subtitle="По умолчанию" height="420px" />
		<div style="--rise-chat-bg: var(--rise-bg-muted); --rise-chat-bubble-me-bg: var(--rise-success-soft); --rise-chat-bubble-radius: var(--rise-radius-2xl); --rise-chat-bubble-padding-x: 16px; --rise-chat-list-gap: 12px;">
			<BaseChat v-bind="args" :messages="messages" subtitle="Токены на контейнере" height="420px" />
		</div>
		<BaseChat v-bind="args" :messages="messages" subtitle="Классы через ui" height="420px" :ui="ui" />
	</div>
`

const script = `
const messages: ChatMessage[] = ${literal(messages)}
const ui = ${literal(ui)}
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { quickReplies: [] },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-chat-*` кит только читает: `bg` (фон окна), `list-gap`, `list-padding-x`,',
					'`list-padding-y` (лента), `bubble-bg` (чужие пузыри), `bubble-me-bg` (свои), `bubble-border`, `bubble-radius`,',
					'`bubble-shadow`, `bubble-padding-x`, `bubble-padding-y`, `bubble-text` — задайте их на `:root`, в теме или на контейнере,',
					'как здесь. В варианте `flat` пузырей нет: токены пузыря на него не действуют. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `body`, `header`, `pinned`, `list`, `message`, `bubble`, `input`, `toolbar`);',
					'глобально — `defaults.BaseChat.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseChat', 'type ChatMessage'],
				script,
				omit: ['messages', 'subtitle', 'height'],
			}),
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: useStorySetup(args, { data: { messages, ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-chat')]
		const myBubble = (chat: HTMLElement) =>
			getComputedStyle(chat.querySelector('.base-chat-message-list__item--me .base-chat-message-list__bubble')!)
		const list = (chat: HTMLElement) => getComputedStyle(chat.querySelector('.base-chat-message-list')!)

		await expect(myBubble(themed).backgroundColor).not.toBe(myBubble(plain).backgroundColor)
		await expect(getComputedStyle(themed.querySelector('.base-chat__body')!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
		if (!isStoryBranded()) await expect(myBubble(themed).borderTopLeftRadius).not.toBe(myBubble(plain).borderTopLeftRadius)
		if (!isStoryBranded()) await expect(myBubble(themed).paddingInlineStart).toBe('16px')
		if (!isStoryBranded()) await expect(myBubble(plain).paddingInlineStart).toBe('12px')
		if (!isStoryBranded()) await expect(list(themed).rowGap).toBe('12px')
		if (!isStoryBranded()) await expect(list(plain).rowGap).toBe('4px')
		await expect(classed).toHaveClass('base-chat', 'story-themed-chat')
		await expect(classed.querySelector('.base-chat-message-list')).toHaveClass('base-chat__list', 'story-themed-list')
		await expect(classed.querySelector('.base-chat-message-list__bubble')).toHaveClass('base-chat__bubble', 'story-themed-bubble')
	},
}
