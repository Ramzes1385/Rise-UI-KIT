import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'
import { EVENT_CALENDAR_VARIANTS } from '../../../types/BaseEventCalendar.types'

const template = `<div class="story-stack"><BaseEventCalendar v-for="variant in EVENT_CALENDAR_VARIANTS" :key="variant" v-bind="args" :variant="variant" :aria-label="'Календарь событий: ' + variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseEventCalendar', 'EVENT_CALENDAR_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { data: { EVENT_CALENDAR_VARIANTS } }),
		template,
	}),
}
