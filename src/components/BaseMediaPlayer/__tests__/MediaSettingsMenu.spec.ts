import '@testing-library/jest-dom/vitest'
import { formatNumber } from '@/locales/state'
import MediaSettingsMenu from '../ui/MediaSettingsMenu.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { useMediaSettingsMenu } from '../model/useMediaSettingsMenu'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { MediaSettingsMenuProps } from '../types/MediaSettingsMenu.types'

const HD = { id: '/media/hd.webm', label: '720p' }
const SD = { id: '/media/sd.webm', label: '360p' }

const RU = { id: '/subs/ru.vtt', label: 'Русский' }

const EN = { id: '/subs/en.srt', label: 'English' }

const STYLE = { size: 100, color: 'white', background: 'semi', position: { x: 50, y: 86 } } as const

function menu(props: Partial<MediaSettingsMenuProps> = {}) {
	const emit = vi.fn()
	const { items, label } = useMediaSettingsMenu(
		{ rates: [0.5, 1, 1.5], rate: 1, qualities: [HD, SD], activeQualityId: SD.id, ...props },
		emit,
	)
	return { items: items.value, label: label.value, emit }
}

function children(item: DropdownMenuItem): DropdownMenuItem[] {
	return item.children as DropdownMenuItem[]
}

function groups(item: DropdownMenuItem): DropdownMenuItem[][] {
	return item.children as DropdownMenuItem[][]
}

function radios(group: DropdownMenuItem[]): Array<[string | undefined, boolean | undefined]> {
	return group.filter(item => item.type === 'radio').map(item => [item.label, item.isChecked])
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
			['select-quality', HD.id],
		])
		expect(menu({ qualities: [HD] }).items).toHaveLength(1)
		expect(menu({ activeQualityId: undefined }).items[1].label).toBe('Качество')
	})

	it('кнопка «Настройки» открывает меню', async () => {
		render(MediaSettingsMenu, { props: { rates: [1, 2], rate: 1, qualities: [] } })

		await fireEvent.click(screen.getByRole('button', { name: 'Настройки' }))
		expect(await screen.findByRole('menuitem', { name: /Скорость/ })).toBeInTheDocument()
	})

	it('субтитры: «Выкл», дорожки и загрузка файла; выбор сообщается событиями', () => {
		const { items, emit } = menu({ captionTracks: [RU, EN], activeCaptionId: EN.id, captionStyle: STYLE, canLoadCaptions: true })
		const [captions, style, speed] = items
		const [choices, [upload]] = groups(captions)

		expect(captions.label).toBe('Субтитры: English')
		expect(style.label).toBe('Вид субтитров')
		expect(speed.label).toBe('Скорость: Обычная')
		expect(radios(choices)).toEqual([
			['Выкл', false],
			['Русский', false],
			['English', true],
		])
		choices[0].onUpdateChecked?.(true)
		choices[1].onUpdateChecked?.(true)
		upload.onSelect?.(new Event('click'))
		expect(upload.label).toBe('Загрузить файл субтитров…')
		expect(emit.mock.calls).toEqual([['select-caption', null], ['select-caption', RU.id], ['load-captions']])
	})

	it('субтитры: без дорожек — только «Выкл» и загрузка; без загрузки и дорожек пункта нет', () => {
		const onlyUpload = menu({ canLoadCaptions: true, captionStyle: STYLE }).items
		expect(onlyUpload.map(item => item.label)).toEqual(['Субтитры: Выкл', 'Скорость: Обычная', 'Качество: 360p'])
		expect(radios(groups(onlyUpload[0])[0])).toEqual([['Выкл', true]])

		const tracksOnly = menu({ captionTracks: [RU], activeCaptionId: '/subs/gone.vtt' }).items
		expect(tracksOnly[0].label).toBe('Субтитры: Выкл')
		expect(groups(tracksOnly[0])).toHaveLength(1)
		expect(tracksOnly[1].label).toBe('Скорость: Обычная')
		expect(menu({ captionTracks: [] }).items[0].label).toBe('Скорость: Обычная')
	})

	it('вид субтитров: размер, цвет, фон и положение — подменю с текущим значением; выбор отдаёт изменение', () => {
		const { items, emit } = menu({ captionTracks: [RU], activeCaptionId: RU.id, captionStyle: STYLE })
		const [size, color, background, position] = children(items[1])

		expect([size, color, background, position].map(item => item.label)).toEqual([
			`Размер: ${formatNumber(1, { style: 'percent' })}`,
			'Цвет: Белый',
			'Фон: Полупрозрачный',
			'Положение: Внизу',
		])
		expect(radios(children(size))).toEqual([
			[formatNumber(0.75, { style: 'percent' }), false],
			[formatNumber(1, { style: 'percent' }), true],
			[formatNumber(1.5, { style: 'percent' }), false],
			[formatNumber(2, { style: 'percent' }), false],
		])
		expect(radios(children(color))).toEqual([
			['Белый', true],
			['Жёлтый', false],
			['Зелёный', false],
			['Голубой', false],
		])
		expect(radios(children(background))).toEqual([
			['Без фона', false],
			['Полупрозрачный', true],
			['Чёрный', false],
		])
		expect(radios(children(position))).toEqual([
			['Внизу', true],
			['Вверху', false],
		])
		children(size)[2].onUpdateChecked?.(true)
		children(color)[1].onUpdateChecked?.(true)
		children(background)[0].onUpdateChecked?.(true)
		children(position)[1].onUpdateChecked?.(true)
		expect(emit.mock.calls).toEqual([
			['update-caption-style', { size: 150 }],
			['update-caption-style', { color: 'yellow' }],
			['update-caption-style', { background: 'none' }],
			['update-caption-style', { position: { x: 50, y: 12 } }],
		])
	})

	it('вид субтитров: после перетаскивания положение без значения, ни один вариант не отмечен', () => {
		const style = { ...STYLE, position: { x: 30, y: 40 } }
		const position = children(menu({ captionTracks: [RU], captionStyle: style }).items[1])[3]

		expect(position.label).toBe('Положение')
		expect(radios(children(position))).toEqual([
			['Внизу', false],
			['Вверху', false],
		])
	})

	it('озвучка: пункт первым, когда вариантов хотя бы два; выбор сообщается событием', () => {
		const audioOptions = [
			{ id: null, label: 'Оригинал' },
			{ id: '/audio/a.m4a', label: 'AniLibria' },
		]
		const { items, emit } = menu({ audioOptions, activeAudioId: '/audio/a.m4a' })
		const [audio] = items

		expect(audio.label).toBe('Озвучка: AniLibria')
		expect(radios(children(audio))).toEqual([
			['Оригинал', false],
			['AniLibria', true],
		])
		children(audio)[0].onUpdateChecked?.(true)
		expect(emit).toHaveBeenCalledWith('select-audio', null)
		expect(menu({ audioOptions, activeAudioId: 'embedded:9' }).items[0].label).toBe('Озвучка')
		expect(menu({ audioOptions: audioOptions.slice(0, 1) }).items[0].label).toBe('Скорость: Обычная')
	})
})
