import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import type { ChatBadge } from '../../types/BaseChat.types'
import ChatBadges from '../../ui/ChatBadges/ChatBadges.vue'

const BADGES: ChatBadge[] = [
	{ id: 'verified', label: 'Подтверждён', icon: 'check-circle', color: 'rgb(0, 128, 0)' },
	{ id: 'cup', label: 'Победитель', emoji: '🏆' },
	{ id: 'plain', label: 'Участник' },
	{ id: 'mentor', label: 'Наставник', icon: 'user' },
	{ id: 'fire', label: 'Активный', emoji: '🔥' },
]

function renderBadges(props: Partial<InstanceType<typeof ChatBadges>['$props']> = {}) {
	return render(ChatBadges, { props: { badges: BADGES, sizeScale: 1, ...props } })
}

function iconHrefs(container: Element): string[] {
	return [...container.querySelectorAll('.base-icon use')].map(use => use.getAttribute('href') ?? '')
}

describe('ChatBadges unit', () => {
	it('показывает не больше max значков и счётчик «+N» для остальных', () => {
		const { container } = renderBadges({ max: 3 })

		expect(container.querySelectorAll('.base-chat-badges__badge')).toHaveLength(3)
		expect(screen.getByText('+2')).toBeInTheDocument()
	})

	it('озвучивает «+N» числом и названиями скрытых значков', () => {
		renderBadges({ max: 3 })

		expect(screen.getByRole('img', { name: 'Ещё 2 значка: Наставник, Активный' })).toHaveTextContent('+2')
	})

	it('по умолчанию показывает три значка', () => {
		const { container } = renderBadges()

		expect(container.querySelectorAll('.base-chat-badges__badge')).toHaveLength(3)
	})

	it('не показывает «+N», когда все значки помещаются', () => {
		const { container } = renderBadges({ max: 5 })

		expect(container.querySelectorAll('.base-chat-badges__badge')).toHaveLength(5)
		expect(container.querySelector('.base-chat-badges__more')).not.toBeInTheDocument()
	})

	it('каждый значок доступен по названию', () => {
		renderBadges({ max: 3 })

		expect(screen.getByRole('img', { name: 'Подтверждён' })).toBeInTheDocument()
		expect(screen.getByRole('img', { name: 'Победитель' })).toBeInTheDocument()
		expect(screen.getByRole('img', { name: 'Участник' })).toBeInTheDocument()
	})

	it('выводит эмодзи, иконку с цветом и запасную star', () => {
		const { container } = renderBadges({ max: 3 })

		expect(screen.getByText('🏆')).toHaveClass('base-chat-badges__emoji')
		const hrefs = iconHrefs(container)
		expect(hrefs).toHaveLength(2)
		expect(hrefs[0]).toContain('check-circle')
		expect(hrefs[1]).toContain('star')
		expect(container.querySelector('.base-icon__svg')).toHaveStyle({ color: 'rgb(0, 128, 0)' })
	})

	it('при max = 0 показывает только «+N» со всеми значками', () => {
		const { container } = renderBadges({ max: 0 })

		expect(container.querySelector('.base-chat-badges__badge')).not.toBeInTheDocument()
		expect(screen.getByRole('img', { name: /^Ещё 5 значков: Подтверждён/ })).toHaveTextContent('+5')
	})

	it('отрицательный max считается нулём', () => {
		const { container } = renderBadges({ max: -2 })

		expect(container.querySelector('.base-chat-badges__badge')).not.toBeInTheDocument()
		expect(screen.getByText('+5')).toBeInTheDocument()
	})

	it('в режиме isLabeled показывает все значки с подписями', () => {
		const { container } = renderBadges({ isLabeled: true, max: 1 })

		expect(container.querySelector('ul.base-chat-badges--labeled')).toBeInTheDocument()
		expect(container.querySelectorAll('.base-chat-badges__chip')).toHaveLength(5)
		for (const badge of BADGES) expect(screen.getByText(badge.label)).toHaveClass('base-chat-badges__label')
		expect(screen.getByText('🔥')).toHaveClass('base-chat-badges__emoji')
		expect(iconHrefs(container)).toHaveLength(3)
		expect(container.querySelector('.base-chat-badges__more')).not.toBeInTheDocument()
	})
})
