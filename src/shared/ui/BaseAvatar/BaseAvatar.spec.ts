/**
 * Unit-тесты для BaseAvatar.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseAvatar from './BaseAvatar.vue'

describe('BaseAvatar unit', () => {
	describe('рендер', () => {
		it('должен рендерить аватар', () => {
			const { container } = render(BaseAvatar)

			expect(container.querySelector('.base-avatar')).toBeInTheDocument()
		})

		it('должен рендерить "?" когда нет имени и изображения', () => {
			render(BaseAvatar)

			expect(screen.getByText('?')).toBeInTheDocument()
		})
	})

	describe('пропс src', () => {
		it('должен рендерить изображение когда передан src', () => {
			const { container } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', alt: 'Аватар' },
			})

			const img = container.querySelector<HTMLImageElement>('.base-avatar__img')
			expect(img).toBeInTheDocument()
			expect(img?.getAttribute('alt')).toBe('Аватар')
		})

		it('должен рендерить инициалы когда src не передан', () => {
			render(BaseAvatar, { props: { name: 'Иван Петров' } })

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})
	})

	describe('пропс name', () => {
		it('должен генерировать инициалы из имени', () => {
			render(BaseAvatar, { props: { name: 'Иван Петров' } })

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})

		it('должен брать максимум 2 инициала', () => {
			render(BaseAvatar, { props: { name: 'Иван Петров Сидоров' } })

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})

		it('должен рендерить "?" когда имя не передано', () => {
			render(BaseAvatar)

			expect(screen.getByText('?')).toBeInTheDocument()
		})
	})

	describe('пропс shape', () => {
		it('должен применять модификатор --circle по умолчанию', () => {
			const { container } = render(BaseAvatar)

			expect(container.querySelector('.base-avatar')?.classList.contains('base-avatar--circle')).toBe(true)
		})

		it('должен применять модификатор --square когда shape=square', () => {
			const { container } = render(BaseAvatar, { props: { shape: 'square' } })

			expect(container.querySelector('.base-avatar')?.classList.contains('base-avatar--square')).toBe(true)
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --bordered когда variant=bordered', () => {
			const { container } = render(BaseAvatar, { props: { variant: 'bordered' } })

			expect(container.querySelector('.base-avatar')?.classList.contains('base-avatar--bordered')).toBe(true)
		})
	})

	describe('пропс size', () => {
		it('должен применять модификатор --md по умолчанию', () => {
			const { container } = render(BaseAvatar)

			expect(container.querySelector('.base-avatar')?.classList.contains('base-avatar--md')).toBe(true)
		})

		it('должен применять модификатор --lg когда size=lg', () => {
			const { container } = render(BaseAvatar, { props: { size: 'lg' } })

			expect(container.querySelector('.base-avatar')?.classList.contains('base-avatar--lg')).toBe(true)
		})
	})

	describe('пропс isOnline', () => {
		it('должен рендерить индикатор онлайн когда isOnline=true', () => {
			const { container } = render(BaseAvatar, { props: { isOnline: true } })

			expect(container.querySelector('.base-avatar__online')).toBeInTheDocument()
		})

		it('не должен рендерить индикатор онлайн когда isOnline=false', () => {
			const { container } = render(BaseAvatar, { props: { isOnline: false } })

			expect(container.querySelector('.base-avatar__online')).not.toBeInTheDocument()
		})
	})

	describe('emit click', () => {
		it('должен эмитить click при клике на аватар', async () => {
			const { emitted, container } = render(BaseAvatar)

			const avatar = container.querySelector('.base-avatar') as HTMLElement
			avatar.dispatchEvent(new Event('click'))

			const clickEvents = emitted()['click']
			expect(clickEvents).toBeTruthy()
		})
	})
})
