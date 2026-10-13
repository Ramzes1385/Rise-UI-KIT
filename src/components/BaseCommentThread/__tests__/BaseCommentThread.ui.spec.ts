import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseCommentThread from '../ui/BaseCommentThread.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { CommentItem } from '../types/BaseCommentThread.types'

const NOW = new Date(2025, 4, 15, 10, 30)
const anna = { name: 'Анна' }
const ivan = { name: 'Иван' }

const REPLY: CommentItem = { id: 'r1', author: ivan, text: 'Ответ', date: NOW }
const COMMENTS: CommentItem[] = [
	{ id: 'c1', author: anna, text: 'Вопрос', date: NOW, replies: [REPLY] },
	{ id: 'c2', author: ivan, text: 'Второй', date: NOW },
]

const REAL_TRANSITIONS = { stubs: { TransitionGroup: false, Transition: false } }

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const comment = (text: string): HTMLElement => screen.getByText(text).closest('li')!

const renderThread = (props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) =>
	render(BaseCommentThread, { props: { comments: COMMENTS, now: NOW, ...props }, global: REAL_TRANSITIONS, ...options })

describe('BaseCommentThread: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const { container } = renderThread({ currentUser: anna })

		expect(container.querySelector('section')).toHaveAttribute('class', 'base-comment-thread')
		expect(container.querySelector('.base-comment-thread__count')).toHaveAttribute('class', 'base-comment-thread__count')
		expect(container.querySelector('.base-comment-thread__list')).toHaveAttribute('class', 'base-comment-thread__list')
		expect(comment('Вопрос')).toHaveAttribute('class', 'base-comment-thread__comment')
		expect(container.querySelector('article')).toHaveAttribute('class', 'base-comment-thread__card')
		expect(container.querySelector('.base-comment-thread__author')).toHaveAttribute('class', 'base-comment-thread__author')
		expect(container.querySelector('.base-comment-thread__replies')).toHaveAttribute('class', 'base-comment-thread__replies')
		expect(container.querySelector('form')).toHaveAttribute('class', 'base-comment-thread__composer')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = renderThread({
			variant: 'ghost',
			customClass: { root: 'own-root', list: 'own-list', composer: 'own-composer' },
			ui: { root: 'u-root', list: 'u-list', card: 'u-card', text: 'u-text', composer: 'u-composer', avatar: 'u-avatar' },
			currentUser: anna,
		})

		expect(container.querySelector('section')).toHaveClass('base-comment-thread', 'u-root', 'base-comment-thread--ghost', 'own-root')
		expect(container.querySelector('.base-comment-thread__list')).toHaveClass('u-list', 'own-list')
		expect(container.querySelector('article')).toHaveClass('base-comment-thread__card', 'u-card')
		expect(screen.getByText('Вопрос')).toHaveClass('base-comment-thread__text', 'u-text')
		const composer = container.querySelector('form:last-of-type')
		expect(composer).toHaveClass('base-comment-thread__composer', 'u-composer', 'own-composer')
		expect(composer?.querySelector('.base-comment-thread__avatar')).toHaveClass('u-avatar')
	})

	it('классы из defaults.BaseCommentThread.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseCommentThread, {
			props: { comments: COMMENTS, now: NOW, isReadonly: true, ui: { meta: 'own-meta' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCommentThread: { ui: { root: 'app-root', meta: 'app-meta' } } } })] },
		})

		expect(container.querySelector('section')).toHaveClass('app-root')
		expect(container.querySelector('.base-comment-thread__meta')).toHaveAttribute(
			'class',
			'base-comment-thread__meta app-meta own-meta',
		)
	})

	it('пустая ветка — часть empty', () => {
		renderThread({ comments: [], ui: { empty: 'u-empty' } })

		expect(screen.getByText('Комментариев пока нет').closest('.base-empty')).toHaveClass('base-comment-thread__empty', 'u-empty')
	})
})

describe('BaseCommentThread: движение', () => {
	beforeEach(() => stubReducedMotion(false))

	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('первая отрисовка — без анимации появления', () => {
		const { container } = renderThread()

		expect(container.querySelector('[class*="-enter-active"]')).toBeNull()
	})

	it('новый комментарий и новый ответ появляются со сдвигом, прежние остаются на месте', async () => {
		const { rerender } = renderThread()
		const kept = comment('Ответ')

		await rerender({
			comments: [
				{ ...COMMENTS[0], replies: [REPLY, { id: 'r2', author: anna, text: 'Ещё ответ', date: NOW }] },
				COMMENTS[1],
				{ id: 'c3', author: anna, text: 'Новый', date: NOW },
			],
		})

		expect(comment('Ещё ответ')).toHaveClass('base-comment-thread-item-enter-active')
		expect(comment('Новый')).toHaveClass('base-comment-thread-item-enter-active')
		expect(comment('Ответ')).toBe(kept)
		expect(kept).not.toHaveClass('base-comment-thread-item-enter-active')
	})

	it('удалённый комментарий исчезает сразу, без ожидания перехода; без последнего ответа блок ответов сворачивается', async () => {
		const { container, rerender } = renderThread()

		await rerender({ comments: [{ ...COMMENTS[0], replies: [] }] })
		await nextTick()

		expect(screen.queryByText('Второй')).toBeNull()
		expect(container.querySelector('.base-comment-thread__replies-expand')).toHaveClass('base-comment-thread-expand-leave-active')
	})

	it('сворачивание ответов — переход expand-rows; aria-controls указывает на список ответов', async () => {
		const { container } = renderThread()
		const toggle = screen.getByRole('button', { name: 'Скрыть ответы' })
		const list = document.getElementById(toggle.getAttribute('aria-controls') as string)

		expect(list).toHaveClass('base-comment-thread__replies')
		await fireEvent.click(toggle)

		expect(container.querySelector('.base-comment-thread__replies-expand')).toHaveClass('base-comment-thread-expand-leave-active')
		expect(document.getElementById(toggle.getAttribute('aria-controls') as string)).toBe(list)
	})

	it.each([
		['prefers-reduced-motion: reduce', () => stubReducedMotion(true)],
		['пресет none', () => document.documentElement.setAttribute('data-rise-motion', 'none')],
		["reducedMotion: 'always'", () => document.documentElement.setAttribute('data-rise-reduced-motion', 'always')],
	])('%s — новые комментарии и сворачивание сразу в конечном состоянии', async (_, setup) => {
		setup()
		const { container, rerender } = renderThread()

		await rerender({ comments: [...COMMENTS, { id: 'c3', author: anna, text: 'Новый', date: NOW }] })
		expect(comment('Новый')).toHaveAttribute('class', 'base-comment-thread__comment')

		await fireEvent.click(screen.getByRole('button', { name: 'Скрыть ответы' }))
		const expand = container.querySelector('.base-comment-thread__replies-expand')
		expect(expand).toHaveAttribute('class', 'base-comment-thread__replies-expand')
		expect(expand).not.toBeVisible()
	})
})
