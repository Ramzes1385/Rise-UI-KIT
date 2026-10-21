import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseAvatar from '../ui/BaseAvatar.vue'
import { fireEvent, render, waitFor } from '@testing-library/vue'

const SRC = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
const part = (container: Element, name: string) => container.querySelector(`.base-avatar__${name}`)

describe('BaseAvatar: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const { container } = render(BaseAvatar, { props: { name: 'Анна Смирнова', isOnline: true } })

		expect(part(container, 'content')).toHaveAttribute('class', 'base-avatar__content')
		expect(part(container, 'initials')).toHaveAttribute('class', 'base-avatar__initials')
		expect(part(container, 'online')).toHaveAttribute('class', 'base-avatar__online')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = { root: 'u-root', content: 'u-content', img: 'u-img', online: 'u-online' }
		const { container } = render(BaseAvatar, { props: { src: SRC, isOnline: true, shape: 'square', customClass: 'own-root', ui } })
		const root = container.querySelector('.base-avatar')

		expect(root).toHaveClass('base-avatar', 'u-root', 'base-avatar--square', 'own-root')
		expect(part(container, 'content')).toHaveClass('u-content')
		expect(part(container, 'img')).toHaveClass('u-img')
		expect(part(container, 'online')).toHaveClass('u-online')
	})

	it('классы initials и mascot', () => {
		const { container } = render(BaseAvatar, { props: { name: 'Анна', ui: { initials: 'u-initials' } } })
		expect(part(container, 'initials')).toHaveClass('u-initials')

		const mascot = render(BaseAvatar, { props: { mascot: 'sprout', ui: { mascot: 'u-mascot' } } })
		expect(part(mascot.container, 'mascot')).toHaveClass('base-avatar__mascot--sprout', 'u-mascot')
	})

	it('классы из defaults.BaseAvatar.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseAvatar, {
			props: { name: 'Анна', ui: { content: 'own-content' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAvatar: { ui: { root: 'app-root', content: 'app-content' } } } })] },
		})

		expect(container.querySelector('.base-avatar')).toHaveClass('app-root')
		expect(part(container, 'content')).toHaveAttribute('class', 'base-avatar__content app-content own-content')
	})
})

describe('BaseAvatar: умолчание формы', () => {
	it('без пропса и defaults — square', () => {
		const { container } = render(BaseAvatar, { props: { name: 'Анна' } })
		expect(container.querySelector('.base-avatar')).toHaveClass('base-avatar--square')
	})

	it('defaults.BaseAvatar.shape из плагина меняет умолчание на circle', () => {
		const { container } = render(BaseAvatar, {
			props: { name: 'Анна' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAvatar: { shape: 'circle' } } })] },
		})
		expect(container.querySelector('.base-avatar')).toHaveClass('base-avatar--circle')
		expect(container.querySelector('.base-avatar')).not.toHaveClass('base-avatar--square')
	})

	it('явный shape экземпляра сильнее defaults плагина', () => {
		const { container } = render(BaseAvatar, {
			props: { name: 'Анна', shape: 'square' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAvatar: { shape: 'circle' } } })] },
		})
		expect(container.querySelector('.base-avatar')).toHaveClass('base-avatar--square')
	})
})

describe('BaseAvatar: появление фото', () => {
	it('фото проявляется после загрузки: до load — без класса --loaded', async () => {
		const { container } = render(BaseAvatar, { props: { src: SRC, alt: 'Анна' } })
		const img = part(container, 'img') as HTMLImageElement

		expect(img).not.toHaveClass('base-avatar__img--loaded')
		await fireEvent.load(img)
		expect(img).toHaveClass('base-avatar__img--loaded')
	})

	it('смена src снова скрывает фото до загрузки нового', async () => {
		const { container, rerender } = render(BaseAvatar, { props: { src: SRC } })
		await fireEvent.load(part(container, 'img')!)

		await rerender({ src: `${SRC}#2` })

		expect(part(container, 'img')).not.toHaveClass('base-avatar__img--loaded')
	})

	it('фото, загруженное до монтирования (из кэша, после SSR), видно сразу', async () => {
		const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
		const width = vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(64)
		const { container } = render(BaseAvatar, { props: { src: SRC } })

		await waitFor(() => expect(part(container, 'img')).toHaveClass('base-avatar__img--loaded'))
		complete.mockRestore()
		width.mockRestore()
	})
})

describe('BaseAvatar: точка «в сети»', () => {
	it('появляется и уходит через Transition на токенах', async () => {
		const { container, rerender } = render(BaseAvatar, { props: { name: 'Анна' }, global: { stubs: { Transition: false } } })

		await rerender({ isOnline: true })
		expect(part(container, 'online')).toHaveClass('base-avatar-online-enter-active')

		await rerender({ isOnline: false })
		expect(part(container, 'online')).toHaveClass('base-avatar-online-leave-active')
		await waitFor(() => expect(part(container, 'online')).toBeNull())
	})

	it('при первом показе точка без анимации', () => {
		const { container } = render(BaseAvatar, { props: { isOnline: true }, global: { stubs: { Transition: false } } })

		expect(part(container, 'online')).toHaveAttribute('class', 'base-avatar__online')
	})
})
