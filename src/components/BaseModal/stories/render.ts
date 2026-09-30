import BaseModal from '../ui/BaseModal.vue'
import { BaseText } from '@components/BaseText'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Открыть окно</BaseButton>
	<BaseModal v-bind="args" v-model:is-open="isOpen">
		<BaseText>{{ slots.default }}</BaseText>
		<template #footer>
			<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
			<BaseButton @click="isOpen = false">Удалить</BaseButton>
		</template>
	</BaseModal>
`

export const source = storySource({ template, imports: ['BaseModal', 'BaseButton', 'BaseText'], models })

export const render = (args => ({
	components: { BaseModal, BaseButton, BaseText },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<typeof BaseModal>['render']
