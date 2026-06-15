/**
 * Integration-тесты для BaseEmpty.
 * Проверяют композицию с BaseIcon/BaseText, отображение слотов actions/default
 * и взаимодействие пользователя с кнопками действий через родителя.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { defineComponent, ref } from 'vue'

import BaseEmpty from '../ui/BaseEmpty.vue'

describe('BaseEmpty integration', () => {
	describe('слот actions', () => {
		it('должен вызывать сброс фильтров из слота actions', async () => {
			const user = userEvent.setup()

			const Host = defineComponent({
				components: { BaseEmpty },
				setup() {
					const query = ref('lamp')
					const reset = (): void => {
						query.value = ''
					}
					return { query, reset }
				},
				template: `
					<BaseEmpty title="Ничего не найдено" :description="query ? 'По запросу ' + query : 'Список пуст'">
						<template #actions>
							<button type="button" @click="reset">Сбросить</button>
						</template>
					</BaseEmpty>
					<span data-testid="query">{{ query }}</span>
				`,
			})

			render(Host)

			expect(screen.getByText('По запросу lamp')).toBeInTheDocument()

			await user.click(screen.getByRole('button', { name: 'Сбросить' }))

			expect(screen.getByTestId('query')).toBeEmptyDOMElement()
			expect(screen.getByText('Список пуст')).toBeInTheDocument()
		})

		it('не должен рендерить блок actions когда слот не передан', () => {
			const { container } = render(BaseEmpty, { props: { title: 'Пусто' } })

			expect(container.querySelector('.base-empty__actions')).toBeNull()
		})
	})

	describe('дефолтный слот', () => {
		it('должен отображать дополнительный контент в теле компонента', () => {
			const { container } = render(BaseEmpty, {
				props: { title: 'Пусто' },
				slots: { default: 'Дополнительный текст' },
			})

			expect(screen.getByText('Дополнительный текст')).toBeInTheDocument()
			expect(container.querySelector('.base-empty__body')).not.toBeNull()
		})
	})

	describe('слот icon', () => {
		it('должен заменять иконку по умолчанию содержимым слота icon', () => {
			render(BaseEmpty, {
				props: { title: 'Пусто' },
				slots: { icon: '<svg data-testid="custom-illustration"></svg>' },
			})

			expect(screen.getByTestId('custom-illustration')).toBeInTheDocument()
		})
	})
})
