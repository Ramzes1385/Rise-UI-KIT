import { expect } from 'storybook/test'
import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const state = {
	plain: '<p>По умолчанию: рамка, фон и тулбар варианта.</p>',
	themed: '<p>Токены на контейнере: фон, рамка, радиус, тулбар и отступы текста.</p>',
	classed: '<p>Классы через <code>ui</code>: свои классы корня, тулбара и области текста.</p>',
}

const ui = { root: 'story-themed-editor', toolbar: 'story-themed-toolbar', content: 'story-themed-content' }

const SERVICE_ARGS = ['toolbar', 'modelValue', 'variant', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<BaseEditor v-bind="args" v-model="plain" style="--editor-min-height: 72px" />
		<div style="--rise-editor-bg: var(--rise-bg-muted); --rise-editor-border: var(--rise-primary); --rise-editor-radius: var(--rise-radius-xl); --rise-editor-toolbar-bg: var(--rise-bg-elevated); --rise-editor-content-padding-x: 24px;">
			<BaseEditor v-bind="args" v-model="themed" style="--editor-min-height: 72px" />
		</div>
		<BaseEditor v-bind="args" v-model="classed" :ui="ui" style="--editor-min-height: 72px" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale', 'hasToolbar', 'isReadonly'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-editor-*` кит только читает: `bg`, `text`, `border`, `radius`, `shadow` — рамка',
					'и фон (`bg` — у вариантов `default` и `shadow`, `shadow` — у `default` и `shadow`), `border-focus` — рамка и кольцо в фокусе;',
					'`toolbar-bg`, `toolbar-border`, `toolbar-padding-x`, `toolbar-padding-y` — панель инструментов;',
					'`content-padding-x`, `content-padding-y` — отступы области текста и поля HTML-кода.',
					'Задайте их на `:root`, в теме или на контейнере, как здесь. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `frame`, `toolbar`, `group`, `btn`, `content`, `code`, `context-menu`, `label`, `error-text`);',
					'глобально — `defaults.BaseEditor.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], state, script: `const ui = ${literal(ui)}`, omit: SERVICE_ARGS }),
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { state, data: { ui }, slots: SERVICE_ARGS }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-editor')]
		const toolbar = (root: HTMLElement) => root.querySelector('.base-editor__toolbar') as HTMLElement
		const content = (root: HTMLElement) => root.querySelector('.base-editor__content') as HTMLElement
		const frame = (root: HTMLElement) => root.querySelector('.base-editor__frame') as HTMLElement

		await expect(getComputedStyle(frame(themed)).backgroundColor).not.toBe(getComputedStyle(frame(plain)).backgroundColor)
		await expect(getComputedStyle(frame(themed)).borderTopColor).not.toBe(getComputedStyle(frame(plain)).borderTopColor)
		await expect(getComputedStyle(toolbar(themed)).backgroundColor).not.toBe(getComputedStyle(toolbar(plain)).backgroundColor)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(content(themed)).paddingInlineStart).toBe('24px')
			await expect(getComputedStyle(content(plain)).paddingInlineStart).toBe('16px')
		}
		await expect(classed).toHaveClass('base-editor', 'story-themed-editor')
		await expect(toolbar(classed)).toHaveClass('base-editor__toolbar', 'story-themed-toolbar')
		await expect(content(classed)).toHaveClass('base-editor__content', 'story-themed-content')
	},
}
