import type { Meta } from '@storybook/vue3-vite'
import type BaseLayout from '../ui/BaseLayout.vue'

export const args = {
	hasSkipLink: true,
	isHeaderSticky: true,
	isSidebarVisibleOnMobile: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseLayout>['args']
