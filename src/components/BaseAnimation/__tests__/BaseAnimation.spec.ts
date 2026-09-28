import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import BaseAnimation from '../ui/BaseAnimation.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseAnimation unit', () => {
	describe('рендер', () => {
		it('должен рендерить анимацию когда show=true', () => {
			const { container } = render(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-animation')).toBeInTheDocument()
		})

		it('не должен рендерить когда show=false', () => {
			const { container } = render(BaseAnimation, {
				props: { show: false },
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-animation')).not.toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			expect(screen.getByText('Контент')).toBeInTheDocument()
		})
	})

	describe('пропс show', () => {
		it('должен рендерить по умолчанию (show=true)', () => {
			const { container } = render(BaseAnimation, {
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-animation')).toBeInTheDocument()
		})

		it('должен реагировать на show, переданный после монтирования', async () => {
			const { container, rerender } = render(BaseAnimation, {
				slots: { default: '<p>Контент</p>' },
			})

			await rerender({ show: false })

			expect(container.querySelector('.base-animation')).not.toBeInTheDocument()
		})
	})

	describe('пропс name', () => {
		it('должен применять имя анимации fade по умолчанию', () => {
			const { container } = render(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-animation')).toBeInTheDocument()
		})
	})

	describe('пропс isGroup', () => {
		it('должен рендерить TransitionGroup когда isGroup=true', () => {
			const { container } = render(BaseAnimation, {
				props: { show: true, isGroup: true, tag: 'ul' },
				slots: { default: '<li key="1">Элемент</li>' },
				global: {
					stubs: {
						TransitionGroup: false,
					},
				},
			})

			const list = container.querySelector('ul')
			expect(list).toBeInTheDocument()
		})

		it('должен рендерить элементы списка прямыми потомками tag, без обёртки (иначе ul > div > li)', () => {
			const { container } = render(BaseAnimation, {
				props: { isGroup: true, tag: 'ul', name: 'list', customClass: 'custom-list' },
				slots: { default: '<li key="1">Первый</li><li key="2">Второй</li>' },
				global: { stubs: { TransitionGroup: false } },
			})

			const list = container.querySelector('ul') as HTMLElement
			expect(list.querySelectorAll(':scope > li')).toHaveLength(2)
			expect(list).toHaveClass('base-animation--group', 'custom-list')
		})

		it('должен убирать элементы списка когда show=false', () => {
			const { container } = render(BaseAnimation, {
				props: { isGroup: true, tag: 'ul', show: false },
				slots: { default: '<li key="1">Первый</li>' },
				global: { stubs: { TransitionGroup: false } },
			})

			expect(container.querySelector('ul')).toBeInTheDocument()
			expect(container.querySelector('li')).not.toBeInTheDocument()
		})

		it('должен использовать isGroup=false по умолчанию', () => {
			const { container } = render(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-animation')).toBeInTheDocument()
		})
	})

	describe('пропс mode', () => {
		it('должен использовать mode по умолчанию', () => {
			const wrapper = mount(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})
			expect(wrapper.exists()).toBe(true)
		})

		it('должен использовать заданный mode', () => {
			const wrapper = mount(BaseAnimation, {
				props: { show: true, mode: 'in-out' },
				slots: { default: '<p>Контент</p>' },
			})
			expect(wrapper.exists()).toBe(true)
		})
	})

	describe('emit after-enter', () => {
		it('должен эмитить after-enter при появлении', async () => {
			const wrapper = mount(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			const transition = wrapper.findComponent({ name: 'Transition' })
			await transition.vm.$emit('after-enter')

			expect(wrapper.emitted()).toHaveProperty('after-enter')
		})
	})

	describe('emit after-leave', () => {
		it('должен эмитить after-leave при скрытии', async () => {
			const wrapper = mount(BaseAnimation, {
				props: { show: true },
				slots: { default: '<p>Контент</p>' },
			})

			const transition = wrapper.findComponent({ name: 'Transition' })
			await transition.vm.$emit('after-leave')

			expect(wrapper.emitted()).toHaveProperty('after-leave')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseAnimation, {
				props: {
					show: true,
					customClass: 'custom-animation-class',
				},
				slots: { default: '<p>Контент</p>' },
			})

			const el = container.querySelector('.base-animation')
			expect(el).toHaveClass('custom-animation-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseAnimation, {
				props: {
					show: true,
					customClass: {
						root: 'custom-animation-root',
					},
				},
				slots: { default: '<p>Контент</p>' },
			})

			const el = container.querySelector('.base-animation')
			expect(el).toHaveClass('custom-animation-root')
		})
	})
})
