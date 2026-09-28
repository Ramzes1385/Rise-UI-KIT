import { computed } from 'vue'
import { FILE_ACTIONS } from './shared'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import type { Meta } from '@storybook/vue3-vite'
import BaseDropdown from '../ui/BaseDropdown.vue'
import { BaseButton } from '@components/BaseButton'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg('isOpen')
	return {
		components: { BaseDropdown, BaseButton, BaseIcon, BaseMenu },
		setup: () => ({ props: useArgsWithoutSlots(args, []), isOpen: computed(() => args.isOpen), onUpdate, actions: FILE_ACTIONS }),
		template: `
				<BaseDropdown v-bind="props" @update:is-open="onUpdate">
					<BaseButton variant="outline" data-testid="trigger" @click="onUpdate(!isOpen)">
						Действия
						<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
					</BaseButton>
					<template #dropdown>
						<div data-testid="panel">
							<BaseMenu variant="ghost" :items="actions" @select="onUpdate(false)" />
						</div>
					</template>
				</BaseDropdown>
			`,
	}
}) satisfies Meta<typeof BaseDropdown>['render']
