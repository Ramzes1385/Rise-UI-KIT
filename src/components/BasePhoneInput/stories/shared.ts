import BasePhoneInput from '../ui/BasePhoneInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const PHONE_MODELS = { phone: 'modelValue', country: 'country' } as const

const PHONE_TEMPLATE = `
	<div style="max-width: 360px">
		<BasePhoneInput v-bind="args" v-model="phone" v-model:country="country" />
	</div>
`

export const PHONE_SOURCE = storySource({ template: PHONE_TEMPLATE, imports: ['BasePhoneInput'], models: PHONE_MODELS })

export const renderPhone = (args: Record<string, unknown>) => ({
	components: { BasePhoneInput },
	setup: useStorySetup(args, { models: PHONE_MODELS }),
	template: PHONE_TEMPLATE,
})
