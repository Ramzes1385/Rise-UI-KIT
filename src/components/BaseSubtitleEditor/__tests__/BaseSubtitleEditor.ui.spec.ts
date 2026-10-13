import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseSubtitleEditor from '../ui/BaseSubtitleEditor.vue'
import type { SubtitleCue } from '@utils/media/subtitleUtils'
import { SUBTITLE_EDITOR_PARTS } from '../types/BaseSubtitleEditor.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const CUES: SubtitleCue[] = [
	{ start: 1, end: 3, text: 'Первая' },
	{ start: 3, end: 6.5, text: 'Вторая' },
]
const motionGlobal = { stubs: { 'transition-group': false } }

function renderHost(cues: SubtitleCue[] = CUES, currentTime = 0) {
	const model = ref([...cues])
	const Host = defineComponent({
		components: { BaseSubtitleEditor },
		setup: () => ({ cues: model, currentTime }),
		template: '<BaseSubtitleEditor v-model:cues="cues" :current-time="currentTime" />',
	})
	return { ...render(Host, { global: motionGlobal }), model }
}

const rows = (container: Element) => [...container.querySelectorAll<HTMLElement>('.base-subtitle-editor__row')]

describe('BaseSubtitleEditor: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...SUBTITLE_EDITOR_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseSubtitleEditor, {
			props: { cues: CUES, currentTime: 2, ui, customClass: { list: 'own-list', cue: 'own-cue' } },
		})
		const start = screen.getByRole('textbox', { name: 'Начало реплики 1' })
		await fireEvent.update(start, 'x')
		await fireEvent.change(start)
		const root = container.querySelector('.base-subtitle-editor')!
		expect(root).toHaveClass('base-subtitle-editor', 'u-root')
		for (const part of SUBTITLE_EDITOR_PARTS.filter(name => name !== 'empty' && name !== 'error')) {
			const elements = root.querySelectorAll(`.base-subtitle-editor__${part}`)
			expect(elements.length).toBeGreaterThan(0)
			for (const element of elements) expect(element).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-subtitle-editor__list')).toHaveClass('own-list')
		expect(root.querySelector('.base-subtitle-editor__block')).toHaveClass('own-cue', 'base-subtitle-editor__block--active')
		expect(root.querySelector('.base-subtitle-editor__row')).toHaveClass('base-subtitle-editor__row--active')
	})

	it('пустой список: класс ui у подсказки; плагин и экземпляр склеиваются, без ui — только классы кита', () => {
		const { container } = render(BaseSubtitleEditor, {
			props: { cues: [], ui: { empty: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSubtitleEditor: { ui: { empty: 'app', root: 'app-root' } } } })] },
		})
		expect(container.querySelector('.base-subtitle-editor')).toHaveClass('app-root')
		expect(container.querySelector('.base-subtitle-editor__empty')).toHaveClass(
			'base-empty',
			'base-subtitle-editor__empty',
			'app',
			'own',
		)
		expect(container.querySelector('.base-subtitle-editor__timeline')).toHaveAttribute('class', 'base-subtitle-editor__timeline')
	})
})

describe('BaseSubtitleEditor: движение списка', () => {
	it('новая реплика появляется переходом, остальные строки остаются теми же элементами', async () => {
		const { container } = renderHost()
		const [first, second] = rows(container)
		await waitFor(() => expect(first).not.toHaveClass('base-subtitle-editor-row-enter-active'))
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить реплику' }))
		const next = rows(container)
		expect(next).toHaveLength(3)
		expect(next[0]).toHaveClass('base-subtitle-editor-row-enter-active')
		expect(next[1]).toBe(first)
		expect(next[2]).toBe(second)
	})

	it('правка времени переставляет строку целиком, черновик поля остаётся у своей реплики', async () => {
		const { container, model } = renderHost()
		const [first, second] = rows(container)
		await fireEvent.update(screen.getByRole('textbox', { name: 'Конец реплики 1' }), '2.5')
		const secondStart = screen.getByRole('textbox', { name: 'Начало реплики 2' })
		await fireEvent.update(secondStart, '0.5')
		await fireEvent.change(secondStart)
		expect(model.value.map(cue => cue.text)).toEqual(['Вторая', 'Первая'])
		expect(rows(container)).toEqual([second, first])
		expect(screen.getByRole('textbox', { name: 'Конец реплики 2' })).toHaveValue('2.5')
		expect(screen.getByRole('textbox', { name: 'Начало реплики 1' })).toHaveValue('0:00.500')
	})

	it('удалённая строка закреплена на месте и скрыта от скринридера; подсказка пустого списка — после ухода', async () => {
		const { container } = renderHost([CUES[0]])
		const row = rows(container)[0]
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить реплику 1' }))
		expect(row).toHaveClass('base-subtitle-editor-row-leave-active')
		expect(row).toHaveAttribute('aria-hidden', 'true')
		expect(row.style.top).toBe('0px')
		expect(container.querySelector('.base-subtitle-editor__list')).toBeInTheDocument()
		expect(container.querySelector('.base-subtitle-editor__empty')).not.toBeInTheDocument()
		await waitFor(() => expect(container.querySelector('.base-subtitle-editor__list')).not.toBeInTheDocument())
		expect(row).not.toBeInTheDocument()
		expect(container.querySelector('.base-subtitle-editor__empty')).toBeInTheDocument()
	})

	it('реплики снаружи: строки узнаются по объекту реплики, заменённая на том же месте — по позиции', async () => {
		const { container, model } = renderHost()
		const [first, second] = rows(container)
		model.value = [{ start: 0, end: 1, text: 'Новая' }, ...CUES]
		await waitFor(() => expect(rows(container)).toHaveLength(3))
		expect(rows(container)[0]).toHaveClass('base-subtitle-editor-row-enter-active')
		expect(rows(container).slice(1)).toEqual([first, second])
		model.value = [model.value[0], { ...CUES[0], text: 'Правка' }, CUES[1], { start: 7, end: 8, text: 'Ещё' }]
		await waitFor(() => expect(rows(container)).toHaveLength(4))
		expect(rows(container).slice(1, 3)).toEqual([first, second])
		expect(screen.getByRole('textbox', { name: 'Текст реплики 2' })).toHaveValue('Правка')
	})
})
