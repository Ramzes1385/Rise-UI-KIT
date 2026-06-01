/**
 * Unit-тесты для ChatHeader.
 * Шапка чата: заголовок, статусы (печатает/подзаголовок), поиск и действия.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'

import ChatHeader from './ChatHeader.vue'

describe('ChatHeader unit', () => {
	it('показывает заголовок и подзаголовок', () => {
		render(ChatHeader, { props: { title: 'Чат', subtitle: 'был в сети' } })
		expect(screen.getByText('Чат')).toBeInTheDocument()
		expect(screen.getByText('был в сети')).toBeInTheDocument()
	})

	it('показывает обезличенный статус «Печатает» без имени', () => {
		render(ChatHeader, { props: { title: 'Чат', isTyping: true } })
		expect(screen.getByText('Печатает')).toBeInTheDocument()
	})

	it('показывает имя печатающего в групповом чате', () => {
		render(ChatHeader, { props: { title: 'Группа', isTyping: true, typingUsername: 'Аня' } })
		expect(screen.getByText('Аня печатает')).toBeInTheDocument()
	})

	it('эмитит avatar-click по клику на аватар', async () => {
		const { emitted } = render(ChatHeader, { props: { title: 'Чат', avatar: 'a.png' } })
		await fireEvent.click(document.querySelector('.base-chat-header__avatar')!)
		expect(emitted()['avatar-click']).toBeTruthy()
	})

	it('эмитит toggle-search по кнопке поиска', async () => {
		const { emitted } = render(ChatHeader, { props: { title: 'Чат' } })
		await fireEvent.click(screen.getByLabelText('Поиск по сообщениям'))
		expect(emitted()['toggle-search']).toBeTruthy()
	})

	it('эмитит info-click по кнопке информации', async () => {
		const { emitted } = render(ChatHeader, { props: { title: 'Чат' } })
		await fireEvent.click(screen.getByLabelText('Информация о чате'))
		expect(emitted()['info-click']).toBeTruthy()
	})

	it('показывает поле поиска и эмитит ввод в режиме поиска', async () => {
		const { emitted } = render(ChatHeader, { props: { title: 'Чат', isSearching: true } })
		const input = document.querySelector<HTMLInputElement>('.base-chat-header__search-input input')!
		expect(input).toBeInTheDocument()
		await userEvent.type(input, 'q')
		expect(emitted()['update:searchQuery']?.at(-1)).toEqual(['q'])
	})
})
