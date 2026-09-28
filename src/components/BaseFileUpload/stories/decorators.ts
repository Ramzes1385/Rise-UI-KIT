import type { Meta } from '@storybook/vue3-vite'
import type BaseFileUpload from '../ui/BaseFileUpload.vue'

export const decorators = [
	(_, { parameters }) => ({ template: `<div style="width: 100%; max-width: ${parameters.maxWidth ?? 560}px;"><story /></div>` }),
] satisfies Meta<typeof BaseFileUpload>['decorators']
