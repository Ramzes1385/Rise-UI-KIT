import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseNotificationCenter.stories'
import { SAMPLE_NOTIFICATIONS } from '../sampleNotifications'
import BaseNotificationCenter from '../../ui/BaseNotificationCenter.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => [75, 100, 125].includes(preset.sizeScale)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const items = SAMPLE_NOTIFICATIONS.slice(0, 2)

const template = `
	<div class="story-row" style="align-items: flex-start">
		<div v-for="preset in presets" :key="preset.name" style="width: 380px">
			<BaseNotificationCenter v-bind="args" :items="items" :size-scale="preset.sizeScale" :title="preset.label" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 100 / 125% — шрифты, отступы, аватары и кнопки.' },
			source: storySource({
				template,
				imports: ['BaseNotificationCenter', 'type NotificationCenterItem'],
				script: `const presets = ${literal(presets)}\nconst items: NotificationCenterItem[] = ${literal(items)}`,
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseNotificationCenter },
		setup: useStorySetup(args, { data: { presets, items } }),
		template,
	}),
}
