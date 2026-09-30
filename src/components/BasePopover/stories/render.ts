import BasePopover from '../ui/BasePopover.vue'
import { BaseText } from '@components/BaseText'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BasePopover v-bind="args" v-model:is-open="isOpen">
		<template #trigger>
			<BaseButton variant="outline">Автосохранение</BaseButton>
		</template>
		<BaseText>Изменения сохраняются каждые 30 секунд. История правок хранится 30 дней.</BaseText>
	</BasePopover>
`

export const source = storySource({ template, imports: ['BasePopover', 'BaseButton', 'BaseText'], models })

export const render = (args => ({
	components: { BasePopover, BaseButton, BaseText },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BasePopover>['render']
