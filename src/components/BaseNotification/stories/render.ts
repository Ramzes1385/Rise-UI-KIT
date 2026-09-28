import { computed } from 'vue'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseNotification from '../ui/BaseNotification.vue'

export const render = (args => ({
	components: { BaseNotification },
	setup: () => {
		const props = useArgsWithoutSlots(args, [])
		const key = computed(() => JSON.stringify(Object.entries(args).filter(([, value]) => typeof value !== 'function')))
		return { props, key }
	},
	template: '<BaseNotification :key="key" v-bind="props" />',
})) satisfies Meta<typeof BaseNotification>['render']
