import '@testing-library/jest-dom/vitest'
import { h, ref } from 'vue'
import BaseSignaturePad from '../ui/BaseSignaturePad.vue'
import { BaseFormField } from '@components/BaseFormField'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseSignaturePad integration', () => {
	it('v-model: штрих, отмена и очистка меняют значение родителя', async () => {
		const strokes = ref([[{ x: 1, y: 1 }]])
		render({
			setup: () => () =>
				h(BaseSignaturePad, {
					modelValue: strokes.value,
					'onUpdate:modelValue': (value: typeof strokes.value) => (strokes.value = value),
				}),
		})
		await fireEvent.pointerDown(screen.getByRole('img'), { button: 0, clientX: 10, clientY: 10 })
		await fireEvent.pointerUp(window)
		expect(strokes.value).toHaveLength(2)
		expect(screen.getByRole('img', { name: 'Подпись: 2 штриха' })).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Отменить штрих' }))
		expect(strokes.value).toHaveLength(1)
		await fireEvent.click(screen.getByRole('button', { name: 'Очистить' }))
		expect(strokes.value).toEqual([])
		expect(screen.getByRole('img', { name: 'Подписи нет' })).toBeInTheDocument()
	})

	it('в BaseFormField группа получает имя от подписи поля и описание от его ошибки', () => {
		render({
			setup: () => () =>
				h(BaseFormField, { label: 'Подпись арендатора', error: 'Нужна подпись' }, { default: () => h(BaseSignaturePad) }),
		})
		const groups = screen.getAllByRole('group', { name: 'Подпись арендатора' })
		const pad = groups.find(group => group.classList.contains('base-signature-pad'))
		expect(pad).toHaveAccessibleDescription('Нужна подпись')
	})
})
