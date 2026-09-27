/**
 * Integration-тесты для BaseAvatar.
 * Проверяют изображение, запасные инициалы, статус и emit click.
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

	describe('изображение', () => {
		it('должен рендерить изображение с alt когда передан src', () => {
			render(BaseAvatar, {
				props: { src: '/avatar.jpg', alt: 'Фото' },
			})

			const img = screen.getByRole('img', { name: 'Фото' })
			expect(img).toHaveClass('base-avatar__img')
			expect(img).toHaveAttribute('src', '/avatar.jpg')
		})

		it('не должен рендерить изображение когда src не передан', () => {
			const { container } = render(BaseAvatar, {
				props: { name: 'Иван' },
			})

			expect(container.querySelector('.base-avatar__img')).not.toBeInTheDocument()
		})
	})

	describe('инициалы', () => {
		it('должен рендерить инициалы когда нет src', () => {
			render(BaseAvatar, {
				props: { name: 'Иван Петров' },
			})

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})

		it('должен рендерить "?" когда нет имени и src', () => {
			render(BaseAvatar)

			expect(screen.getByText('?')).toBeInTheDocument()
		})

		it('не должен рендерить инициалы когда есть src', () => {
			const { container } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', name: 'Иван Петров' },
			})

			expect(container.querySelector('.base-avatar__initials')).not.toBeInTheDocument()
		})
	})

	describe('комбинированные сценарии', () => {
		it('должен рендерить изображение и emit click вместе', async () => {
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
