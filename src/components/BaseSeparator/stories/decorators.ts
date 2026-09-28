import type { Meta } from '@storybook/vue3-vite'
import type BaseSeparator from '../ui/BaseSeparator.vue'

export const decorators = [() => ({ template: '<div class="story-medium"><story /></div>' })] satisfies Meta<
	typeof BaseSeparator
>['decorators']
