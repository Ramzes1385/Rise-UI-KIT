import BaseConfirm from '../ui/BaseConfirm.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Опубликовать серию</BaseButton>
	<BaseConfirm v-bind="args" v-model:is-open="isOpen" />
`

export const source = storySource({ template, imports: ['BaseConfirm', 'BaseButton'], models })

export const render = (args => ({
	components: { BaseConfirm, BaseButton },
	setup: useStorySetup(args, { models, slots: ['default'] }),
	template,
})) satisfies Meta<typeof BaseConfirm>['render']
