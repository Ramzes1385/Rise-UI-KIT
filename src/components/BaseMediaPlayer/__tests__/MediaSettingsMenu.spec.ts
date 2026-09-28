import '@testing-library/jest-dom/vitest'
import MediaSettingsMenu from '../ui/MediaSettingsMenu.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { useMediaSettingsMenu } from '../model/useMediaSettingsMenu'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { MediaSettingsMenuProps } from '../types/MediaSettingsMenu.types'

const HD = { src: '/media/hd.webm', label: '720p' }
const SD = { src: '/media/sd.webm', label: '360p' }

function menu(props: Partial<MediaSettingsMenuProps> = {}) {
	const emit = vi.fn()
	const { items, label } = useMediaSettingsMenu({ rates: [0.5, 1, 1.5], rate: 1, qualities: [HD, SD], activeSrc: SD.src, ...props }, emit)
	return { items: items.value, label: label.value, emit }
}

function children(item: DropdownMenuItem): DropdownMenuItem[] {
	return item.children as DropdownMenuItem[]
}

describe('MediaSettingsMenu', () => {
	it('скорость: «Обычная» для 1, остальные — числом по правилам языка; текущая отмечена', () => {
		const { items, label } = menu()
		const [speed] = items

		expect(label).toBe('Настройки')
		expect(speed.label).toBe('Скорость: Обычная')
		expect(children(speed).map(item => [item.label, item.isChecked])).toEqual([
			['0,5×', false],
			['Обычная', true],
			['1,5×', false],
		])
	})

	it('качество — только если вариантов хотя бы два; выбор сообщается событиями', () => {
		const { items, emit } = menu()
		const [speed, quality] = items

		expect(quality.label).toBe('Качество: 360p')
		children(speed)[2].onUpdateChecked?.(true)
		children(quality)[0].onUpdateChecked?.(true)
		expect(emit.mock.calls).toEqual([
			['select-rate', 1.5],
			['select-quality', HD],
		])
		expect(menu({ qualities: [HD] }).items).toHaveLength(1)
		expect(menu({ activeSrc: undefined }).items[1].label).toBe('Качество')
	})

	it('кнопка «Настройки» открывает меню', async () => {
		render(MediaSettingsMenu, { props: { rates: [1, 2], rate: 1, qualities: [] } })

		await fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))
		expect(await screen.findByRole('menuitem', { name: /Скорость/ })).toBeInTheDocument()
	})
})
