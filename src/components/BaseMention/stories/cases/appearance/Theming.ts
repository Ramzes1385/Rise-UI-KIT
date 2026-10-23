import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMention.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMention from '../../../ui/BaseMention.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { control: 'story-themed-control', label: 'story-themed-label' }

const state = { plain: '', themed: '', classed: '' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; min-height: 320px;">
		<BaseMention v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-mention-bg: var(--rise-bg-muted); --rise-mention-border: var(--rise-primary-border); --rise-mention-border-focus: var(--rise-success); --rise-mention-radius: 16px; --rise-mention-popup-radius: 16px;">
			<BaseMention v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseMention v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-mention-*` кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Поле: `bg`, `text`, `border`, `border-focus`, `radius`, `padding-x`, `padding-y` — без них берутся общие токены полей',
					'`--rise-input-*` (рамка, фон, радиус), затем семантика. Попап: `popup-bg`, `popup-shadow`, `popup-radius`, пункты —',
					'`option-text`, `option-bg-hover` (наведение и пункт, выбранный стрелками). Проп `ui` добавляет классы к частям',
					'(`root`, `control`, `popup`, `option`… — см. `MENTION_PARTS`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMention'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseMention },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const plain = canvas.getByRole('textbox', { name: 'По умолчанию' })
		const themed = canvas.getByRole('textbox', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('textbox', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		await userEvent.type(themed, '@')
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		const popup = await waitFor(() => canvasElement.querySelector<HTMLElement>('.base-mention__popup')!)
		await expect(getComputedStyle(popup).borderTopLeftRadius).toBe('16px')
		await userEvent.keyboard('{Escape}')
		await expect(classed).toHaveClass('base-mention__control', 'story-themed-control')
		await expect(canvasElement.querySelectorAll('.base-mention__label')[2]).toHaveClass('story-themed-label')
	},
}
