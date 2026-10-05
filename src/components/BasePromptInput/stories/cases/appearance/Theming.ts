import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePromptInput.stories'
import BasePromptInput from '../../../ui/BasePromptInput.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { box: 'story-themed-box', button: 'story-themed-button' }

const state = { plain: 'Вопрос', themed: 'Вопрос', classed: 'Вопрос' }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<BasePromptInput v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-prompt-input-bg: var(--rise-bg-muted); --rise-prompt-input-border: var(--rise-primary-border); --rise-prompt-input-radius: 20px; --rise-prompt-input-button-radius: 8px; --rise-prompt-input-toolbar-gap: 12px;">
			<BasePromptInput v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BasePromptInput v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'isGenerating', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-prompt-input-*` кит только читает: `bg`, `border`, `border-focus`, `radius` (рамка',
					'поля), `text`, `gap`, `control-font-size` (кегль поля), `toolbar-gap`, `button-radius`, `button-icon-size` — задайте их',
					'на `:root`, в теме или на контейнере, как здесь. Без них рамка берёт общие токены полей `--rise-input-*`, затем семантику.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `box`, `control`, `toolbar`, `button`…);',
					'глобально — `defaults.BasePromptInput.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BasePromptInput'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BasePromptInput },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const box = (name: string) => canvas.getByRole('textbox', { name }).closest('.base-prompt-input__box') as HTMLElement
		const button = (name: string) => box(name).querySelector('.base-prompt-input__button') as HTMLElement
		const plain = box('По умолчанию')
		const themed = box('Токены на контейнере')
		const classed = box('Классы через ui')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		await expect(classed).toHaveClass('base-prompt-input__box', 'story-themed-box')
		await expect(button('Классы через ui')).toHaveClass('base-prompt-input__button', 'story-themed-button')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('20px')
			await expect(getComputedStyle(button('Токены на контейнере')).borderTopLeftRadius).toBe('8px')
		}
	},
}
