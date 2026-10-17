import '@testing-library/jest-dom/vitest'
import BaseRating from '../../ui/BaseRating.vue'
import { fireEvent, render } from '@testing-library/vue'

describe('BaseRating в RTL', () => {
	beforeEach(() => document.documentElement.setAttribute('dir', 'rtl'))
	afterEach(() => document.documentElement.removeAttribute('dir'))

	it('← увеличивает оценку, → уменьшает', async () => {
		const { container, emitted } = render(BaseRating, { props: { modelValue: 2, step: 0.5 } })
		const rating = container.querySelector('.base-rating') as HTMLElement

		await fireEvent.keyDown(rating, { key: 'ArrowLeft' })
		await fireEvent.keyDown(rating, { key: 'ArrowRight' })

		expect(emitted()['update:modelValue']).toEqual([[2.5], [1.5]])
	})

	it('доля звезды считается от правого края: клик у правого края — начало звезды', async () => {
		const { container, emitted } = render(BaseRating, { props: { step: 0.5 } })
		const star = container.querySelectorAll<HTMLElement>('.base-rating__star')[2]
		star.getBoundingClientRect = () => ({ left: 0, right: 20, width: 20, top: 0, bottom: 0, height: 0, x: 0, y: 0 }) as DOMRect

		await fireEvent.click(star, { clientX: 18 })

		expect(emitted()['update:modelValue']).toEqual([[2.5]])
	})
})
