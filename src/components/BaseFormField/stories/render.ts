import { ref } from 'vue'
import { BasePin } from '@components/BasePin'
import type { Meta } from '@storybook/vue3-vite'
import BaseFormField from '../ui/BaseFormField.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseFormField, BasePin },
	setup: () => ({ props: useArgsWithoutSlots(args), code: ref('') }),
	template: `
			<div class="story-narrow">
				<BaseFormField v-bind="props">
					<BasePin v-model="code" />
				</BaseFormField>
			</div>
		`,
})) satisfies Meta<typeof BaseFormField>['render']
