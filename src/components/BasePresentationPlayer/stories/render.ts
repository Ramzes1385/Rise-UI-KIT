import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'

const template = `
	<BasePresentationPlayer v-bind="args" v-model:slide="current" />
`

export const PRESENTATION_IMPORTS = { '@ramzes1385/rise-ui-kit/media': ['BasePresentationPlayer'] }

export const source = storySource({ template, imports: [], importsFrom: PRESENTATION_IMPORTS, models: { current: 'slide' } })

export const render = (args => ({
	components: { BasePresentationPlayer },
	setup: useStorySetup(args, { models: { current: 'slide' } }),
	template,
})) satisfies Meta<typeof BasePresentationPlayer>['render']
