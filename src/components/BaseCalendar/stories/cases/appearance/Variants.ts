import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCalendar from '../../../ui/BaseCalendar.vue'
import { CALENDAR_VARIANTS } from '../../../types/BaseCalendar.types'
import { literal, storyDate, storySource, useStorySetup } from '@/stories/helpers'

const variants = CALENDAR_VARIANTS

const state = { values: Object.fromEntries(CALENDAR_VARIANTS.map(variant => [variant, storyDate(0, 0, 0)])) }

const template = `
	<div class="story-row">
		<div v-for="variant in variants" :key="variant" class="story-col">
			<span class="story-label">{{ variant }}</span>
			<BaseCalendar v-bind="args" v-model="values[variant]" :variant="variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'selectionMode'] },
		docs: {
			description: {
				story: [
					'Пять вариантов поверхности: `default` — рамка; `outline` — рамка заметнее; `soft` — мягкий фон без рамки;',
					'`ghost` — без фона и рамки (календарь внутри карточки или панели); `shadow` — рамка и тень.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCalendar'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, Date | null>' },
				omit: ['modelValue', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseCalendar },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['modelValue', 'variant', 'onUpdate:modelValue'] }),
		template,
	}),
}
