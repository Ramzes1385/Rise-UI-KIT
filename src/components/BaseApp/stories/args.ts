import type BaseApp from '../ui/BaseApp.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	toaster: { position: 'top-right', duration: 3000, max: 5, variant: 'default', sizeScale: 100 },
} satisfies Meta<typeof BaseApp>['args']
