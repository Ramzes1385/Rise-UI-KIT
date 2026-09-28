import type { Meta } from '@storybook/vue3-vite'
import BaseScrollArea from '../ui/BaseScrollArea.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

const EVENTS = Array.from(
	{ length: 30 },
	(_, index) =>
		`${String(9 + Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')} — отгрузка № ${1200 + index}`,
)

export const render = (args => ({
	components: { BaseScrollArea },
	setup: () => ({ props: useArgsWithoutSlots(args), events: EVENTS }),
	template: `
			<BaseScrollArea v-bind="props" style="max-width: 360px; border: 1px solid var(--rise-border); border-radius: 8px">
				<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 8px">
					<li v-for="event in events" :key="event">{{ event }}</li>
				</ul>
			</BaseScrollArea>
		`,
})) satisfies Meta<typeof BaseScrollArea>['render']
