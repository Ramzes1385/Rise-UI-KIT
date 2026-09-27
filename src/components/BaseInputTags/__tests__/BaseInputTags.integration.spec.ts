/**
 * Integration-тесты BaseInputTags: добавление Enter, разделителем, вставкой и при выходе; проверки; клавиатура тегов.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { nextTick, ref } from 'vue'
import BaseInputTags from '../ui/BaseInputTags.vue'

function renderModel(initial: string[] = [], props: Record<string, unknown> = {}) {
	const model = ref<string[]>(initial)
	const onAdd = vi.fn()
	const onRemove = vi.fn()
	const onBlur = vi.fn()
	const onFocus = vi.fn()
	const utils = render({
		components: { BaseInputTags },
		setup: () => ({ model, props, onAdd, onRemove, onBlur, onFocus }),
		template: '<form @submit.prevent><BaseInputTags v-model="model" v-bind="props" aria-label="Теги" @add="onAdd" @remove="onRemove" @blur="onBlur" @focus="onFocus" /><button>Ок</button></form>',
	})
	return { ...utils, model, onAdd, onRemove, onBlur, onFocus, field: screen.getByRole('textbox', { name: 'Теги' }) }
}

describe('BaseInputTags integration', () => {
	it('Enter и запятая добавляют тег, повтор не добавляется, объявление для скринридера', async () => {
		const user = userEvent.setup()
		const { field, model, onAdd } = renderModel()

		await user.type(field, 'Vue{Enter}Vite,Vue,')

		expect(model.value).toEqual(['Vue', 'Vite'])
		expect(onAdd).toHaveBeenCalledTimes(2)
		expect(field).toHaveValue('')
		expect(screen.getByRole('status')).toHaveTextContent('Добавлено: Vite')
	})

	it('пустой Enter не перехватывается (форма отправляется); свои разделители', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel([], { separators: [';'] })

		const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		field.dispatchEvent(enter)
		expect(enter.defaultPrevented).toBe(false)
		await user.type(field, 'a,b;c;')
		expect(model.value).toEqual(['a,b', 'c'])
	})

	it('вставка списка добавляет несколько тегов; вставка без разделителей — обычная', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel(['Vue'])

		field.focus()
		await user.paste('Pinia, Vite\nVitest')
		expect(model.value).toEqual(['Vue', 'Pinia', 'Vite', 'Vitest'])

		await user.paste('Nuxt')
		expect(field).toHaveValue('Nuxt')
		expect(model.value).toHaveLength(4)
	})

	it('validate отклоняет тег — текст остаётся в поле; maxTags ограничивает', async () => {
		const user = userEvent.setup()
		const validate = (tag: string) => tag.includes('@')
		const { field, model } = renderModel(['a@x.ru'], { validate, maxTags: 2 })

		await user.type(field, 'boris{Enter}')
		expect(field).toHaveValue('boris')
		await user.clear(field)
		await user.type(field, 'b@x.ru,c@x.ru,')
		expect(model.value).toEqual(['a@x.ru', 'b@x.ru'])
	})

	it('отклонённая часть при вводе с разделителем остаётся в поле вместе с хвостом', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel([], { validate: (tag: string) => tag.length > 2 })

		await user.type(field, 'ab,xyz')
		await fireEvent.update(field, 'ab,xyz,q')
		expect(model.value).toEqual(['xyz'])
		expect(field).toHaveValue('ab,q')
	})

	it('при выходе из поля набранный текст становится тегом; isAddOnBlur=false — нет', async () => {
		const user = userEvent.setup()
		const on = renderModel()
		await user.type(on.field, 'Nuxt')
		await user.tab()
		expect(on.model.value).toEqual(['Nuxt'])
		expect(on.onBlur).toHaveBeenCalled()
		expect(on.onFocus).toHaveBeenCalled()
		on.unmount()

		const off = renderModel([], { isAddOnBlur: false })
		await user.type(off.field, 'Nuxt')
		await user.tab()
		expect(off.model.value).toEqual([])
	})

	it('клик по крестику удаляет тег и возвращает фокус в строку ввода', async () => {
		const user = userEvent.setup()
		const { field, model, onRemove } = renderModel(['Vue', 'Vite'])

		await user.click(screen.getByRole('button', { name: 'Удалить Vue' }))

		expect(model.value).toEqual(['Vite'])
		expect(onRemove).toHaveBeenCalledWith('Vue')
		expect(field).toHaveFocus()
		expect(screen.getByRole('status')).toHaveTextContent('Удалено: Vue')
	})

	it('клавиатура: ← и Backspace в пустой строке — к последнему тегу, ←/→/Home/End/Escape между тегами и строкой', async () => {
		const user = userEvent.setup()
		const { field } = renderModel(['a', 'b', 'c'])

		field.focus()
		await user.keyboard('{ArrowLeft}')
		expect(screen.getByRole('button', { name: 'Удалить c' })).toHaveFocus()
		await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}')
		expect(screen.getByRole('button', { name: 'Удалить a' })).toHaveFocus()
		await user.keyboard('{ArrowRight}')
		expect(screen.getByRole('button', { name: 'Удалить b' })).toHaveFocus()
		await user.keyboard('{End}')
		expect(field).toHaveFocus()
		await user.keyboard('{Backspace}')
		expect(screen.getByRole('button', { name: 'Удалить c' })).toHaveFocus()
		await user.keyboard('{Home}')
		expect(screen.getByRole('button', { name: 'Удалить a' })).toHaveFocus()
		await user.keyboard('{Escape}')
		expect(field).toHaveFocus()
		screen.getByRole('button', { name: 'Удалить c' }).focus()
		await user.keyboard('{ArrowRight}')
		expect(field).toHaveFocus()
		await user.keyboard('x{ArrowLeft}')
		expect(field).toHaveFocus()
	})

	it('Backspace на теге — удаление и фокус на тег слева, Delete — на тег справа, последний тег — фокус в строку', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel(['a', 'b', 'c'])

		screen.getByRole('button', { name: 'Удалить b' }).focus()
		await user.keyboard('{Backspace}')
		await nextTick()
		expect(model.value).toEqual(['a', 'c'])
		expect(screen.getByRole('button', { name: 'Удалить a' })).toHaveFocus()

		await user.keyboard('{Delete}')
		await nextTick()
		expect(model.value).toEqual(['c'])
		expect(screen.getByRole('button', { name: 'Удалить c' })).toHaveFocus()

		await user.keyboard('{Delete}')
		expect(model.value).toEqual([])
		expect(field).toHaveFocus()
	})

	it('другие клавиши на теге не перехватываются; только чтение — клавиши строки не ведут к тегам', async () => {
		const user = userEvent.setup()
		const editable = renderModel(['a'])
		const tab = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true })
		screen.getByRole('button', { name: 'Удалить a' }).dispatchEvent(tab)
		expect(tab.defaultPrevented).toBe(false)
		editable.unmount()

		const readonly = renderModel(['a'], { isReadonly: true })
		readonly.field.focus()
		await user.keyboard('{ArrowLeft}{Enter}')
		expect(readonly.field).toHaveFocus()
	})

	it('методы через ref', () => {
		const tagsRef = ref<InstanceType<typeof BaseInputTags> | null>(null)
		render({
			components: { BaseInputTags },
			setup: () => ({ tagsRef }),
			template: '<BaseInputTags ref="tagsRef" aria-label="Теги" />',
		})

		tagsRef.value!.focus()
		expect(screen.getByRole('textbox', { name: 'Теги' })).toHaveFocus()
		tagsRef.value!.blur()
		expect(tagsRef.value!.validate()).toBe(true)
		tagsRef.value!.reset()
	})
})
