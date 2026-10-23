import BaseTree from '../ui/BaseTree.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { expandedIds: 'expandedIds', selectedIds: 'selectedIds' }

const template = `
	<div class="story-narrow"><BaseTree v-bind="args" v-model:expanded-ids="expandedIds" v-model:selected-ids="selectedIds" /></div>
`

export const source = storySource({ template, imports: ['BaseTree'], models })

export const render = (args => ({
	components: { BaseTree },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseTree>['render']
