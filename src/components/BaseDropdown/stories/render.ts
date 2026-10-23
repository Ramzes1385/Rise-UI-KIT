import { FILE_ACTIONS } from './shared'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import type { Meta } from '@storybook/vue3-vite'
import BaseDropdown from '../ui/BaseDropdown.vue'
import { BaseButton } from '@components/BaseButton'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const actions = FILE_ACTIONS

const models = { isOpen: 'isOpen' }

const template = `
	<BaseDropdown v-bind="args" v-model:is-open="isOpen">
		<BaseButton variant="outline" data-testid="trigger" @click="isOpen = !isOpen">
			Действия
			<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
		</BaseButton>
		<template #dropdown>
			<div data-testid="panel">
				<BaseMenu variant="ghost" :items="actions" @select="isOpen = false" />
			</div>
		</template>
	</BaseDropdown>
`

export const source = storySource({
	template,
	imports: ['BaseDropdown', 'BaseButton', 'BaseIcon', 'BaseMenu'],
	models,
	script: `const actions = ${literal(actions)}`,
})

export const render = (args => ({
	components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu },
	setup: useStorySetup(args, { models, data: { actions }, slots: [] }),
	template,
})) satisfies Meta<typeof BaseDropdown>['render']
