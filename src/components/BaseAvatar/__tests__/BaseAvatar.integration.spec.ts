/**
 * Integration-тесты для BaseAvatar.
 * Проверяют взаимодействие с дочерними компонентами и emits.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'

import BaseAvatar from '../ui/BaseAvatar.vue'

describe('BaseAvatar integration', () => {
	describe('emit click', () => {
		it('должен вызывать emit click при клике на аватар', async () => {
			const { container, emitted } = render(BaseAvatar)

			await fireEvent.click(container.querySelector('.base-avatar')!)

			expect(emitted()).toHaveProperty('click')
			expect(emitted().click).toHaveLength(1)
		})

		it('должен вызывать emit click только один раз при одном клике', async () => {
			const { container, emitted } = render(BaseAvatar)

			await fireEvent.click(container.querySelector('.base-avatar')!)

			expect(emitted().click).toHaveLength(1)
		})
	})

	describe('интеграция с BaseImage', () => {
		it('должен рендерить BaseImage когда передан src', () => {
			const { container } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', alt: 'Фото' },
			})

			const img = container.querySelector('.base-avatar__img')
			expect(img).toBeInTheDocument()
			expect(img?.querySelector('img')).toBeInTheDocument()
		})

		it('не должен рендерить BaseImage когда src не передан', () => {
			const { container } = render(BaseAvatar, {
				props: { name: 'Иван' },
			})

			expect(container.querySelector('.base-avatar__img')).not.toBeInTheDocument()
		})
	})

	describe('интеграция с BaseText', () => {
		it('должен рендерить BaseText с инициалами когда нет src', () => {
			render(BaseAvatar, {
				props: { name: 'Иван Петров' },
			})

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})

		it('должен рендерить BaseText с "?" когда нет имени и src', () => {
			render(BaseAvatar)

			expect(screen.getByText('?')).toBeInTheDocument()
		})

		it('не должен рендерить BaseText когда есть src', () => {
			const { container } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', name: 'Иван Петров' },
			})

			expect(container.querySelector('.base-avatar__initials')).not.toBeInTheDocument()
		})
	})

	describe('комбинированные сценарии', () => {
		it('должен рендерить BaseImage и emit click вместе', async () => {
			const { container, emitted } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', alt: 'Фото' },
			})

			await fireEvent.click(container.querySelector('.base-avatar')!)

			expect(container.querySelector('.base-avatar__img')).toBeInTheDocument()
			expect(emitted()).toHaveProperty('click')
		})

		it('должен рендерить онлайн-индикатор и инициалы вместе', () => {
			const { container } = render(BaseAvatar, {
				props: { name: 'Иван', isOnline: true },
			})

			expect(screen.getByText('И')).toBeInTheDocument()
			expect(container.querySelector('.base-avatar__online')).toBeInTheDocument()
		})
	})
})
