import type { Meta } from '@storybook/vue3-vite'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import { FRAME_STYLE, SLOT_KEYS } from './shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const frameStyle = FRAME_STYLE

const models = { openKey: 'openKey' }

const template = `
	<div :style="frameStyle">
		<BaseMegaMenu v-bind="args" v-model:open-key="openKey" />
	</div>
`

export const source = storySource({
	template,
	imports: ['BaseMegaMenu'],
	models,
	script: `const frameStyle = ${literal(frameStyle)}`,
	omit: SLOT_KEYS,
})

export const render = (args => ({
	components: { BaseMegaMenu },
	setup: useStorySetup(args, { models, data: { frameStyle }, slots: SLOT_KEYS }),
	template,
})) satisfies Meta<typeof BaseMegaMenu>['render']
