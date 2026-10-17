import { expect } from 'storybook/test'
import type meta from '../../BaseAiMessage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAiMessage from '../../../ui/BaseAiMessage.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-message', body: 'story-themed-body', name: 'story-themed-name' }

const template = `
	<div class="story-stack">
		<BaseAiMessage v-bind="args" variant="soft" content="По умолчанию" />
		<div style="--rise-ai-message-body-bg: var(--rise-primary-soft); --rise-ai-message-body-padding-x: 20px; --rise-ai-message-avatar-radius: var(--rise-radius-full); --rise-ai-message-name-text: var(--rise-primary-text); --rise-ai-message-name-font-weight: var(--rise-font-weight-bold);">
			<BaseAiMessage v-bind="args" variant="soft" content="Токены на контейнере" />
		</div>
		<BaseAiMessage v-bind="args" variant="soft" content="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-ai-message-*` кит только читает: `gap`, `text`, `font-size`, `avatar-bg`,',
					'`avatar-radius`, `name-text`, `name-font-weight`, `body-bg` (пузырь `soft`), `body-border` (рамка `outline`), `body-radius`,',
					'`body-padding-x`, `body-padding-y` — задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Список — docs/design/COMPONENT_TOKENS.md. Отступы пузыря учитывают плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root`, `avatar`, `body`, `header`, `name`, `time`, `content`, `error`, `actions`);',
					'глобально — `defaults.BaseAiMessage.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAiMessage'],
				script: `const ui = ${literal(ui)}`,
				omit: ['content', 'variant', 'default', 'actions'],
			}),
		},
	},
	render: args => ({
		components: { BaseAiMessage },
		setup: useStorySetup(args, { data: { ui }, slots: ['default', 'actions'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const message = (text: string) => canvas.getByText(text).closest('.base-ai-message') as HTMLElement
		const plain = message('По умолчанию')
		const themed = message('Токены на контейнере')
		const classed = message('Классы через ui')
		const body = (element: HTMLElement) => element.querySelector('.base-ai-message__body') as HTMLElement
		const avatar = (element: HTMLElement) => element.querySelector('.base-ai-message__avatar') as HTMLElement
		const name = (element: HTMLElement) => element.querySelector('.base-ai-message__name') as HTMLElement

		await expect(getComputedStyle(body(themed)).backgroundColor).not.toBe(getComputedStyle(body(plain)).backgroundColor)
		await expect(getComputedStyle(name(themed)).color).not.toBe(getComputedStyle(name(plain)).color)
		await expect(getComputedStyle(avatar(themed)).borderTopLeftRadius).toBe('9999px')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(body(themed)).paddingInlineStart).toBe('20px')
			await expect(getComputedStyle(body(plain)).paddingInlineStart).toBe('16px')
			await expect(getComputedStyle(name(themed)).fontWeight).toBe('700')
		}
		await expect(classed).toHaveClass('base-ai-message', 'story-themed-message')
		await expect(body(classed)).toHaveClass('base-ai-message__body', 'story-themed-body')
		await expect(name(classed)).toHaveClass('base-ai-message__name', 'story-themed-name')
	},
}
