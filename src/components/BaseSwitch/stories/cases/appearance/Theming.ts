import { expect } from 'storybook/test'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { slider: 'story-themed-slider', handle: 'story-themed-handle' }

const state = { plain: true, themed: true, classed: true }

const OWN_ARGS = ['modelValue', 'label', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<BaseSwitch v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-switch-slider-bg-checked: var(--rise-success); --rise-switch-handle-shadow: var(--rise-shadow-md); --rise-switch-label-text: var(--rise-text-muted); --rise-switch-row-gap: 12px;">
			<BaseSwitch v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseSwitch v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'reverse'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-switch-*` (дорожка: фон, фон включённой, тень, кольцо фокуса; бегунок: фон, фон',
					'во включённом, тень; цвет подписи и описания, зазор строки) кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `row`, `slider`, `handle`, `label`,',
					'`description`… — см. `SWITCH_PARTS`); глобально — `defaults.BaseSwitch.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSwitch'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup: useStorySetup(args, { state, data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-switch')]
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-switch__${name}`)!

		await expect(getComputedStyle(part(themed!, 'slider')).backgroundColor).not.toBe(
			getComputedStyle(part(plain!, 'slider')).backgroundColor,
		)
		await expect(getComputedStyle(part(themed!, 'handle')).boxShadow).not.toBe(getComputedStyle(part(plain!, 'handle')).boxShadow)
		await expect(getComputedStyle(part(themed!, 'row')).columnGap).toBe('12px')
		await expect(getComputedStyle(part(plain!, 'row')).columnGap).toBe('8px')
		await expect(part(classed!, 'slider')).toHaveClass('base-switch__slider', 'story-themed-slider')
		await expect(part(classed!, 'handle')).toHaveClass('base-switch__handle', 'story-themed-handle')
	},
}
