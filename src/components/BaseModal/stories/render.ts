import { computed } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import { BaseText } from '@components/BaseText'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg('isOpen')
	return {
		components: { BaseModal, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args), text: computed(() => args.default), onUpdate }),
		template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Открыть окно</BaseButton>
				<BaseModal v-bind="props" @update:is-open="onUpdate">
					<BaseText>{{ text }}</BaseText>
					<template #footer>
						<BaseButton variant="outline" @click="onUpdate(false)">Отмена</BaseButton>
						<BaseButton @click="onUpdate(false)">Удалить</BaseButton>
					</template>
				</BaseModal>
			`,
	}
}) satisfies Meta<typeof BaseModal>['render']
