import type { Meta } from '@storybook/vue3-vite'
import type BaseMarkdown from '../ui/BaseMarkdown.vue'
import { MARKDOWN_VARIANTS } from '../types/BaseMarkdown.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MARKDOWN_VARIANTS }),
	source: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isStreaming: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	hasLineBreaks: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseMarkdown>['argTypes']
