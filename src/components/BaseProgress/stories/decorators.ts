import type { Meta } from '@storybook/vue3-vite'
import type BaseProgress from '../ui/BaseProgress.vue'

export const decorators = [() => ({ template: '<div class="story-medium"><story /></div>' })] satisfies Meta<
	typeof BaseProgress
>['decorators']
