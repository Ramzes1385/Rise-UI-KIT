import type { Meta } from '@storybook/vue3-vite'
import BaseScrollArea from '../ui/BaseScrollArea.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const events = Array.from(
	{ length: 30 },
	(_, index) =>
		`${String(9 + Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')} — отгрузка № ${1200 + index}`,
)

const template = `
	<BaseScrollArea v-bind="args" style="max-width: 360px; border: 1px solid var(--rise-border); border-radius: 8px">
		<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 8px">
			<li v-for="event in events" :key="event">{{ event }}</li>
		</ul>
	</BaseScrollArea>
`

export const source = storySource({ template, imports: ['BaseScrollArea'], script: `const events = ${literal(events)}` })

export const render = (args => ({
	components: { BaseScrollArea },
	setup: useStorySetup(args, { data: { events } }),
	template,
})) satisfies Meta<typeof BaseScrollArea>['render']
