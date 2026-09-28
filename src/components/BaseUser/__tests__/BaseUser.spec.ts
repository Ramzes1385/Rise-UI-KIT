import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseUser from '../ui/BaseUser.vue'

describe('BaseUser', () => {
	it('имя и подпись; аватар скрыт от скринридера; без ссылки — div', () => {
		const { container } = render(BaseUser, { props: { name: 'Анна Смирнова', description: 'Дизайнер' } })

		expect(screen.getByText('Анна Смирнова')).toBeInTheDocument()
		expect(screen.getByText('Дизайнер')).toBeInTheDocument()
		expect(container.querySelector('.base-avatar')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('a')).toBeNull()
		expect(container.querySelector('.base-user')).toHaveClass('base-user--horizontal')
	})

	it('в сети — скрытый текст после имени; вертикально; без подписи — без блока подписи', () => {
		const { container } = render(BaseUser, { props: { name: 'Иван', isOnline: true, orientation: 'vertical' } })

		expect(container.querySelector('.base-user__status')).toHaveTextContent(', в сети')
		expect(container.querySelector('.base-user')).toHaveClass('base-user--vertical')
		expect(container.querySelector('.base-user__description')).toBeNull()
	})

	it('to или href — весь блок ссылка; слот подписи', () => {
		render(BaseUser, {
			props: { name: 'Мария', href: 'https://example.com/maria', target: '_blank' },
			slots: { description: 'Менеджер' },
		})

		const link = screen.getByRole('link', { name: /Мария/ })
		expect(link).toHaveAttribute('href', 'https://example.com/maria')
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveTextContent('Менеджер')
	})
})
