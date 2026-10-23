import type { Meta } from '@storybook/vue3-vite'
import type BaseSkeleton from '../ui/BaseSkeleton.vue'

export const decorators = [() => ({ template: '<div class="story-medium"><story /></div>' })] satisfies Meta<
	typeof BaseSkeleton
>['decorators']
