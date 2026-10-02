import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import userEvent from '@testing-library/user-event'
import { BaseDropdown } from '@components/BaseDropdown'
import { render, screen, waitFor } from '@testing-library/vue'

function renderBlockingModalOverDropdown(closeOnEscape: boolean) {
	const onDropdownClose = vi.fn()
	const onModalClose = vi.fn()
	const Host = defineComponent({
		components: { BaseModal, BaseDropdown },
		setup() {
			const isDropdownOpen = ref(true)
			const isModalOpen = ref(false)
			return { isDropdownOpen, isModalOpen, closeOnEscape, onDropdownClose, onModalClose }
		},
		template: `
			<BaseDropdown v-model:is-open="isDropdownOpen" :prevent-mousedown="false" @close="onDropdownClose">
				<button type="button">Меню</button>
				<template #dropdown>
					<button type="button" @click="isModalOpen = true">Удалить проект</button>
				</template>
			</BaseDropdown>
			<BaseModal v-model:is-open="isModalOpen" title="Удаление" :close-on-escape="closeOnEscape" @close="onModalClose">
				<template #footer><button type="button" @click="isModalOpen = false">Понятно</button></template>
			</BaseModal>
		`,
	})
	return { ...render(Host), onDropdownClose, onModalClose }
}

describe('BaseModal: closeOnEscape (APG Dialog)', () => {
	it('closeOnEscape=false: Escape не закрывает окно и не закрывает меню под ним', async () => {
		const user = userEvent.setup()
		const { onDropdownClose, onModalClose } = renderBlockingModalOverDropdown(false)
		await user.click(screen.getByRole('button', { name: 'Удалить проект' }))
		const dialog = await screen.findByRole('dialog', { name: 'Удаление' })
		await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))

		await user.keyboard('{Escape}')

		expect(screen.getByRole('dialog', { name: 'Удаление' })).toBeInTheDocument()
		expect(onModalClose).not.toHaveBeenCalled()
		expect(onDropdownClose).not.toHaveBeenCalled()
		expect(dialog).toContainElement(document.activeElement as HTMLElement)
	})

	it('closeOnEscape=false: окно закрывает своя кнопка, после этого Escape снова закрывает меню', async () => {
		const user = userEvent.setup()
		const { onDropdownClose } = renderBlockingModalOverDropdown(false)
		await user.click(screen.getByRole('button', { name: 'Удалить проект' }))
		await user.click(await screen.findByRole('button', { name: 'Понятно' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

		await user.keyboard('{Escape}')

		expect(onDropdownClose).toHaveBeenCalledOnce()
	})

	it('closeOnEscape=true (по умолчанию): первое Escape закрывает окно, меню остаётся открытым', async () => {
		const user = userEvent.setup()
		const { onDropdownClose, onModalClose } = renderBlockingModalOverDropdown(true)
		await user.click(screen.getByRole('button', { name: 'Удалить проект' }))
		await screen.findByRole('dialog', { name: 'Удаление' })

		await user.keyboard('{Escape}')

		expect(onModalClose).toHaveBeenCalledOnce()
		expect(onDropdownClose).not.toHaveBeenCalled()
	})

	it('событие confirm не объявлено и не эмитится', () => {
		const { emitted } = render(BaseModal, { props: { isOpen: true, title: 'Окно' } })

		expect(emitted()).not.toHaveProperty('confirm')
	})
})
