import { BasePin } from '@components/BasePin'
import type { Meta } from '@storybook/vue3-vite'
import BaseFormField from '../ui/BaseFormField.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { code: '' }

const template = `
	<div class="story-narrow">
		<BaseFormField v-bind="args">
			<BasePin v-model="code" />
		</BaseFormField>
	</div>
`

export const source = storySource({ template, imports: ['BaseFormField', 'BasePin'], state })

export const render = (args => ({
	components: { BaseFormField, BasePin },
	setup: useStorySetup(args, { state }),
	template,
})) satisfies Meta<typeof BaseFormField>['render']
