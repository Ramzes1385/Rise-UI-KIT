import { ref, computed } from 'vue'
import type meta from '../BaseDropdown.stories'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import BaseDropdown from '../../ui/BaseDropdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseMenuItem } from '@components/BaseMenu'
import { screen, expect, waitFor } from 'storybook/test'
import { STORY_USERS, useArgsWithoutSlots } from '@/stories/helpers'

export const WithField: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Поле ввода в панели: клик ставит фокус в поле, ввод фильтрует список. При закрытии (Escape, клик снаружи, выбор)',
					'фокус возвращается на триггер. Остальное содержимое панели фокус с триггера не уводит (`preventMousedown`).',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseInput, BaseMenu },
		setup: () => {
			const isOpen = ref(false)
			const query = ref('')
			const people = computed<BaseMenuItem[][]>(() => [
				STORY_USERS.filter(user => user.name.toLowerCase().includes(query.value.toLowerCase())).map(user => ({ label: user.name })),
			])
			return { props: useArgsWithoutSlots(args, ['isOpen', 'onUpdate:isOpen']), isOpen, query, people }
		},
		template: `
			<BaseDropdown v-bind="props" v-model:is-open="isOpen">
				<BaseButton variant="outline" @click="isOpen = !isOpen">
					Автор
					<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
				</BaseButton>
				<template #dropdown>
					<div class="story-stack" style="gap: 4px; width: 240px;">
						<BaseInput v-model="query" label="Имя" placeholder="Начните вводить" />
						<BaseMenu variant="ghost" :items="people" @select="isOpen = false" />
					</div>
				</template>
			</BaseDropdown>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Автор' })
		await userEvent.click(trigger)
		const field = await screen.findByLabelText('Имя')

		await userEvent.click(field)
		await expect(field).toHaveFocus()
		await userEvent.keyboard('анна')
		await expect(field).toHaveValue('анна')
		await expect(screen.getByText('Анна Смирнова')).toBeInTheDocument()
		await expect(screen.queryByText('Иван Петров')).not.toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByLabelText('Имя')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
