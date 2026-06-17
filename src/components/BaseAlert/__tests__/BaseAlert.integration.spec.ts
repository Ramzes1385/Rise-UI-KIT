/**
 * Integration-тесты для BaseAlert.
 * Проверяют композицию с BaseButton/BaseIcon/BaseText, проброс события close
 * сквозь родителя и взаимодействие со слотом actions.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { defineComponent, ref } from 'vue'
import BaseAlert from '../ui/BaseAlert.vue'

describe('BaseAlert integration', () => {
	describe('закрытие через родителя', () => {
		it('должен скрывать оповещение при клике на кнопку закрытия', async () => {
			const user = userEvent.setup()

			const Host = defineComponent({
				components: { BaseAlert },
				setup() {
					const isVisible = ref(true)
					return { isVisible }
				},
				template: `
					<BaseAlert
						v-if="isVisible"
						title="Внимание"
						is-closable
						@close="isVisible = false"
					/>
					<span data-testid="state">{{ isVisible ? 'visible' : 'hidden' }}</span>
				`,
			})

			render(Host)

			expect(screen.getByText('Внимание')).toBeInTheDocument()
			expect(screen.getByTestId('state')).toHaveTextContent('visible')

			await user.click(screen.getByRole('button'))

			expect(screen.queryByText('Внимание')).not.toBeInTheDocument()
			expect(screen.getByTestId('state')).toHaveTextContent('hidden')
		})

		it('не должен рендерить кнопку закрытия когда isClosable=false', () => {
			render(BaseAlert, { props: { title: 'Без закрытия' } })

			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})
	})

	describe('слот actions', () => {
		it('должен вызывать обработчик действия из слота независимо от close', async () => {
			const user = userEvent.setup()

			const Host = defineComponent({
				components: { BaseAlert },
				setup() {
					const retries = ref(0)
					const isVisible = ref(true)
					return { retries, isVisible }
				},
				template: `
					<BaseAlert
						v-if="isVisible"
						title="Ошибка загрузки"
						is-closable
						@close="isVisible = false"
					>
						<template #actions>
							<button type="button" @click="retries++">Повторить</button>
						</template>
					</BaseAlert>
					<span data-testid="retries">{{ retries }}</span>
				`,
			})

			render(Host)

			await user.click(screen.getByRole('button', { name: 'Повторить' }))
			await user.click(screen.getByRole('button', { name: 'Повторить' }))

			expect(screen.getByTestId('retries')).toHaveTextContent('2')
			expect(screen.getByText('Ошибка загрузки')).toBeInTheDocument()
		})
	})

	describe('содержимое через дефолтный слот', () => {
		it('должен отображать содержимое слота вместо props.description', () => {
			render(BaseAlert, {
				props: { title: 'Заголовок', description: 'Текст из пропа' },
				slots: { default: 'Текст из слота' },
			})

			expect(screen.getByText('Текст из слота')).toBeInTheDocument()
			expect(screen.queryByText('Текст из пропа')).not.toBeInTheDocument()
		})
	})

	describe('доступность', () => {
		it('должен иметь role="alert" для озвучивания скринридером', () => {
			render(BaseAlert, { props: { title: 'Сообщение' } })

			expect(screen.getByRole('alert')).toBeInTheDocument()
		})
	})
})
