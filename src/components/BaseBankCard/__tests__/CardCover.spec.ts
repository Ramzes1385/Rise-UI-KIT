import '@testing-library/jest-dom/vitest'
import CardCover from '../ui/CardCover.vue'
import { fireEvent, render } from '@testing-library/vue'

const IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E'
const GRADIENT = 'linear-gradient(135deg, var(--rise-color-primary-700), var(--rise-color-primary-950))'

function renderCover(props: Record<string, unknown> = {}, slots?: Record<string, string>) {
	const result = render(CardCover, { props, slots })
	const part = (name: string) => result.container.querySelector(`.card-cover__${name}`) as HTMLElement | null
	return { ...result, root: () => result.container.querySelector('.card-cover') as HTMLElement, part }
}

describe('CardCover', () => {
	it('скрыт от чтения с экрана', () => {
		const { root } = renderCover({ cover: IMAGE })
		expect(root()).toHaveAttribute('aria-hidden', 'true')
	})

	it('адрес — картинка без alt-текста', () => {
		const { part } = renderCover({ cover: IMAGE })
		expect(part('image')).toHaveAttribute('src', IMAGE)
		expect(part('image')).toHaveAttribute('alt', '')
		expect(part('fill')).toBeNull()
	})

	it('градиент — заливка через --card-cover-fill', () => {
		const { part } = renderCover({ cover: GRADIENT })
		expect(part('image')).toBeNull()
		expect(part('fill')?.style.getPropertyValue('--card-cover-fill')).toBe(GRADIENT)
	})

	it('без cover — пустой слой', () => {
		const { part } = renderCover()
		expect(part('layer')?.children).toHaveLength(0)
	})

	it('картинка не загрузилась — убирается, виден фон под обложкой; новый адрес — снова картинка', async () => {
		const { part, rerender } = renderCover({ cover: IMAGE })
		await fireEvent.error(part('image') as HTMLElement)
		expect(part('image')).toBeNull()
		await rerender({ cover: '/other.png' })
		expect(part('image')).toHaveAttribute('src', '/other.png')
	})

	it('затемнение — только при hasOverlay', async () => {
		const { part, rerender } = renderCover({ cover: IMAGE })
		expect(part('overlay')).toBeNull()
		await rerender({ cover: IMAGE, hasOverlay: true })
		expect(part('overlay')).not.toBeNull()
	})

	it('слот заменяет cover', () => {
		const { part } = renderCover({ cover: IMAGE }, { default: '<i class="my-cover" />' })
		expect(part('image')).toBeNull()
		expect(part('layer')?.querySelector('.my-cover')).not.toBeNull()
	})
})
