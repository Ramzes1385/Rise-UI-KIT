import { ref } from 'vue'
import type meta from '../BaseCalendar.stories'
import BaseCalendar from '../../ui/BaseCalendar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CALENDAR_VARIANTS } from '../../types/BaseCalendar.types'
import { useArgsWithoutSlots, storyDate } from '@/stories/helpers'

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
			source: { code: CALENDAR_VARIANTS.map(variant => `<BaseCalendar v-model="date" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseCalendar },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'variant', 'onUpdate:modelValue']),
			variants: CALENDAR_VARIANTS,
			values: ref<Record<string, Date | null>>(Object.fromEntries(CALENDAR_VARIANTS.map(variant => [variant, storyDate(0, 0, 0)]))),
		}),
		template: `
			<div class="story-row">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseCalendar v-bind="props" v-model="values[variant]" :variant="variant" />
				</div>
			</div>
		`,
	}),
}
