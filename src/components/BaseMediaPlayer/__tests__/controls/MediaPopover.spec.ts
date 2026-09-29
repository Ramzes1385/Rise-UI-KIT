import '@testing-library/jest-dom/vitest'
import { defineComponent, h, nextTick } from 'vue'
import MediaPopover from '../../ui/controls/MediaPopover.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import MediaMenuPanel from '../../ui/controls/MediaMenuPanel.vue'
import type { MediaMenuList } from '../../types/controls/MediaMenu.types'

function menu(select = vi.fn()): MediaMenuList {
	return {
		title: 'Субтитры',
		items: [
			{ id: 'off', label: 'Выкл', isChecked: false, onSelect: select },
			{ id: 'ru', label: 'Русский', isChecked: true, onSelect: select },
			{
				id: 'style',
				label: 'Вид субтитров',
				children: {
					title: 'Вид субтитров',
					items: [
						{
							id: 'size',
							label: 'Размер',
							hint: '100 %',
							children: {
								title: 'Размер',
								isKeptOpen: true,
								items: [
									{ id: '0', label: '75 %', isChecked: false, onSelect: select },
									{ id: '1', label: '100 %', isChecked: true },
								],
							},
						},
					],
				},
			},
			{ id: 'upload', label: 'Загрузить файл…' },
		],
	}
}

function renderPanel(list = menu()) {
	return render(MediaMenuPanel, { props: { menu: list } })
}

const Host = defineComponent({
	setup() {
		return () =>
			h('div', [
				h(
					MediaPopover,
					{ position: 'top-start' },
					{
						default: ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) =>
							h('button', { type: 'button', 'aria-expanded': isOpen, onClick: toggle }, 'Меню'),
						panel: ({ close }: { close: () => void }) => h('button', { type: 'button', onClick: close }, 'Внутри'),
					},
				),
				h('button', { type: 'button' }, 'Снаружи'),
			])
	},
})

