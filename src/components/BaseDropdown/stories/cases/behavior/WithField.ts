import { ref, computed } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMenu } from '@components/BaseMenu'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import type { BaseMenuItem } from '@components/BaseMenu'
import { screen, expect, waitFor } from 'storybook/test'
import { literal, STORY_USERS, storySource, useStorySetup } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'onUpdate:isOpen']

const names = STORY_USERS.map(user => user.name)

const state = { isOpen: false }

const script = `
const names = ${literal(names)}
const query = ref('')
const people = computed<BaseMenuItem[][]>(() => [
	names.filter(name => name.toLowerCase().includes(query.value.toLowerCase())).map(name => ({ label: name })),
])
`

const template = `
	<BaseDropdown v-bind="args" v-model:is-open="isOpen">
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
`

export const WithField: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Поле ввода в панели: клик ставит фокус в поле, ввод фильтрует список. При закрытии (Escape, клик снаружи, выбор)',
					'фокус возвращается на триггер. Остальное содержимое панели фокус с триггера не уводит (`preventMousedown`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDropdown', 'BaseButton', 'BaseIcon', 'BaseInput', 'BaseMenu', 'type BaseMenuItem'],
				state,
				vue: ['computed'],
				script,
				omit: HIDDEN_ARGS,
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseInput, BaseMenu },
		setup: useStorySetup(args, {
			state,
			slots: HIDDEN_ARGS,
			setup: () => {
				const query = ref('')
				const people = computed<BaseMenuItem[][]>(() => [
					names.filter(name => name.toLowerCase().includes(query.value.toLowerCase())).map(name => ({ label: name })),
				])
				return { query, people }
			},
		}),
		template,
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
