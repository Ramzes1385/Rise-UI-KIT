/**
 * Unit-тесты для BaseEditor.
 * Проверяют рендер и CSS-модификаторы.
 * Компонент сложный — тестируем базовый рендер.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'
import BaseEditor from '../ui/BaseEditor.vue'

/** Стабаем дочерние компоненты для изоляции */
const globalConfig = {
	stubs: {
		BaseTooltip: {
			template: '<div class="tooltip-stub"><slot /></div>',
		},
	},
}

describe('BaseEditor unit', () => {
	describe('рендер', () => {
		it('должен рендерить редактор', () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			expect(container.querySelector('.base-editor')).toBeInTheDocument()
		})

		it('должен рендерить панель инструментов когда hasToolbar=true', () => {
			const { container } = render(BaseEditor, {
				props: { hasToolbar: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor__toolbar')).toBeInTheDocument()
		})

		it('не должен рендерить панель инструментов когда hasToolbar=false', () => {
			const { container } = render(BaseEditor, {
				props: { hasToolbar: false },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor__toolbar')).not.toBeInTheDocument()
		})

		it('должен вернуть панель инструментов после сброса hasToolbar=false', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseEditor, {
				props: { hasToolbar: false },
				global: globalConfig,
			})

			expect(wrapper.find('.base-editor__toolbar').exists()).toBe(false)

			await wrapper.setProps({ hasToolbar: undefined })

			expect(wrapper.find('.base-editor__toolbar').exists()).toBe(true)
		})
	})

	describe('пропс isReadonly', () => {
		it('должен применять модификатор --readonly когда isReadonly=true', () => {
			const { container } = render(BaseEditor, {
				props: { isReadonly: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor')?.classList.contains('base-editor--readonly')).toBe(true)
		})

		it('не должен применять модификатор --readonly по умолчанию', () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			expect(container.querySelector('.base-editor')?.classList.contains('base-editor--readonly')).toBe(false)
		})
	})

	describe('contenteditable область', () => {
		it('должен рендерить contenteditable область', () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			expect(container.querySelector('[contenteditable]')).toBeInTheDocument()
		})
	})

	describe('пропс placeholder', () => {
		it('должен устанавливать data-placeholder на contenteditable', () => {
			const { container } = render(BaseEditor, {
				props: { placeholder: 'Введите текст...' },
				global: globalConfig,
			})

			const editable = container.querySelector('[contenteditable]')
			expect(editable?.getAttribute('data-placeholder')).toBe('Введите текст...')
		})

		it('не должен устанавливать data-placeholder когда placeholder не передан', () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			const editable = container.querySelector('[contenteditable]')
			expect(editable?.getAttribute('data-placeholder')).toBe('')
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseEditor, {
				props: { sizeScale: 100 },
				global: globalConfig,
			})

			const el = container.querySelector('.base-editor') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseEditor, {
				props: { sizeScale: 150 },
				global: globalConfig,
			})

			const el = container.querySelector('.base-editor') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('пропс variant', () => {
		it('должен добавлять класс варианта --outline', () => {
			const { container } = render(BaseEditor, {
				props: { variant: 'outline' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor')?.classList.contains('base-editor--outline')).toBe(true)
		})
	})

	describe('пропс modelValue', () => {
		it('должен устанавливать HTML-содержимое при монтировании', () => {
			const { container } = render(BaseEditor, {
				props: { modelValue: '<p>Привет</p>' },
				global: globalConfig,
			})

			const editable = container.querySelector('[contenteditable]') as HTMLElement
			expect(editable.innerHTML).toBe('<p>Привет</p>')
		})
	})

	describe('состояние фокуса', () => {
		it('должен добавлять класс --focused при фокусе', async () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			const editable = container.querySelector('[contenteditable]')!
			await fireEvent.focus(editable)

			expect(container.querySelector('.base-editor')?.classList.contains('base-editor--focused')).toBe(true)
		})

		it('должен убирать класс --focused при потере фокуса', async () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			const editable = container.querySelector('[contenteditable]')!
			await fireEvent.focus(editable)
			await fireEvent.blur(editable)

			expect(container.querySelector('.base-editor')?.classList.contains('base-editor--focused')).toBe(false)
		})
	})

	describe('эмиты', () => {
		it('должен эмиссить focus при фокусе', async () => {
			const { emitted, container } = render(BaseEditor, { global: globalConfig })

			await fireEvent.focus(container.querySelector('[contenteditable]')!)

			expect(emitted().focus).toBeTruthy()
		})

		it('должен эмиссить blur при потере фокуса', async () => {
			const { emitted, container } = render(BaseEditor, { global: globalConfig })

			await fireEvent.blur(container.querySelector('[contenteditable]')!)

			expect(emitted().blur).toBeTruthy()
		})

		it('должен эмитить update:modelValue при вводе текста в редактор', async () => {
			const { emitted, container } = render(BaseEditor, { global: globalConfig })

			const editable = container.querySelector('[contenteditable]') as HTMLElement
			editable.innerHTML = '<p>Привет</p>'

			await fireEvent.input(editable)

			expect(emitted()['update:modelValue']).toBeTruthy()
		})
	})

	describe('панель инструментов и readonly', () => {
		it('не должен рендерить панель инструментов когда isReadonly=true', () => {
			const { container } = render(BaseEditor, {
				props: { hasToolbar: true, isReadonly: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor__toolbar')).not.toBeInTheDocument()
		})
	})

	describe('выбор формата заголовка', () => {
		it('должен обновлять headingValue при выборе формата в селекте', async () => {
			const { mount } = await import('@vue/test-utils')
			const { BaseSelect } = await import('@components/BaseSelect')

			const wrapper = mount(BaseEditor, {
				props: { hasToolbar: true },
				global: { stubs: { BaseTooltip: { template: '<div><slot /></div>' } } },
			})

			const select = wrapper.findComponent(BaseSelect)
			expect(select.exists()).toBe(true)

			await select.vm.$emit('update:modelValue', 'h1')

			expect(select.props('modelValue')).toBe('h1')
		})
	})

	describe('цветовые пикеры', () => {
		beforeEach(() => {
			Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => true) })
		})

		it('применяет цвет текста и активирует индикатор при change первого пикера', async () => {
			const { mount } = await import('@vue/test-utils')
			const { BaseColorPicker } = await import('@components/BaseColorPicker')

			const wrapper = mount(BaseEditor, {
				props: { hasToolbar: true },
				global: { stubs: { BaseTooltip: { template: '<div><slot /></div>' } } },
			})

			const pickers = wrapper.findAllComponents(BaseColorPicker)
			expect(pickers.length).toBeGreaterThanOrEqual(2)

			await pickers[0].vm.$emit('change', '#ff0000')

			const textPicker = wrapper.find('.base-editor__color-picker--active')
			expect(textPicker.exists()).toBe(true)
			expect(textPicker.attributes('style')).toContain('--editor-swatch-color')
		})

		it('сбрасывает цвет текста и снимает индикатор при reset первого пикера', async () => {
			const { mount } = await import('@vue/test-utils')
			const { BaseColorPicker } = await import('@components/BaseColorPicker')

			const wrapper = mount(BaseEditor, {
				props: { hasToolbar: true },
				global: { stubs: { BaseTooltip: { template: '<div><slot /></div>' } } },
			})

			const pickers = wrapper.findAllComponents(BaseColorPicker)
			await pickers[0].vm.$emit('change', '#ff0000')
			expect(wrapper.find('.base-editor__color-picker--active').exists()).toBe(true)

			await pickers[0].vm.$emit('reset')
			expect(wrapper.find('.base-editor__color-picker--active').exists()).toBe(false)
		})

		it('применяет цвет фона и активирует индикатор при change второго пикера', async () => {
			const { mount } = await import('@vue/test-utils')
			const { BaseColorPicker } = await import('@components/BaseColorPicker')

			const wrapper = mount(BaseEditor, {
				props: { hasToolbar: true },
				global: { stubs: { BaseTooltip: { template: '<div><slot /></div>' } } },
			})

			const pickers = wrapper.findAllComponents(BaseColorPicker)
			await pickers[1].vm.$emit('update:modelValue', '#00ff00')
			await pickers[1].vm.$emit('change', '#00ff00')

			const bgPicker = wrapper.find('.base-editor__color-picker--active')
			expect(bgPicker.exists()).toBe(true)
			expect(bgPicker.attributes('style')).toContain('--editor-swatch-color')
		})

		it('сбрасывает цвет фона и снимает индикатор при reset второго пикера', async () => {
			const { mount } = await import('@vue/test-utils')
			const { BaseColorPicker } = await import('@components/BaseColorPicker')

			const wrapper = mount(BaseEditor, {
				props: { hasToolbar: true },
				global: { stubs: { BaseTooltip: { template: '<div><slot /></div>' } } },
			})

			const pickers = wrapper.findAllComponents(BaseColorPicker)
			await pickers[1].vm.$emit('change', '#00ff00')
			expect(wrapper.find('.base-editor__color-picker--active').exists()).toBe(true)

			await pickers[1].vm.$emit('reset')
			expect(wrapper.find('.base-editor__color-picker--active').exists()).toBe(false)
		})
	})

	describe('mousedown по label медиа', () => {
		it('останавливает всплытие mousedown на label изображения (модификатор .stop)', async () => {
			const { container } = render(BaseEditor, {
				props: { hasToolbar: true },
				global: globalConfig,
			})

			const imageLabel = container.querySelector('input[accept="image/*"]')?.closest('label') as HTMLElement
			expect(imageLabel).toBeInTheDocument()

			const onParentMouseDown = vi.fn()
			imageLabel.parentElement?.addEventListener('mousedown', onParentMouseDown)
			await fireEvent.mouseDown(imageLabel)

			expect(onParentMouseDown).not.toHaveBeenCalled()
		})

		it('останавливает всплытие mousedown на label видео (модификатор .stop)', async () => {
			const { container } = render(BaseEditor, {
				props: { hasToolbar: true },
				global: globalConfig,
			})

			const videoLabel = container.querySelector('input[accept="video/*"]')?.closest('label') as HTMLElement
			expect(videoLabel).toBeInTheDocument()

			const onParentMouseDown = vi.fn()
			videoLabel.parentElement?.addEventListener('mousedown', onParentMouseDown)
			await fireEvent.mouseDown(videoLabel)

			expect(onParentMouseDown).not.toHaveBeenCalled()
		})
	})

	describe('проверка пустого содержимого', () => {
		it('убирает модификатор --empty после ввода непустого текста', async () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			const editable = container.querySelector('[contenteditable]') as HTMLElement
			expect(container.querySelector('.base-editor__content--empty')).toBeInTheDocument()

			editable.textContent = 'Текст'
			await fireEvent.input(editable)

			expect(container.querySelector('.base-editor__content--empty')).not.toBeInTheDocument()
		})

		it('считает содержимое пустым, когда textContent равен null', async () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			const editable = container.querySelector('[contenteditable]') as HTMLElement
			Object.defineProperty(editable, 'textContent', { configurable: true, get: () => null })
			await fireEvent.input(editable)

			expect(container.querySelector('.base-editor__content--empty')).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseEditor, {
				props: { customClass: 'custom-editor-class' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor')?.classList.contains('custom-editor-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseEditor, {
				props: {
					customClass: {
						root: 'custom-root',
						toolbar: 'custom-toolbar',
						btn: 'custom-btn',
						group: 'custom-group',
						content: 'custom-content',
					},
				},
				global: globalConfig,
			})

			const root = container.querySelector('.base-editor')
			expect(root?.classList.contains('custom-root')).toBe(true)

			const toolbar = container.querySelector('.base-editor__toolbar')
			expect(toolbar?.classList.contains('custom-toolbar')).toBe(true)

			const btn = container.querySelector('.base-editor__btn')
			expect(btn?.classList.contains('custom-btn')).toBe(true)

			const group = container.querySelector('.base-editor__group')
			expect(group?.classList.contains('custom-group')).toBe(true)

			const content = container.querySelector('.base-editor__content')
			expect(content?.classList.contains('custom-content')).toBe(true)
		})
	})
})
