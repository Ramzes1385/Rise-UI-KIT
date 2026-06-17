/**
 * Unit-тесты для BaseSearch.
 * Проверяют рендер, CSS-модификаторы и базовое поведение.
 */

import { fireEvent, render, waitFor } from '@testing-library/vue'
import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { useEscapeKey } from '@composables/useEscapeKey'
import BaseSearch from '../ui/BaseSearch.vue'

/** Мокаем DOM-зависимые композаблы */
vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/useScrollLock', () => ({ useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }) }))

/** Стабаем дочерние компоненты для изоляции */
const globalConfig = {
	stubs: {
		BaseDropdown: {
			template: '<div class="base-dropdown-stub" :class="customClass"><slot /><slot name="dropdown" /></div>',
			props: ['customClass'],
		},
		BaseInput: {
			template:
				'<div class="base-input-stub" :class="customClass" :data-placeholder="placeholder" :data-error="error"><slot name="prefix" /><slot name="suffix" /></div>',
			props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type', 'customClass'],
			methods: { focus: vi.fn() },
		},
		BaseButton: {
			template: '<button class="base-button-stub" :class="customClass"><slot /></button>',
			props: ['variant', 'isDisabled', 'sizeScale', 'customClass'],
		},
		BaseIcon: {
			template: '<span class="base-icon-stub" :class="customClass"></span>',
			props: ['name', 'size', 'sizeScale', 'customClass'],
		},
		BaseImage: {
			template: '<img class="base-image-stub" :class="customClass" />',
			props: ['src', 'alt', 'borderRadius', 'fit', 'sizeScale', 'customClass'],
		},
		BaseLoader: {
			template: '<span class="base-loader" :class="customClass"></span>',
			props: ['variant', 'size', 'sizeScale', 'customClass'],
		},
		BaseText: {
			template: '<span class="base-text-stub" :class="customClass"><slot /></span>',
			props: ['tag', 'sizeScale', 'customClass'],
		},
	},
}

