import BaseApp from '../../ui/BaseApp.vue'
import type meta from '../BaseApp.stories'
import { defineComponent, ref } from 'vue'
import { BaseText } from '@components/BaseText'
import { BaseInput } from '@components/BaseInput'
import { BaseModal } from '@components/BaseModal'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useOverlay } from '@composables/overlay/useOverlay'
import { screen, within, expect, waitFor } from 'storybook/test'

const RenameProjectModal = defineComponent({
	components: { BaseModal, BaseInput, BaseButton },
	props: { isOpen: { type: Boolean, default: false }, name: { type: String, required: true } },
	emits: ['close', 'after-leave'],
	setup(props, { emit }) {
		const value = ref(props.name)
		return { value, save: () => emit('close', value.value.trim()), cancel: () => emit('close') }
	},
	template: `
		<BaseModal :is-open="isOpen" title="Переименовать проект" @close="cancel" @after-leave="$emit('after-leave')">
			<BaseInput v-model="value" label="Название" />
			<template #footer>
				<BaseButton variant="outline" @click="cancel">Отмена</BaseButton>
				<BaseButton :disabled="!value.trim()" @click="save">Сохранить</BaseButton>
			</template>
		</BaseModal>
	`,
})

const ProjectHeader = defineComponent({
	components: { BaseButton, BaseText },
	setup() {
		const overlay = useOverlay()
		const rename = overlay.create<string>(RenameProjectModal)
		const name = ref('Сайт студии')
		async function open() {
			const result = await rename.open({ name: name.value })
			if (result) name.value = result
		}
		return { name, open }
	},
	template: `
		<div class="story-row">
			<BaseText tag="h3">{{ name }}</BaseText>
			<BaseButton variant="outline" @click="open">Переименовать</BaseButton>
		</div>
	`,
})

export const OverlayFromCode: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Окно из кода: `useOverlay().create(Component)` и `await open(props)`. Компонент получает props и `isOpen`,',
					"результат передаёт в `emit('close', value)`. Шаблон окна и флаг открытия в родителе не нужны.",
				].join('\n'),
			},
			source: {
				code: [
					'const overlay = useOverlay()',
					'const rename = overlay.create(RenameProjectModal)',
					'',
					'async function open() {',
					'\tconst result = await rename.open({ name: project.name })',
					'\tif (result) project.name = result',
					'}',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { BaseApp, ProjectHeader },
		template: '<BaseApp><ProjectHeader /></BaseApp>',
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Переименовать' })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('dialog', { name: 'Переименовать проект' })
		const input = within(dialog).getByLabelText('Название')
		await expect(input).toHaveValue('Сайт студии')

		await userEvent.clear(input)
		await userEvent.type(input, 'Сайт студии 2.0')
		await userEvent.click(within(dialog).getByRole('button', { name: 'Сохранить' }))

		await expect(await canvas.findByRole('heading', { name: 'Сайт студии 2.0' })).toBeInTheDocument()
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
