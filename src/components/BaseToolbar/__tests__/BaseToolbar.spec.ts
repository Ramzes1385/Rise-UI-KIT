import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import BaseToolbar from '../ui/BaseToolbar.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseToolbar', () => {
	it('role="toolbar" с именем и ориентацией; в порядке Tab первый доступный элемент', () => {
		render(BaseToolbar, {
			props: { ariaLabel: 'Форматирование' },
			slots: {
				default:
					'<button disabled>Отменить</button><button>Полужирный</button><button>Курсив</button><div role="button" tabindex="0">Цвет</div>',
			},
		})

		const toolbar = screen.getByRole('toolbar', { name: 'Форматирование' })
		expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal')
		expect(screen.getByRole('button', { name: 'Полужирный' })).toHaveAttribute('tabindex', '0')
		expect(screen.getByRole('button', { name: 'Курсив' })).toHaveAttribute('tabindex', '-1')
		expect(screen.getByRole('button', { name: 'Цвет' })).toHaveAttribute('tabindex', '-1')
	})

	it('элемент в порядке Tab отключили или убрали — им становится первый доступный; пустая панель не ломается', async () => {
		const disabled = ref(false)
		const shown = ref(true)
		render({
			components: { BaseToolbar },
			setup: () => ({ disabled, shown }),
			template:
				'<BaseToolbar aria-label="Панель"><button :disabled="disabled">A</button><button v-if="shown">B</button></BaseToolbar>',
		})

		disabled.value = true
		await nextTick()
		await new Promise(resolve => setTimeout(resolve))
		expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('tabindex', '0')

		shown.value = false
		await nextTick()
		await new Promise(resolve => setTimeout(resolve))
		expect(screen.getByRole('button', { name: 'A' })).toBeDisabled()
	})

	it('без элементов и без имени — просто панель', () => {
		render(BaseToolbar, { props: { orientation: 'vertical' } })

		expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical')
	})
})
