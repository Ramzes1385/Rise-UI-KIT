import { computed } from 'vue'
import { docsFrame } from '../shared'
import type meta from '../BaseDropdown.stories'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import BaseDropdown from '../../ui/BaseDropdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { waitFor, expect, screen } from 'storybook/test'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const Empty: StoryObj<typeof meta> = {
	args: { isOpen: true },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: { ...docsFrame(160), description: { story: 'Пустая панель: вместо пунктов — короткое пояснение приглушённым текстом.' } },
	},
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseDropdown, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args, []), isOpen: computed(() => args.isOpen), onUpdate }),
			template: `
				<BaseDropdown v-bind="props" @update:is-open="onUpdate">
					<BaseButton variant="outline" @click="onUpdate(!isOpen)">Недавние</BaseButton>
					<template #dropdown>
						<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }" style="padding: 6px 8px;">
							Вы ещё не открывали проекты
						</BaseText>
					</template>
				</BaseDropdown>
			`,
		}
	},
	play: async () => {
		await waitFor(() => expect(screen.getByText('Вы ещё не открывали проекты')).toBeVisible())
	},
}