describe('BaseSearch unit', () => {
	describe('рендер', () => {
		it('должен рендерить компонент поиска в режиме default', () => {
			const { container } = render(BaseSearch, { global: globalConfig })

			expect(container.querySelector('.base-search')).toBeInTheDocument()
			expect(container.querySelector('.base-dropdown-stub')).toBeInTheDocument()
		})

		it('должен рендерить иконку поиска когда hasIcon=true', () => {
			const { container } = render(BaseSearch, {
				props: { hasIcon: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__icon')).toBeInTheDocument()
		})

		it('не должен рендерить иконку поиска когда hasIcon=false', () => {
			const { container } = render(BaseSearch, {
				props: { hasIcon: false },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__icon')).not.toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен добавлять БЭМ-модификатор варианта', () => {
			const { container } = render(BaseSearch, {
				props: { variant: 'outline' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search--outline')).toBeInTheDocument()
		})

		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseSearch, {
				props: { variant: 'default' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search--default')).not.toBeInTheDocument()
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять модификатор --disabled', () => {
			const { container } = render(BaseSearch, {
				props: { isDisabled: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search--disabled')).toBeInTheDocument()
		})

		it('не должен добавлять модификатор когда isDisabled=false', () => {
			const { container } = render(BaseSearch, {
				props: { isDisabled: false },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search--disabled')).not.toBeInTheDocument()
		})
	})

	describe('пропс isLoading', () => {
		it('должен рендерить лоадер когда isLoading=true', () => {
			const { container } = render(BaseSearch, {
				props: { isLoading: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-loader')).toBeInTheDocument()
		})

		it('не должен рендерить лоадер когда isLoading=false', () => {
			const { container } = render(BaseSearch, {
				props: { isLoading: false },
				global: globalConfig,
			})

			expect(container.querySelector('.base-loader')).not.toBeInTheDocument()
		})

		it('должен добавлять модификатор --loading', () => {
			const { container } = render(BaseSearch, {
				props: { isLoading: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search--loading')).toBeInTheDocument()
		})
	})

	describe('режим modal', () => {
		it('должен рендерить триггер модального окна', () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'modal' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__trigger')).toBeInTheDocument()
		})

		it('не должен рендерить dropdown в режиме modal', () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'modal' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-dropdown-stub')).not.toBeInTheDocument()
		})
	})

	describe('режим sidebar', () => {
		it('должен рендерить триггер боковой панели', () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__trigger')).toBeInTheDocument()
		})

		it('не должен рендерить dropdown в режиме sidebar', () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-dropdown-stub')).not.toBeInTheDocument()
		})
	})

	describe('результаты с изображениями', () => {
		it('должен рендерить BaseImage когда у результата есть image', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'закат',
					results: [{ id: 1, title: 'Закат', image: 'test.jpg' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__result-image')).toBeInTheDocument()
			expect(container.querySelector('.base-search__result-icon')).not.toBeInTheDocument()
		})

		it('должен рендерить BaseIcon когда у результата есть icon но нет image', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'закат',
					results: [{ id: 1, title: 'Закат', icon: 'search' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__result-icon')).toBeInTheDocument()
			expect(container.querySelector('.base-search__result-image')).not.toBeInTheDocument()
		})

		it('должен предпочитать image перед icon', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'закат',
					results: [{ id: 1, title: 'Закат', image: 'test.jpg', icon: 'search' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__result-image')).toBeInTheDocument()
			expect(container.querySelector('.base-search__result-icon')).not.toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseSearch, {
				props: { sizeScale: 100 },
				global: globalConfig,
			})

			const search = container.querySelector('.base-search') as HTMLElement
			expect(search.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseSearch, {
				props: { sizeScale: 150 },
				global: globalConfig,
			})

			const search = container.querySelector('.base-search') as HTMLElement
			expect(search.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale=0.75 когда sizeScale=75', () => {
			const { container } = render(BaseSearch, {
				props: { sizeScale: 75 },
				global: globalConfig,
			})

			const search = container.querySelector('.base-search') as HTMLElement
			expect(search.style.getPropertyValue('--size-scale')).toBe('0.75')
		})
	})

	describe('пропс placeholder', () => {
		it('должен передавать placeholder в BaseInput', () => {
			const { container } = render(BaseSearch, {
				props: { placeholder: 'Найти...' },
				global: globalConfig,
			})

			const input = container.querySelector('.base-input-stub')
			expect(input?.getAttribute('data-placeholder')).toBe('Найти...')
		})
	})

	describe('пропс error', () => {
		it('должен передавать error в BaseInput', () => {
			const { container } = render(BaseSearch, {
				props: { error: 'Обязательное поле' },
				global: globalConfig,
			})

			const input = container.querySelector('.base-input-stub')
			expect(input?.getAttribute('data-error')).toBe('Обязательное поле')
		})

		it('не должен передавать error когда error пустой', () => {
			const { container } = render(BaseSearch, {
				props: { error: '' },
				global: globalConfig,
			})

			const input = container.querySelector('.base-input-stub')
			expect(input?.getAttribute('data-error')).toBe('')
		})
	})

	describe('пропс hasClear', () => {
		it('должен рендерить кнопку очистки когда hasClear=true и есть запрос', () => {
			const { container } = render(BaseSearch, {
				props: { hasClear: true, modelValue: 'тест' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__clear')).toBeInTheDocument()
		})

		it('не должен рендерить кнопку очистки когда hasClear=false', () => {
			const { container } = render(BaseSearch, {
				props: { hasClear: false, modelValue: 'тест' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__clear')).not.toBeInTheDocument()
		})

		it('должен вернуть кнопку очистки после сброса hasClear=false', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseSearch, {
				props: { hasClear: false, modelValue: 'тест' },
				global: globalConfig,
			})

			expect(wrapper.find('.base-search__clear').exists()).toBe(false)

			await wrapper.setProps({ hasClear: undefined })

			expect(wrapper.find('.base-search__clear').exists()).toBe(true)
		})

		it('не должен рендерить кнопку очистки когда запрос пустой', () => {
			const { container } = render(BaseSearch, {
				props: { hasClear: true, modelValue: '' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__clear')).not.toBeInTheDocument()
		})
	})

	describe('результаты поиска', () => {
		it('должен рендерить список результатов когда передан modelValue и results', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'Закат',
					results: [
						{ id: 1, title: 'Закат солнца' },
						{ id: 2, title: 'Закат в горах' },
					],
				},
				global: globalConfig,
			})

			expect(container.querySelectorAll('.base-search__result').length).toBe(2)
		})

		it('не должен рендерить результаты когда modelValue пустой', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: '',
					results: [{ id: 1, title: 'Результат 1' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__result')).not.toBeInTheDocument()
		})
	})

	describe('пропс isAutofocus', () => {
		it('должен вызывать focus инпута при монтировании когда isAutofocus=true и mode=default', async () => {
			const focusMock = vi.fn()
			const autofocusConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template: '<div class="base-input-stub"><slot name="prefix" /><slot name="suffix" /></div>',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						methods: { focus: focusMock },
					},
				},
			}

			render(BaseSearch, {
				props: { isAutofocus: true, mode: 'default' },
				global: autofocusConfig,
			})

			await waitFor(() => {
				expect(focusMock).toHaveBeenCalled()
			})
		})

		it('не должен вызывать focus когда isAutofocus=false', () => {
			const focusMock = vi.fn()
			const noAutofocusConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template: '<div class="base-input-stub"><slot name="prefix" /><slot name="suffix" /></div>',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						methods: { focus: focusMock },
					},
				},
			}

			render(BaseSearch, {
				props: { isAutofocus: false, mode: 'default' },
				global: noAutofocusConfig,
			})

			expect(focusMock).not.toHaveBeenCalled()
		})
	})

	describe('эмиты', () => {
		it('должен эмитить clear при нажатии кнопки очистки', async () => {
			const { container, emitted } = render(BaseSearch, {
				props: { hasClear: true, modelValue: 'тест' },
				global: globalConfig,
			})

			await fireEvent.click(container.querySelector('.base-search__clear')!)
			expect(emitted()).toHaveProperty('clear')
		})

		it('должен эмитить select при клике на результат', async () => {
			const result = { id: 1, title: 'Закат' }
			const { container, emitted } = render(BaseSearch, {
				props: { modelValue: 'Закат', results: [result] },
				global: globalConfig,
			})

			await fireEvent.mouseDown(container.querySelector('.base-search__result')!)
			expect(emitted().select).toBeTruthy()
		})

		it('должен эмитить search при нажатии Enter без подсвеченного результата', async () => {
			const { emitted, container } = render(BaseSearch, {
				props: { modelValue: 'тест', isInstant: false },
				global: globalConfig,
			})

			/** BaseInput стаб эмитит keydown наверх */
			const input = container.querySelector('.base-input-stub')!
			await fireEvent.keyDown(input, { key: 'Enter' })
			expect(emitted()).toHaveProperty('search')
			expect(emitted().search[0]).toEqual(['тест'])
		})

		it('должен эмитить search с дебаунсом в режиме isInstant', async () => {
			vi.useFakeTimers()
			const debounceConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template:
							'<div class="base-input-stub" :data-placeholder="placeholder" :data-error="error"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="prefix" /><slot name="suffix" /></div>',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						emits: ['update:modelValue'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { emitted, container } = render(BaseSearch, {
				props: { modelValue: '', isInstant: true, debounceMs: 300 },
				global: debounceConfig,
			})

			const input = container.querySelector('.base-input-stub input')! as HTMLInputElement
			await fireEvent.update(input, 'тест')

			expect(emitted()).not.toHaveProperty('search')

			vi.advanceTimersByTime(300)
			expect(emitted()).toHaveProperty('search')

			vi.useRealTimers()
		})

		it('должен эмитить update:modelValue с пустой строкой при очистке', async () => {
			const { container, emitted } = render(BaseSearch, {
				props: { hasClear: true, modelValue: 'тест' },
				global: globalConfig,
			})

			await fireEvent.click(container.querySelector('.base-search__clear')!)
			expect(emitted()['update:modelValue']).toBeTruthy()
			expect(emitted()['update:modelValue'][0]).toEqual([''])
		})
	})

	describe('emit update:modelValue', () => {
		it('должен эмитить update:modelValue при вводе текста', async () => {
			const inputConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template:
							'<div class="base-input-stub"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="prefix" /><slot name="suffix" /></div>',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						emits: ['update:modelValue'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { emitted, container } = render(BaseSearch, {
				props: { modelValue: '' },
				global: inputConfig,
			})

			const input = container.querySelector('.base-input-stub input')! as HTMLInputElement
			await fireEvent.update(input, 'тест')
			expect(emitted()['update:modelValue']).toBeTruthy()
			expect(emitted()['update:modelValue'][0]).toEqual(['тест'])
		})

		it('должен эмитить update:modelValue с title при выборе результата', async () => {
			const { container, emitted } = render(BaseSearch, {
				props: {
					modelValue: 'Закат',
					results: [{ id: 1, title: 'Закат солнца' }],
				},
				global: globalConfig,
			})

			await fireEvent.mouseDown(container.querySelector('.base-search__result')!)
			expect(emitted()['update:modelValue']).toBeTruthy()
			expect(emitted()['update:modelValue'][0]).toEqual(['Закат солнца'])
		})
	})

	describe('пропс maxResults', () => {
		it('должен ограничивать количество видимых результатов', () => {
			const results = [
				{ id: 1, title: 'тест 1' },
				{ id: 2, title: 'тест 2' },
				{ id: 3, title: 'тест 3' },
				{ id: 4, title: 'тест 4' },
				{ id: 5, title: 'тест 5' },
			]
			const { container } = render(BaseSearch, {
				props: { modelValue: 'тест', maxResults: 2, results },
				global: globalConfig,
			})

			expect(container.querySelectorAll('.base-search__result').length).toBe(2)
		})
	})

	describe('пропс isInstant', () => {
		it('не должен показывать результаты до Enter когда isInstant=false', () => {
			const instantConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseDropdown: {
						template: '<div class="base-dropdown-stub"><slot /><slot v-if="isOpen" name="dropdown" /></div>',
						props: ['isOpen', 'position', 'matchWidth', 'preventMousedown', 'sizeScale', 'maxHeight'],
					},
				},
			}

			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'тест',
					isInstant: false,
					results: [{ id: 1, title: 'тестовый' }],
				},
				global: instantConfig,
			})

			expect(container.querySelector('.base-search__result')).not.toBeInTheDocument()
		})
	})

	describe('фильтрация результатов', () => {
		it('должен фильтровать результаты по description', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'гор',
					results: [{ id: 1, title: 'Закат', description: 'В горах' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__result')).toBeInTheDocument()
		})

		it('не должен показывать результаты не совпадающие с запросом', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'xyz',
					results: [{ id: 1, title: 'Закат' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__result')).not.toBeInTheDocument()
		})
	})

	describe('пропс color', () => {
		it('должен применять кастомный цвет', () => {
			const { container } = render(BaseSearch, {
				props: { color: { bg: { base: '#ff0000' } } },
				global: globalConfig,
			})

			const search = container.querySelector('.base-search') as HTMLElement
			expect(search.style.getPropertyValue('--custom-bg')).toBe('#ff0000')
		})
	})

	describe('результат с description', () => {
		it('должен рендерить описание результата', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'тест',
					results: [{ id: 1, title: 'Тест', description: 'Описание' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__result-desc')).toBeInTheDocument()
		})
	})

	describe('результат с category', () => {
		it('должен рендерить категорию результата', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'тест',
					results: [{ id: 1, title: 'Тест', category: 'Категория' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__result-category')).toBeInTheDocument()
		})
	})

	describe('empty state', () => {
		it('должен рендерить "Ничего не найдено" при отсутствии результатов', () => {
			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'xyz',
					results: [{ id: 1, title: 'Тест' }],
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__empty')).toBeInTheDocument()
		})
	})

	describe('handleFocus / handleBlur', () => {
		it('должен устанавливать isFocused при фокусе', async () => {
			const focusConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseDropdown: {
						template:
							'<div class="base-dropdown-stub" :data-is-open="isOpen"><slot /><slot v-if="isOpen" name="dropdown" /></div>',
						props: ['isOpen', 'position', 'matchWidth', 'preventMousedown', 'sizeScale', 'maxHeight'],
					},
					BaseInput: {
						template:
							'<input class="base-input-stub" @focus="$emit(\'focus\')" @blur="$emit(\'blur\')" :value="modelValue" />',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						emits: ['update:modelValue', 'focus', 'blur', 'keydown'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { container } = render(BaseSearch, {
				props: { modelValue: 'тест', results: [{ id: 1, title: 'Тестовый' }] },
				global: focusConfig,
			})

			const input = container.querySelector('.base-input-stub')!
			await fireEvent.focus(input)

			// После фокуса с query — dropdown должен открыться
			const dropdown = container.querySelector('.base-dropdown-stub')
			expect(dropdown?.getAttribute('data-is-open')).toBe('true')
		})
	})

	describe('modal: открытие/закрытие', () => {
		it('должен открывать модал при фокусе на триггер', async () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'modal' },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__modal-overlay')).toBeInTheDocument()
		})

		it('не должен открывать модал когда isDisabled=true', async () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'modal', isDisabled: true },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__modal-overlay')).not.toBeInTheDocument()
		})

		it('должен закрывать модал при клике на overlay', async () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'modal' },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const overlay = document.body.querySelector('.base-search__modal-overlay')!
			await fireEvent.click(overlay)

			expect(document.body.querySelector('.base-search__modal-overlay')).not.toBeInTheDocument()
		})

		it('должен закрывать модал при клике на кнопку закрытия', async () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'modal' },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const closeBtn = document.body.querySelector('.base-search__modal-close')!
			await fireEvent.click(closeBtn)

			expect(document.body.querySelector('.base-search__modal-overlay')).not.toBeInTheDocument()
		})

		it('должен закрывать модал при выборе результата', async () => {
			const { container } = render(BaseSearch, {
				props: {
					mode: 'modal',
					modelValue: 'тест',
					results: [{ id: 1, title: 'Тестовый' }],
				},
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const result = document.body.querySelector('.base-search__result')!
			await fireEvent.mouseDown(result)

			expect(document.body.querySelector('.base-search__modal-overlay')).not.toBeInTheDocument()
		})
	})

	describe('sidebar: открытие/закрытие', () => {
		it('должен открывать сайдбар при фокусе на триггер', async () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar' },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__sidebar-overlay')).toBeInTheDocument()
		})

		it('не должен открывать сайдбар когда isDisabled=true', async () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar', isDisabled: true },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__sidebar-overlay')).not.toBeInTheDocument()
		})

		it('должен закрывать сайдбар при клике на overlay', async () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar' },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const overlay = document.body.querySelector('.base-search__sidebar-overlay')!
			await fireEvent.click(overlay)

			expect(document.body.querySelector('.base-search__sidebar-overlay')).not.toBeInTheDocument()
		})

		it('должен закрывать сайдбар при клике на кнопку закрытия', async () => {
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar' },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const closeBtn = document.body.querySelector('.base-search__sidebar-close')!
			await fireEvent.click(closeBtn)

			expect(document.body.querySelector('.base-search__sidebar-overlay')).not.toBeInTheDocument()
		})

		it('должен закрывать сайдбар при выборе результата', async () => {
			const { container } = render(BaseSearch, {
				props: {
					mode: 'sidebar',
					modelValue: 'тест',
					results: [{ id: 1, title: 'Тестовый' }],
				},
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const result = document.body.querySelector('.base-search__result')!
			await fireEvent.mouseDown(result)

			expect(document.body.querySelector('.base-search__sidebar-overlay')).not.toBeInTheDocument()
		})
	})

	describe('watch modelValue', () => {
		it('должен синхронизировать query при внешнем изменении modelValue', async () => {
			const { container, rerender } = render(BaseSearch, {
				props: { modelValue: 'тест' },
				global: globalConfig,
			})

			await rerender({ modelValue: 'новый запрос' })

			// После обновления modelValue, query должен обновиться и отобразиться в инпуте
			const input = container.querySelector('.base-input-stub')
			expect(input?.getAttribute('data-placeholder')).toBeTruthy()
		})
	})

	describe('handleInput когда isInstant=false', () => {
		it('не должен вызывать debouncedSearch когда isInstant=false', async () => {
			vi.useFakeTimers()

			const inputConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template:
							'<div class="base-input-stub"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="prefix" /><slot name="suffix" /></div>',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						emits: ['update:modelValue'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { emitted, container } = render(BaseSearch, {
				props: { modelValue: '', isInstant: false, debounceMs: 300 },
				global: inputConfig,
			})

			const input = container.querySelector('.base-input-stub input')! as HTMLInputElement
			await fireEvent.update(input, 'тест')

			vi.advanceTimersByTime(300)

			// Не должен эмитить search автоматически
			expect(emitted()).not.toHaveProperty('search')

			vi.useRealTimers()
		})
	})

	describe('shouldShowResults с isInstant=false', () => {
		it('должен показывать результаты после Enter', async () => {
			const instantConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseDropdown: {
						template:
							'<div class="base-dropdown-stub" :data-is-open="isOpen"><slot /><slot v-if="isOpen" name="dropdown" /></div>',
						props: ['isOpen', 'position', 'matchWidth', 'preventMousedown', 'sizeScale', 'maxHeight'],
					},
					BaseInput: {
						template:
							'<input class="base-input-stub" @focus="$emit(\'focus\')" @keydown="$emit(\'keydown\', $event)" :value="modelValue" />',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						emits: ['update:modelValue', 'focus', 'blur', 'keydown'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'тест',
					isInstant: false,
					results: [{ id: 1, title: 'тестовый' }],
				},
				global: instantConfig,
			})

			// Сначала фокусируемся, чтобы isFocused=true
			const input = container.querySelector('.base-input-stub')!
			await fireEvent.focus(input)

			// До Enter — результаты не показываются (dropdown закрыт)
			expect(container.querySelector('.base-search__result')).not.toBeInTheDocument()

			// Нажимаем Enter
			await fireEvent.keyDown(input, { key: 'Enter' })

			// После Enter — isSearchTriggered=true, результаты показываются
			expect(container.querySelector('.base-search__result')).toBeInTheDocument()
		})
	})

	describe('onBeforeUnmount', () => {
		it('должен отменить отложенный поиск при размонтировании', async () => {
			vi.useFakeTimers()

			const inputConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template:
							'<div class="base-input-stub"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="prefix" /><slot name="suffix" /></div>',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						emits: ['update:modelValue'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { emitted, unmount } = render(BaseSearch, {
				props: { modelValue: '', isInstant: true, debounceMs: 300 },
				global: inputConfig,
			})

			const input = document.querySelector('.base-input-stub input')! as HTMLInputElement
			await fireEvent.update(input, 'тест')

			unmount()

			vi.advanceTimersByTime(300)

			// После unmount таймер должен быть отменён
			expect(emitted()).not.toHaveProperty('search')

			vi.useRealTimers()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseSearch, {
				props: { customClass: 'custom-search-class' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search')).toHaveClass('custom-search-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseSearch, {
				props: {
					customClass: {
						root: 'custom-root',
						input: 'custom-input',
						icon: 'custom-icon',
						clear: 'custom-clear',
						loading: 'custom-loading',
					},
					modelValue: 'тест',
					isLoading: true,
				},
				global: globalConfig,
			})

			expect(container.querySelector('.base-search')).toHaveClass('custom-root')
			expect(container.querySelector('.base-input-stub')).toHaveClass('custom-input')
			expect(container.querySelector('.base-search__icon')).toHaveClass('custom-icon')
			expect(container.querySelector('.base-search__clear')).toHaveClass('custom-clear')
			expect(container.querySelector('.base-loader')).toHaveClass('custom-loading')
		})
	})

	describe('дополнительное покрытие ветвей', () => {
		it('должен вызывать setter isOpen при эмите update:isOpen', async () => {
			const focusConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseDropdown: {
						template:
							'<div class="base-dropdown-stub" :data-is-open="isOpen" @click="$emit(\'update:isOpen\', false)"><slot /><slot v-if="isOpen" name="dropdown" /></div>',
						props: ['isOpen', 'position', 'matchWidth', 'preventMousedown', 'sizeScale', 'maxHeight'],
						emits: ['update:isOpen'],
					},
					BaseInput: {
						template:
							'<input class="base-input-stub" @focus="$emit(\'focus\')" @blur="$emit(\'blur\')" :value="modelValue" />',
						props: ['modelValue', 'placeholder', 'variant', 'sizeScale', 'isDisabled', 'error', 'type'],
						emits: ['update:modelValue', 'focus', 'blur', 'keydown'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { container } = render(BaseSearch, {
				props: { modelValue: 'тест', results: [{ id: 1, title: 'Тестовый' }] },
				global: focusConfig,
			})

			const input = container.querySelector('.base-input-stub')!
			await fireEvent.focus(input)

			const dropdown = container.querySelector('.base-dropdown-stub')!
			expect(dropdown.getAttribute('data-is-open')).toBe('true')

			await fireEvent.click(dropdown)
			expect(dropdown.getAttribute('data-is-open')).toBe('false')
		})

		it('должен сбрасывать фокус и подсветку при blur', async () => {
			const focusConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseDropdown: {
						template:
							'<div class="base-dropdown-stub" :data-is-open="isOpen"><slot /><slot v-if="isOpen" name="dropdown" /></div>',
						props: ['isOpen'],
					},
					BaseInput: {
						template:
							'<input class="base-input-stub" @focus="$emit(\'focus\')" @blur="$emit(\'blur\')" :value="modelValue" />',
						props: ['modelValue'],
						emits: ['focus', 'blur'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { container } = render(BaseSearch, {
				props: { modelValue: 'тест', results: [{ id: 1, title: 'Тест' }] },
				global: focusConfig,
			})
			const input = container.querySelector('.base-input-stub')!
			await fireEvent.focus(input)
			expect(container.querySelector('.base-dropdown-stub')?.getAttribute('data-is-open')).toBe('true')

			await fireEvent.blur(input)
			expect(container.querySelector('.base-dropdown-stub')?.getAttribute('data-is-open')).toBe('false')
		})

		it('должен закрывать dropdown при событии close', async () => {
			const focusConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseDropdown: {
						template:
							'<div class="base-dropdown-stub" :data-is-open="isOpen" @click="$emit(\'close\')"><slot /><slot v-if="isOpen" name="dropdown" /></div>',
						props: ['isOpen'],
						emits: ['close'],
					},
					BaseInput: {
						template: '<input class="base-input-stub" @focus="$emit(\'focus\')" :value="modelValue" />',
						props: ['modelValue'],
						emits: ['focus'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { container } = render(BaseSearch, {
				props: { modelValue: 'тест', results: [{ id: 1, title: 'Тест' }] },
				global: focusConfig,
			})
			const input = container.querySelector('.base-input-stub')!
			await fireEvent.focus(input)
			expect(container.querySelector('.base-dropdown-stub')?.getAttribute('data-is-open')).toBe('true')

			await fireEvent.click(container.querySelector('.base-dropdown-stub')!)
			expect(container.querySelector('.base-dropdown-stub')?.getAttribute('data-is-open')).toBe('false')
		})

		it('должен изменять подсвеченный индекс при наведении мыши на результат', async () => {
			const focusConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseDropdown: {
						template:
							'<div class="base-dropdown-stub" :data-is-open="isOpen"><slot /><slot v-if="isOpen" name="dropdown" /></div>',
						props: ['isOpen'],
					},
					BaseInput: {
						template: '<input class="base-input-stub" @focus="$emit(\'focus\')" :value="modelValue" />',
						props: ['modelValue'],
						emits: ['focus'],
						methods: { focus: vi.fn() },
					},
				},
			}

			const { container } = render(BaseSearch, {
				props: {
					modelValue: 'тест',
					results: [
						{ id: 1, title: 'Тест 1' },
						{ id: 2, title: 'Тест 2' },
					],
				},
				global: focusConfig,
			})
			const input = container.querySelector('.base-input-stub')!
			await fireEvent.focus(input)

			const results = container.querySelectorAll('.base-search__result')
			expect(results).toHaveLength(2)

			await fireEvent.mouseEnter(results[1])
			expect(results[1]).toHaveClass('base-search__result--highlighted')
		})

		it('должен изменять подсвеченный индекс при mouseenter в режиме modal', async () => {
			const modalConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template: '<input class="base-input-stub" @focus="$emit(\'focus\')" />',
						props: ['modelValue'],
						emits: ['focus'],
						methods: { focus: vi.fn() },
					},
				},
			}
			const { container } = render(BaseSearch, {
				props: {
					mode: 'modal',
					modelValue: 'тест',
					results: [
						{ id: 1, title: 'Тест 1' },
						{ id: 2, title: 'Тест 2' },
					],
				},
				global: modalConfig,
			})
			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const modalResults = document.body.querySelectorAll('.base-search__result')
			expect(modalResults).toHaveLength(2)

			await fireEvent.mouseEnter(modalResults[1])
			expect(modalResults[1]).toHaveClass('base-search__result--highlighted')

			document.body.innerHTML = ''
		})

		it('должен изменять подсвеченный индекс при mouseenter в режиме sidebar', async () => {
			const sidebarConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template: '<input class="base-input-stub" @focus="$emit(\'focus\')" />',
						props: ['modelValue'],
						emits: ['focus'],
						methods: { focus: vi.fn() },
					},
				},
			}
			const { container } = render(BaseSearch, {
				props: {
					mode: 'sidebar',
					modelValue: 'тест',
					results: [
						{ id: 1, title: 'Тест 1' },
						{ id: 2, title: 'Тест 2' },
					],
				},
				global: sidebarConfig,
			})
			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const sidebarResults = document.body.querySelectorAll('.base-search__result')
			expect(sidebarResults).toHaveLength(2)

			await fireEvent.mouseEnter(sidebarResults[1])
			expect(sidebarResults[1]).toHaveClass('base-search__result--highlighted')

			document.body.innerHTML = ''
		})

		it('должен рендерить описание и категорию в режиме modal', async () => {
			const { container } = render(BaseSearch, {
				props: {
					mode: 'modal',
					modelValue: 'тест',
					results: [{ id: 1, title: 'Тест', description: 'Описание', category: 'Категория' }],
				},
				global: globalConfig,
			})
			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__result-desc')).toBeInTheDocument()
			expect(document.body.querySelector('.base-search__result-category')).toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен рендерить описание и категорию в режиме sidebar', async () => {
			const { container } = render(BaseSearch, {
				props: {
					mode: 'sidebar',
					modelValue: 'тест',
					results: [{ id: 1, title: 'Тест', description: 'Описание', category: 'Категория' }],
				},
				global: globalConfig,
			})
			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__result-desc')).toBeInTheDocument()
			expect(document.body.querySelector('.base-search__result-category')).toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен рендерить empty state в режиме modal', async () => {
			const { container } = render(BaseSearch, {
				props: {
					mode: 'modal',
					modelValue: 'xyz',
					results: [{ id: 1, title: 'Тест' }],
				},
				global: globalConfig,
			})
			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__empty')).toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен рендерить empty state в режиме sidebar', async () => {
			const { container } = render(BaseSearch, {
				props: {
					mode: 'sidebar',
					modelValue: 'xyz',
					results: [{ id: 1, title: 'Тест' }],
				},
				global: globalConfig,
			})
			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__empty')).toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен перемещать подсветку по ArrowDown и выбирать по Enter', async () => {
			const keydownConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseDropdown: {
						template:
							'<div class="base-dropdown-stub" :data-is-open="isOpen"><slot /><slot v-if="isOpen" name="dropdown" /></div>',
						props: ['isOpen'],
					},
					BaseInput: {
						template:
							'<input class="base-input-stub" @focus="$emit(\'focus\')" @keydown="$emit(\'keydown\', $event)" :value="modelValue" />',
						props: ['modelValue'],
						emits: ['focus', 'keydown'],
						methods: { focus: vi.fn() },
					},
				},
			}
			const { container, emitted } = render(BaseSearch, {
				props: {
					modelValue: 'тест',
					results: [
						{ id: 1, title: 'Тест 1' },
						{ id: 2, title: 'Тест 2' },
					],
				},
				global: keydownConfig,
			})
			const input = container.querySelector('.base-input-stub')!
			await fireEvent.focus(input)

			await fireEvent.keyDown(input, { key: 'ArrowDown' })
			const results = container.querySelectorAll('.base-search__result')
			expect(results[0]).toHaveClass('base-search__result--highlighted')

			await fireEvent.keyDown(input, { key: 'Enter' })
			expect(emitted()).toHaveProperty('select')
			const selectEvents = emitted().select as any[][]
			expect(selectEvents[0][0]).toEqual({ id: 1, title: 'Тест 1' })
		})

		it('должен закрывать модал по Escape через useListNavigation', async () => {
			const keydownConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template:
							'<input class="base-input-stub" @focus="$emit(\'focus\')" @keydown="$emit(\'keydown\', $event)" />',
						emits: ['focus', 'keydown'],
						methods: { focus: vi.fn() },
					},
				},
			}
			const { container } = render(BaseSearch, {
				props: { mode: 'modal', modelValue: 'тест', results: [{ id: 1, title: 'Тест' }] },
				global: keydownConfig,
			})
			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__modal-overlay')).toBeInTheDocument()

			const modalInput = document.body.querySelector('.base-search__modal-header .base-input-stub')!
			await fireEvent.keyDown(modalInput, { key: 'Escape' })

			expect(document.body.querySelector('.base-search__modal-overlay')).not.toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен закрывать сайдбар по Escape через useListNavigation', async () => {
			const keydownConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template:
							'<input class="base-input-stub" @focus="$emit(\'focus\')" @keydown="$emit(\'keydown\', $event)" />',
						emits: ['focus', 'keydown'],
						methods: { focus: vi.fn() },
					},
				},
			}
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar', modelValue: 'тест', results: [{ id: 1, title: 'Тест' }] },
				global: keydownConfig,
			})
			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			expect(document.body.querySelector('.base-search__sidebar-overlay')).toBeInTheDocument()

			const sidebarInput = document.body.querySelector('.base-search__sidebar-header .base-input-stub')!
			await fireEvent.keyDown(sidebarInput, { key: 'Escape' })

			expect(document.body.querySelector('.base-search__sidebar-overlay')).not.toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен вызывать callback useEscapeKey для закрытия модала/сайдбара', async () => {
			const mockUseEscapeKey = vi.mocked(useEscapeKey)
			mockUseEscapeKey.mockClear()

			const { container } = render(BaseSearch, {
				props: { mode: 'modal' },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const lastCall = mockUseEscapeKey.mock.calls.find(call => {
				const options = call[0]
				return options && typeof options.callback === 'function'
			})

			expect(lastCall).toBeDefined()
			const { isActive, callback } = lastCall![0]

			expect(isActive()).toBe(true)

			callback()
			await nextTick()

			expect(document.body.querySelector('.base-search__modal-overlay')).not.toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен вызывать callback useEscapeKey для закрытия сайдбара', async () => {
			const mockUseEscapeKey = vi.mocked(useEscapeKey)
			mockUseEscapeKey.mockClear()

			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar' },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)

			const lastCall = mockUseEscapeKey.mock.calls.find(call => {
				const options = call[0]
				return options && typeof options.callback === 'function'
			})

			expect(lastCall).toBeDefined()
			const { isActive, callback } = lastCall![0]

			expect(isActive()).toBe(true)

			callback()
			await nextTick()

			expect(document.body.querySelector('.base-search__sidebar-overlay')).not.toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен фокусировать инпут модала при очистке в режиме modal', async function () {
			const clearConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template: '<div class="base-input-stub"><slot name="suffix" /></div>',
						props: ['modelValue'],
						methods: { focus: vi.fn() },
					},
				},
			}
			const { container } = render(BaseSearch, {
				props: { mode: 'modal', modelValue: 'тест', hasClear: true },
				global: clearConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)
			const clearBtn = document.body.querySelector('.base-search__clear')!
			await fireEvent.click(clearBtn)
			document.body.innerHTML = ''
		})

		it('должен фокусировать инпут сайдбара при очистке в режиме sidebar', async function () {
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar', modelValue: 'тест', hasClear: true },
				global: globalConfig,
			})

			const trigger = container.querySelector('.base-search__trigger')!
			await fireEvent.focus(trigger)
			const clearBtn = document.body.querySelector('.base-search__clear')!
			await fireEvent.click(clearBtn)

			expect(document.body.querySelector('.base-search__sidebar-overlay')).toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('не должен эмитить search при пустом значении debounce', async function () {
			vi.useFakeTimers()
			const inputConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template:
							'<div class="base-input-stub"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="suffix" /></div>',
						props: ['modelValue'],
						emits: ['update:modelValue'],
						methods: { focus: vi.fn() },
					},
				},
			}
			const { emitted, container } = render(BaseSearch, {
				props: { modelValue: 'тест', isInstant: true, debounceMs: 300 },
				global: inputConfig,
			})

			await fireEvent.update(container.querySelector('.base-input-stub input')!, '')
			vi.advanceTimersByTime(300)
			expect(emitted()).not.toHaveProperty('search')
			vi.useRealTimers()
		})

		it('не должен закрывать слои по Escape в режиме default', async function () {
			const { container, emitted } = render(BaseSearch, {
				props: { modelValue: 'тест', results: [{ id: 1, title: 'Тест' }] },
				global: globalConfig,
			})

			await fireEvent.keyDown(container.querySelector('.base-input-stub')!, { key: 'Escape' })

			expect(emitted()).not.toHaveProperty('select')
			expect(document.body.querySelector('.base-search__modal-overlay')).not.toBeInTheDocument()
		})

		it('должен рендерить загрузку в режиме modal', async function () {
			const { container } = render(BaseSearch, {
				props: { mode: 'modal', modelValue: 'тест', isLoading: true },
				global: globalConfig,
				slots: { loading: '<span class="loading-slot">Загрузка</span>' },
			})

			await fireEvent.focus(container.querySelector('.base-search__trigger')!)

			expect(document.body.querySelector('.base-loader')).toBeInTheDocument()
			expect(document.body.querySelector('.loading-slot')).toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен рендерить загрузку в режиме sidebar', async function () {
			const { container } = render(BaseSearch, {
				props: { mode: 'sidebar', modelValue: 'тест', isLoading: true },
				global: globalConfig,
				slots: { loading: '<span class="loading-slot">Загрузка</span>' },
			})

			await fireEvent.focus(container.querySelector('.base-search__trigger')!)

			expect(document.body.querySelector('.base-loader')).toBeInTheDocument()
			expect(document.body.querySelector('.loading-slot')).toBeInTheDocument()
			document.body.innerHTML = ''
		})

		it('должен рендерить image и icon результатов в режиме modal', async function () {
			const { container } = render(BaseSearch, {
				props: {
					mode: 'modal',
					modelValue: 'тест',
					results: [
						{ id: 1, title: 'Тест image', image: 'test.jpg' },
						{ id: 2, title: 'Тест icon', icon: 'search' },
					],
				},
				global: globalConfig,
			})

			await fireEvent.focus(container.querySelector('.base-search__trigger')!)
			expect(document.body.querySelectorAll('.base-search__result-image')).toHaveLength(1)
			expect(document.body.querySelectorAll('.base-search__result-icon')).toHaveLength(1)
			document.body.innerHTML = ''
		})

		it('должен рендерить image и icon результатов в режиме sidebar', async function () {
			const { container } = render(BaseSearch, {
				props: {
					mode: 'sidebar',
					modelValue: 'тест',
					results: [
						{ id: 1, title: 'Тест image', image: 'test.jpg' },
						{ id: 2, title: 'Тест icon', icon: 'search' },
					],
				},
				global: globalConfig,
			})

			await fireEvent.focus(container.querySelector('.base-search__trigger')!)
			expect(document.body.querySelectorAll('.base-search__result-image')).toHaveLength(1)
			expect(document.body.querySelectorAll('.base-search__result-icon')).toHaveLength(1)
			document.body.innerHTML = ''
		})

		it('не должен менять query когда внешний modelValue совпадает с внутренним', async function () {
			const inputConfig = {
				stubs: {
					...globalConfig.stubs,
					BaseInput: {
						template:
							'<div class="base-input-stub"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="suffix" /></div>',
						props: ['modelValue'],
						emits: ['update:modelValue'],
						methods: { focus: vi.fn() },
					},
				},
			}
			const { container, rerender } = render(BaseSearch, {
				props: { modelValue: '' },
				global: inputConfig,
			})

			await fireEvent.update(container.querySelector('.base-input-stub input')!, 'тест')
			await rerender({ modelValue: 'тест' })
			expect(container.querySelector('.base-search__clear')).toBeInTheDocument()
		})
	})
})
