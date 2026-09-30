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
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const renameModalTemplate = `
	<BaseModal :is-open="isOpen" title="Переименовать проект" @close="cancel" @after-leave="$emit('after-leave')">
		<BaseInput v-model="value" label="Название" />
		<template #footer>
			<BaseButton variant="outline" @click="cancel">Отмена</BaseButton>
			<BaseButton :disabled="!value.trim()" @click="save">Сохранить</BaseButton>
		</template>
	</BaseModal>
`

const renameModalScript = `
const props = defineProps<{ isOpen?: boolean; name: string }>()
const emit = defineEmits<{ close: [result?: string]; 'after-leave': [] }>()
const value = ref(props.name)

function save(): void {
	emit('close', value.value.trim())
}

function cancel(): void {
	emit('close')
}
`

const RenameProjectModal = defineComponent({
	components: { BaseModal, BaseInput, BaseButton },
	props: { isOpen: { type: Boolean, default: false }, name: { type: String, required: true } },
	emits: ['close', 'after-leave'],
	setup(props, { emit }) {
		const value = ref(props.name)
		const save = (): void => emit('close', value.value.trim())
		const cancel = (): void => emit('close')
		return { value, save, cancel }
	},
	template: renameModalTemplate,
})

const projectHeaderTemplate = `
	<div class="story-row">
		<BaseText tag="h3">{{ name }}</BaseText>
		<BaseButton variant="outline" @click="open">Переименовать</BaseButton>
	</div>
`

const projectHeaderScript = `
const overlay = useOverlay()
const rename = overlay.create<string>(RenameProjectModal)
const name = ref('Сайт студии')

async function open(): Promise<void> {
	const result = await rename.open({ name: name.value })
	if (result) name.value = result
}
`

const ProjectHeader = defineComponent({
	components: { BaseButton, BaseText },
	setup() {
		const overlay = useOverlay()
		const rename = overlay.create<string>(RenameProjectModal)
		const name = ref('Сайт студии')
		const open = async (): Promise<void> => {
			const result = await rename.open({ name: name.value })
			if (result) name.value = result
		}
		return { name, open }
	},
	template: projectHeaderTemplate,
})

const template = `
	<BaseApp><ProjectHeader /></BaseApp>
`

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
			source: staticStorySource({
				template,
				imports: ['BaseApp'],
				components: {
					ProjectHeader: {
						template: projectHeaderTemplate,
						imports: ['BaseButton', 'BaseText', 'useOverlay'],
						vue: ['ref'],
						script: projectHeaderScript,
						components: {
							RenameProjectModal: {
								template: renameModalTemplate,
								imports: ['BaseModal', 'BaseInput', 'BaseButton'],
								vue: ['ref'],
								script: renameModalScript,
							},
						},
					},
				},
			}),
		},
	},
	render: args => ({
		components: { BaseApp, ProjectHeader },
		setup: useStorySetup(args),
		template,
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
