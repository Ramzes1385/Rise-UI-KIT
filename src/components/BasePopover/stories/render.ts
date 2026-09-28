import BasePopover from '../ui/BasePopover.vue'
import { BaseText } from '@components/BaseText'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg('isOpen')
	return {
		components: { BasePopover, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: `
				<BasePopover v-bind="props" @update:is-open="onUpdate">
					<template #trigger>
						<BaseButton variant="outline">Автосохранение</BaseButton>
					</template>
					<BaseText>Изменения сохраняются каждые 30 секунд. История правок хранится 30 дней.</BaseText>
				</BasePopover>
			`,
	}
}) satisfies Meta<typeof BasePopover>['render']
