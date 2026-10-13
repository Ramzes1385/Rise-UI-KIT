import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import BaseSubtitleEditor from '../ui/BaseSubtitleEditor.vue'
import type { SubtitleCue } from '@utils/media/subtitleUtils'
import { formatCueTime, parseCueTime } from '../model/cueTime'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const CUES: SubtitleCue[] = [
	{ start: 0, end: 3, text: 'Первая' },
	{ start: 3, end: 6.5, text: 'Вторая' },
]

function setup(props: Record<string, unknown> = {}) {
	const result = render(BaseSubtitleEditor, { props: { cues: CUES, ...props } })
	const lastCues = (): SubtitleCue[] => ((result.emitted('update:cues') ?? []) as Array<[SubtitleCue[]]>).at(-1)?.[0] ?? []
	return { ...result, lastCues }
}

describe('BaseSubtitleEditor', () => {
	it('parseCueTime и formatCueTime: форматы времени', () => {
		expect(parseCueTime('62.5')).toBe(62.5)
		expect(parseCueTime(' 1:02,5 ')).toBe(62.5)
		expect(parseCueTime('0:01:02.500')).toBe(62.5)
		expect(parseCueTime('abc')).toBeNull()
		expect(formatCueTime(62.5)).toBe('1:02.500')
		expect(formatCueTime(-1)).toBe('0:00.000')
	})

	it('список и шкала: номера, время, текущая реплика, подписи для скринридера', () => {
		const { container } = setup({ currentTime: 4, duration: 10 })
		const rows = screen.getAllByRole('listitem')
		expect(rows[1]).toHaveAttribute('aria-current', 'true')
		expect(screen.getByRole('textbox', { name: 'Начало реплики 2' })).toHaveValue('0:03.000')
		expect(screen.getByRole('textbox', { name: 'Текст реплики 1' })).toHaveValue('Первая')
		const blocks = container.querySelectorAll<HTMLElement>('.base-subtitle-editor__block')
		expect(blocks[1]).toHaveClass('base-subtitle-editor__block--active')
		expect(blocks[1].style.left).toBe('30%')
		expect(blocks[1].style.width).toBe('35%')
		expect(blocks[0]).not.toHaveAttribute('title')
		expect((container.querySelector('.base-subtitle-editor__playhead') as HTMLElement).style.left).toBe('40%')
	})

	it('подсказки вместо title: блок реплики и поле времени', async () => {
		const { container } = setup()
		await fireEvent.mouseEnter(container.querySelector('.base-subtitle-editor__block') as HTMLElement)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Реплика 1, 0:00–0:03')
		await fireEvent.mouseLeave(container.querySelector('.base-subtitle-editor__block') as HTMLElement)
		await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())

		const start = screen.getByRole('textbox', { name: 'Начало реплики 1' })
		expect(start).not.toHaveAttribute('title')
		start.focus()
		expect(await screen.findByRole('tooltip')).toBeInTheDocument()
		expect(start).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id)
	})

	it('время: применяется по изменению, реплики остаются по порядку начала; неверное время — ошибка', async () => {
		const { lastCues, rerender } = setup()
		const firstEnd = screen.getByRole('textbox', { name: 'Конец реплики 1' })
		await fireEvent.update(firstEnd, '10')
		await fireEvent.change(firstEnd)
		expect(lastCues()).toEqual([{ start: 0, end: 10, text: 'Первая' }, CUES[1]])
		await rerender({ cues: lastCues() })
		const firstStart = screen.getByRole('textbox', { name: 'Начало реплики 1' })
		await fireEvent.update(firstStart, '0:05')
		await fireEvent.change(firstStart)
		expect(lastCues()).toEqual([CUES[1], { start: 5, end: 10, text: 'Первая' }])
		await fireEvent.update(firstStart, 'x')
		await fireEvent.change(firstStart)
		expect(screen.getByText('Неверное время')).toBeInTheDocument()
		expect(firstStart).toHaveAttribute('aria-invalid', 'true')
		expect(firstStart).toHaveAccessibleDescription(/Неверное время/)
		await fireEvent.update(firstStart, '0:07')
		await fireEvent.change(firstStart)
		await waitFor(() => expect(screen.queryByText('Неверное время')).not.toBeInTheDocument())
	})

	it('конец раньше начала не применяется; изменение без ввода оставляет время', async () => {
		const { emitted } = setup()
		const end = screen.getByRole('textbox', { name: 'Конец реплики 2' })
		await fireEvent.update(end, '0:01')
		await fireEvent.change(end)
		expect(screen.getByText('Конец раньше начала')).toBeInTheDocument()
		expect(emitted('update:cues')).toBeUndefined()
		await fireEvent.change(screen.getByRole('textbox', { name: 'Начало реплики 1' }))
		expect(emitted('update:cues')).toHaveLength(1)
	})

	it('текст, удаление, переход и щелчок по шкале', async () => {
		const { lastCues, emitted, container } = setup({ duration: 10 })
		await fireEvent.update(screen.getByRole('textbox', { name: 'Текст реплики 2' }), 'Правка')
		expect(lastCues()[1].text).toBe('Правка')
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить реплику 1' }))
		expect(lastCues()).toEqual([CUES[1]])
		await fireEvent.click(screen.getByRole('button', { name: 'Перейти к реплике 2' }))
		const timeline = container.querySelector('.base-subtitle-editor__timeline') as HTMLElement
		timeline.getBoundingClientRect = () => ({ left: 0, width: 200 }) as DOMRect
		await fireEvent.click(timeline, { clientX: 50 })
		await fireEvent.click(container.querySelectorAll('.base-subtitle-editor__block')[0])
		timeline.getBoundingClientRect = () => ({ left: 0, width: 0 }) as DOMRect
		await fireEvent.click(timeline, { clientX: 50 })
		expect(emitted('update:currentTime')).toEqual([[3], [2.5], [0]])
	})

	it('«Добавить реплику» ставит её в текущую позицию и переводит фокус в её текст', async () => {
		const Host = defineComponent({
			components: { BaseSubtitleEditor },
			setup: () => ({ cues: ref([...CUES]) }),
			template: '<BaseSubtitleEditor v-model:cues="cues" :current-time="1" :cue-length="1.5" />',
		})
		render(Host)
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить реплику' }))
		await vi.waitFor(() => expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Текст реплики 2' })))
		expect(screen.getByRole('textbox', { name: 'Начало реплики 2' })).toHaveValue('0:01.000')
		expect(screen.getByRole('textbox', { name: 'Конец реплики 2' })).toHaveValue('0:02.500')
	})

	it('пусто: подсказка, скачивание недоступно; шкала по концу реплик без duration', async () => {
		const { rerender, container } = setup({ cues: [] })
		expect(screen.getByText('Реплик нет. Добавьте первую или загрузите файл субтитров')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Скачать .srt' })).toBeDisabled()
		await rerender({ cues: [{ start: 10, end: 20, text: 'a' }] })
		expect((container.querySelector('.base-subtitle-editor__block') as HTMLElement).style.left).toBe('50%')
	})

	it('загрузка файла .srt и скачивание в .vtt и .srt с событием export', async () => {
		const createObjectURL = vi.fn(() => 'blob:subs')
		const revokeObjectURL = vi.fn()
		Object.assign(URL, { createObjectURL, revokeObjectURL })
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
		const { lastCues, emitted, container } = setup({ fileName: 'ep1' })
		const input = container.querySelector('input[type="file"]') as HTMLInputElement
		const clickInput = vi.spyOn(input, 'click')
		await fireEvent.click(screen.getByRole('button', { name: 'Загрузить .vtt или .srt' }))
		expect(clickInput).toHaveBeenCalled()
		const file = new File(['1\n00:00:01,000 --> 00:00:02,000\nИз файла\n'], 'ep1.srt')
		Object.defineProperty(input, 'files', { configurable: true, value: [file] })
		await fireEvent.change(input)
		await vi.waitFor(() => expect(lastCues()).toEqual([{ start: 1, end: 2, text: 'Из файла' }]))
		Object.defineProperty(input, 'files', { configurable: true, value: [] })
		await fireEvent.change(input)
		await fireEvent.click(screen.getByRole('button', { name: 'Скачать .srt' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Скачать .vtt' }))
		expect(click).toHaveBeenCalledTimes(2)
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:subs')
		const exports = (emitted('export') as Array<[{ format: string; text: string }]>).map(([payload]) => payload.format)
		expect(exports).toEqual(['srt', 'vtt'])
		click.mockRestore()
	})

	it('отключён: поля и изменение недоступны; вариант, масштаб, customClass', () => {
		const { container } = setup({
			isDisabled: true,
			variant: 'soft',
			sizeScale: 125,
			customClass: { root: 'my-root', list: 'my-list' },
		})
		expect(screen.getByRole('textbox', { name: 'Текст реплики 1' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Добавить реплику' })).toBeDisabled()
		const root = container.querySelector('.base-subtitle-editor') as HTMLElement
		expect(root).toHaveClass('base-subtitle-editor--soft', 'base-subtitle-editor--disabled', 'my-root')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-subtitle-editor__list')).toHaveClass('my-list')
	})
})