describe('меню плеера без каскадов', () => {
	it('корневой список: заголовок, отмеченный пункт с галочкой и фокусом, значение и стрелка у вложенного', async () => {
		renderPanel()
		await nextTick()
		await nextTick()

		expect(screen.getByRole('menu', { name: 'Субтитры' })).toBeInTheDocument()
		expect(screen.getByRole('menuitemradio', { name: 'Русский' })).toHaveAttribute('aria-checked', 'true')
		expect(screen.getByRole('menuitemradio', { name: 'Русский' })).toHaveFocus()
		expect(screen.getByRole('menuitem', { name: 'Вид субтитров' }).querySelector('.base-media-player__menu-arrow')).not.toBeNull()
		expect(screen.getByRole('menuitem', { name: 'Загрузить файл…' })).not.toHaveAttribute('aria-checked')
	})

	it('вложенный список открывается на месте, «Назад» возвращает; выбор в настройках возвращает к списку выше', async () => {
		const select = vi.fn()
		const { emitted } = renderPanel(menu(select))

		await fireEvent.click(screen.getByRole('menuitem', { name: 'Вид субтитров' }))
		await nextTick()
		expect(screen.getByRole('menu', { name: 'Вид субтитров' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Назад: Вид субтитров' })).toHaveFocus()
		await fireEvent.click(screen.getByRole('menuitem', { name: 'Размер 100 %' }))
		await nextTick()
		await fireEvent.click(screen.getByRole('menuitemradio', { name: '75 %' }))
		await nextTick()
		expect(select).toHaveBeenCalledOnce()
		expect(screen.getByRole('menu', { name: 'Вид субтитров' })).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('menuitem', { name: 'Назад: Вид субтитров' }))
		await nextTick()
		expect(screen.getByRole('menu', { name: 'Субтитры' })).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('menuitemradio', { name: 'Выкл' }))
		await fireEvent.click(screen.getByRole('menuitem', { name: 'Загрузить файл…' }))
		expect(emitted('close')).toHaveLength(2)
	})

	it('клавиатура: стрелки по кругу, Home и End, вправо открывает, влево назад, Tab закрывает', async () => {
		const { emitted } = renderPanel()
		await nextTick()
		await nextTick()
		const key = async (name: string): Promise<void> => {
			await fireEvent.keyDown(document.activeElement as HTMLElement, { key: name })
		}

		await key('ArrowDown')
		expect(screen.getByRole('menuitem', { name: 'Вид субтитров' })).toHaveFocus()
		await key('ArrowRight')
		await nextTick()
		expect(screen.getByRole('menu', { name: 'Вид субтитров' })).toBeInTheDocument()
		await key('ArrowLeft')
		await nextTick()
		expect(screen.getByRole('menu', { name: 'Субтитры' })).toBeInTheDocument()
		await key('End')
		expect(screen.getByRole('menuitem', { name: 'Загрузить файл…' })).toHaveFocus()
		await key('ArrowDown')
		expect(screen.getByRole('menuitemradio', { name: 'Выкл' })).toHaveFocus()
		await key('ArrowUp')
		expect(screen.getByRole('menuitem', { name: 'Загрузить файл…' })).toHaveFocus()
		await key('Home')
		await key('ArrowRight')
		await key('ArrowLeft')
		await key('a')
		expect(screen.getByRole('menuitemradio', { name: 'Выкл' })).toHaveFocus()
		await key('Tab')
		expect(emitted('close')).toHaveLength(1)
	})

	it('размер панели — по текущему списку', async () => {
		const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(180)
		const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(150)
		const { container } = renderPanel()
		await nextTick()
		await nextTick()

		expect((container.querySelector('.base-media-player__menu') as HTMLElement).style.width).toBe('180px')
		expect((container.querySelector('.base-media-player__menu') as HTMLElement).style.height).toBe('150px')
		width.mockRestore()
		height.mockRestore()
	})
})

describe('всплывающая панель плеера', () => {
	it('кнопка открывает и закрывает; щелчок снаружи закрывает; Escape закрывает и возвращает фокус на кнопку', async () => {
		const { container, unmount } = render(Host)
		const trigger = screen.getByRole('button', { name: 'Меню' })

		await fireEvent.click(trigger)
		expect(screen.getByRole('button', { name: 'Внутри' })).toBeInTheDocument()
		expect(container.querySelector('.base-media-player__popover--top-start')).not.toBeNull()
		await fireEvent.click(trigger)
		expect(screen.queryByRole('button', { name: 'Внутри' })).toBeNull()

		await fireEvent.click(trigger)
		await fireEvent.pointerDown(screen.getByRole('button', { name: 'Внутри' }))
		expect(screen.getByRole('button', { name: 'Внутри' })).toBeInTheDocument()
		await fireEvent.pointerDown(screen.getByRole('button', { name: 'Снаружи' }))
		expect(screen.queryByRole('button', { name: 'Внутри' })).toBeNull()

		await fireEvent.click(trigger)
		screen.getByRole('button', { name: 'Внутри' }).focus()
		await fireEvent.keyDown(screen.getByRole('button', { name: 'Внутри' }), { key: 'Escape' })
		expect(screen.queryByRole('button', { name: 'Внутри' })).toBeNull()
		expect(trigger).toHaveFocus()
		await fireEvent.keyDown(trigger, { key: 'Escape' })
		unmount()
	})

	it('фокус ушёл за пределы — панель закрывается; фокус без цели — остаётся; закрыть из панели', async () => {
		render(Host)
		const trigger = screen.getByRole('button', { name: 'Меню' })

		await fireEvent.click(trigger)
		await fireEvent.focusOut(trigger, { relatedTarget: null })
		expect(screen.getByRole('button', { name: 'Внутри' })).toBeInTheDocument()
		await fireEvent.focusOut(trigger, { relatedTarget: screen.getByRole('button', { name: 'Внутри' }) })
		expect(screen.getByRole('button', { name: 'Внутри' })).toBeInTheDocument()
		await fireEvent.focusOut(trigger, { relatedTarget: screen.getByRole('button', { name: 'Снаружи' }) })
		expect(screen.queryByRole('button', { name: 'Внутри' })).toBeNull()

		await fireEvent.click(trigger)
		await fireEvent.click(screen.getByRole('button', { name: 'Внутри' }))
		expect(screen.queryByRole('button', { name: 'Внутри' })).toBeNull()
	})
})
