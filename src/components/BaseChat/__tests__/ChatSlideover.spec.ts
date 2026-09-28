/**
 * Unit/Integration-тесты для ChatSlideover.
 * Покрывают вкладки (инфо/медиа/файлы/ссылки/профиль), личный и групповой
 * режимы, админ-действия над участниками и извлечение ссылок из сообщений.
 */

import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import ChatSlideover from '../ui/ChatSlideover/ChatSlideover.vue'
import type { ChatMember, ChatMessage } from '../model/BaseChat.types'

const MEMBERS: ChatMember[] = [
	{ id: 'a1', name: 'Анна', role: 'admin', status: 'online' },
	{ id: 'm1', name: 'Борис', role: 'member', status: 'offline', warningsCount: 1 },
	{ id: 'me', name: 'Я', role: 'member', status: 'online' },
]

const MESSAGES_WITH_LINKS: ChatMessage[] = [
	{ id: '1', text: 'Смотри https://example.com и ещё', sender: 'me', time: '10:00' },
	{ id: '2', text: 'Дубль https://example.com', sender: 'other', time: '10:01' },
	{ id: '3', text: 'Другая http://test.ru здесь', sender: 'me', time: '10:02' },
	{ id: '4', text: 'Без ссылок', sender: 'me', time: '10:03' },
	{ id: '5', text: '', sender: 'me', time: '10:04' },
]

/** Демо-данные, которые раньше были зашиты в компонент и показывались в любом чате */
const DEMO_DATA_PATTERN = /Металл-Арт|ведущий скульптор|\+7 \(999\) 123-45-67|info@metal-art\.ru/

function baseProps(overrides: Record<string, unknown> = {}) {
	return {
		isOpen: true,
		activeTab: 'info' as const,
		selectedMemberId: null,
		title: 'Чат с Анной',
		subtitle: 'в сети',
		messages: [] as ChatMessage[],
		...overrides,
	}
}

describe('ChatSlideover unit', () => {
	describe('заголовок и открытие', () => {
		it('должен показывать панель-диалог «Информация» только когда isOpen=true', async () => {
			const { rerender } = render(ChatSlideover, { props: baseProps() })

			// Панель — BaseSlideover внутри окна чата: немодальный диалог, закрытая панель не остаётся в DOM и в порядке Tab
			const dialog = screen.getByRole('dialog', { name: 'Информация' })
			expect(dialog).not.toHaveAttribute('aria-modal')

			await rerender(baseProps({ isOpen: false }))
			await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
		})

		it('должен показывать заголовок "Информация" для вкладки info', () => {
			render(ChatSlideover, { props: baseProps({ activeTab: 'info' }) })

			expect(screen.getByText('Информация')).toBeInTheDocument()
		})

		it('должен показывать заголовок "Профиль" для вкладки profile', () => {
			render(ChatSlideover, { props: baseProps({ activeTab: 'profile', isGroup: true, selectedMemberId: 'a1', members: MEMBERS }) })

			expect(screen.getByText('Профиль')).toBeInTheDocument()
		})

		it('должен эмитить update:isOpen=false при клике на крестик', async () => {
			const { emitted } = render(ChatSlideover, { props: baseProps() })

			await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

			const events = emitted()['update:isOpen'] as Array<[boolean]>
			expect(events[0][0]).toBe(false)
		})
	})

	describe('вкладка инфо — личный чат', () => {
		it('должен показывать подзаголовок и не показывать захардкоженные демо-контакты и описание', () => {
			const { container } = render(ChatSlideover, { props: baseProps({ isGroup: false, subtitle: 'был(а) недавно' }) })

			expect(screen.getByText('был(а) недавно')).toBeInTheDocument()
			expect(container.querySelector('.base-chat-slideover__info-details')).toBeNull()
			expect(container.textContent).not.toMatch(DEMO_DATA_PATTERN)
		})

		it('должен показывать описание из prop description', () => {
			render(ChatSlideover, { props: baseProps({ isGroup: false, description: 'Менеджер по доставке' }) })

			expect(screen.getByText('Менеджер по доставке')).toBeInTheDocument()
		})

		it('должен показывать запасной статус "в сети" когда подзаголовок пуст', () => {
			render(ChatSlideover, { props: baseProps({ isGroup: false, subtitle: '' }) })

			expect(screen.getByText('в сети')).toBeInTheDocument()
		})
	})

	describe('вкладка инфо — групповой чат', () => {
		it('должен показывать список участников и количество', () => {
			render(ChatSlideover, { props: baseProps({ isGroup: true, members: MEMBERS }) })

			// Число участников — по правилам множественного числа: 1 участник, 3 участника, 5 участников
			expect(screen.getByText('3 участника')).toBeInTheDocument()
			expect(screen.getByText('Участники группы')).toBeInTheDocument()
		})

		it('не должен показывать захардкоженное демо-описание группы', () => {
			const { container } = render(ChatSlideover, { props: baseProps({ isGroup: true, members: MEMBERS }) })

			expect(container.textContent).not.toMatch(DEMO_DATA_PATTERN)
		})

		it('должен показывать описание группы из prop description', () => {
			render(ChatSlideover, { props: baseProps({ isGroup: true, members: MEMBERS, description: 'Обсуждение релизов' }) })

			expect(screen.getByText('Обсуждение релизов')).toBeInTheDocument()
		})

		it('должен эмитить переход в профиль при клике по участнику', async () => {
			const { container, emitted } = render(ChatSlideover, { props: baseProps({ isGroup: true, members: MEMBERS }) })

			const memberMain = container.querySelector('.base-chat-slideover__member-main') as HTMLElement
			await fireEvent.click(memberMain)

			expect(emitted()['update:selectedMemberId']).toBeTruthy()
			const tabEvents = emitted()['update:activeTab'] as Array<[string]>
			expect(tabEvents[0][0]).toBe('profile')
		})

		it('должен показывать роль "Администратор" для админа и статус для участника', () => {
			render(ChatSlideover, { props: baseProps({ isGroup: true, members: MEMBERS }) })

			expect(screen.getByText('Администратор')).toBeInTheDocument()
			expect(screen.getByText('не в сети')).toBeInTheDocument()
		})
	})

	describe('админ-действия над участниками', () => {
		it('должен открывать и закрывать админ-меню участника', async () => {
			const { container } = render(ChatSlideover, {
				props: baseProps({ isGroup: true, members: MEMBERS, currentUserRole: 'admin' }),
			})

			const adminBtn = screen.getByLabelText('Действия с участником Анна')
			await fireEvent.click(adminBtn)
			expect(container.querySelector('.base-chat-slideover__admin-dropdown')).toBeInTheDocument()

			await fireEvent.click(adminBtn)
			expect(container.querySelector('.base-chat-slideover__admin-dropdown')).toBeNull()
		})

		it('Escape в меню участника закрывает только меню, панель остаётся открытой', async () => {
			const { container, emitted } = render(ChatSlideover, {
				props: baseProps({ isGroup: true, members: MEMBERS, currentUserRole: 'admin' }),
			})

			const trigger = screen.getByRole('button', { name: 'Действия с участником Анна' })
			await fireEvent.click(trigger)
			expect(trigger).toHaveAttribute('aria-expanded', 'true')

			await fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Разжаловать' }), { key: 'Escape' })

			expect(container.querySelector('.base-chat-slideover__admin-dropdown')).toBeNull()
			expect(emitted()['update:isOpen']).toBeUndefined()
		})

		it('должен эмитить update-member-role при смене роли (разжаловать админа)', async () => {
			const { emitted } = render(ChatSlideover, {
				props: baseProps({ isGroup: true, members: MEMBERS, currentUserRole: 'admin' }),
			})

			await fireEvent.click(screen.getByLabelText('Действия с участником Анна'))
			await fireEvent.click(screen.getByText('Разжаловать'))

			const events = emitted()['update-member-role'] as Array<[{ memberId: string; role: string }]>
			expect(events[0][0]).toEqual({ memberId: 'a1', role: 'member' })
		})

		it('должен эмитить update-member-role "admin" при назначении участника админом', async () => {
			const { emitted } = render(ChatSlideover, {
				props: baseProps({ isGroup: true, members: MEMBERS, currentUserRole: 'admin' }),
			})

			await fireEvent.click(screen.getByLabelText('Действия с участником Борис'))
			await fireEvent.click(screen.getByText('Сделать админом'))

			const events = emitted()['update-member-role'] as Array<[{ memberId: string; role: string }]>
			expect(events[0][0]).toEqual({ memberId: 'm1', role: 'admin' })
		})

		it('должен эмитить kick-member при исключении', async () => {
			const { emitted } = render(ChatSlideover, {
				props: baseProps({ isGroup: true, members: MEMBERS, currentUserRole: 'admin' }),
			})

			await fireEvent.click(screen.getByLabelText('Действия с участником Анна'))
			await fireEvent.click(screen.getByText('Исключить'))

			const events = emitted()['kick-member'] as Array<[string]>
			expect(events[0][0]).toBe('a1')
		})

		it('должен эмитить ban-member при бане', async () => {
			const { emitted } = render(ChatSlideover, {
				props: baseProps({ isGroup: true, members: MEMBERS, currentUserRole: 'admin' }),
			})

			await fireEvent.click(screen.getByLabelText('Действия с участником Анна'))
			await fireEvent.click(screen.getByText('Забанить'))

			const events = emitted()['ban-member'] as Array<[{ memberId: string }]>
			expect(events[0][0].memberId).toBe('a1')
		})

		it('не должен показывать админ-действия для обычного участника', () => {
			const { container } = render(ChatSlideover, {
				props: baseProps({ isGroup: true, members: MEMBERS, currentUserRole: 'member' }),
			})

			expect(container.querySelector('.base-chat-slideover__admin-btn')).toBeNull()
		})
	})

	describe('вкладка профиль — личный чат', () => {
		it('должен показывать профиль собеседника по title в личном чате', () => {
			render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: false, title: 'Анна', subtitle: 'в сети' }),
			})

			expect(screen.getByText('Анна')).toBeInTheDocument()
			expect(screen.getByText('Написать сообщение')).toBeInTheDocument()
		})

		it('должен показывать статус "не в сети" в личном чате когда подзаголовок не указывает онлайн', () => {
			render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: false, title: 'Анна', subtitle: 'была давно' }),
			})

			expect(screen.getByText('не в сети')).toBeInTheDocument()
		})

		it('должен распознавать онлайн-статус по слову "online" в подзаголовке', () => {
			render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: false, title: 'Анна', subtitle: 'online now' }),
			})

			expect(screen.getByText('в сети')).toBeInTheDocument()
		})

		it('должен эмитить write-message и закрывать панель при клике "Написать сообщение"', async () => {
			const { emitted } = render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: false, title: 'Анна', selectedMemberId: 'companion-id' }),
			})

			await fireEvent.click(screen.getByText('Написать сообщение'))

			const writeEvents = emitted()['write-message'] as Array<[string]>
			expect(writeEvents[0][0]).toBe('companion-id')
			const openEvents = emitted()['update:isOpen'] as Array<[boolean]>
			expect(openEvents[0][0]).toBe(false)
		})
	})

	describe('вкладка профиль — групповой чат', () => {
		it('должен возвращать null для профиля группы без выбранного участника', () => {
			const { container } = render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: true, selectedMemberId: null, members: MEMBERS }),
			})

			// Профильная панель не рендерится (selectedMember === null)
			expect(container.querySelector('.base-chat-slideover__profile-summary')).toBeNull()
		})

		it('должен показывать профиль выбранного участника группы с предупреждениями', () => {
			render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: true, selectedMemberId: 'm1', members: MEMBERS }),
			})

			expect(screen.getByText('Борис')).toBeInTheDocument()
			expect(screen.getByText('1 / 3')).toBeInTheDocument()
		})

		it('должен показывать роль "Администратор" в профиле участника-админа', () => {
			render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: true, selectedMemberId: 'a1', members: MEMBERS }),
			})

			expect(screen.getByText('Администратор')).toBeInTheDocument()
		})

		it('должен эмитить возврат к списку при клике "Назад к списку"', async () => {
			const { emitted } = render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: true, selectedMemberId: 'a1', members: MEMBERS }),
			})

			await fireEvent.click(screen.getByText('Назад к списку'))

			const idEvents = emitted()['update:selectedMemberId'] as Array<[string | null]>
			expect(idEvents[0][0]).toBeNull()
			const tabEvents = emitted()['update:activeTab'] as Array<[string]>
			expect(tabEvents[0][0]).toBe('info')
		})

		it('должен возвращать null когда выбранного участника нет в списке', () => {
			const { container } = render(ChatSlideover, {
				props: baseProps({ activeTab: 'profile', isGroup: true, selectedMemberId: 'unknown', members: MEMBERS }),
			})

			expect(container.querySelector('.base-chat-slideover__profile-summary')).toBeNull()
		})
	})

	describe('вкладки и навигация', () => {
		it('должен показывать вкладки когда активна не вкладка профиля', () => {
			const { container } = render(ChatSlideover, { props: baseProps({ activeTab: 'media' }) })

			expect(container.querySelector('.base-chat-slideover__tabs')).toBeInTheDocument()
		})

		it('должен эмитить смену вкладки при клике по табу', async () => {
			const { emitted } = render(ChatSlideover, { props: baseProps({ activeTab: 'media' }) })

			await fireEvent.click(screen.getByText('Файлы'))

			const events = emitted()['update:activeTab'] as Array<[string]>
			expect(events[0][0]).toBe('files')
		})

		it('вкладки — tablist: выбранная вкладка aria-selected, стрелки переключают по кругу', async () => {
			const { emitted } = render(ChatSlideover, { props: baseProps({ activeTab: 'links' }) })

			const tablist = screen.getByRole('tablist', { name: 'Разделы информации' })
			const selected = screen.getByRole('tab', { selected: true })
			expect(selected).toHaveTextContent('Ссылки')
			expect(selected).toHaveAttribute('tabindex', '0')
			expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', selected.id)

			await fireEvent.keyDown(tablist, { key: 'ArrowRight' })
			await fireEvent.keyDown(tablist, { key: 'Home' })

			const events = emitted()['update:activeTab'] as Array<[string]>
			expect(events.map(([tab]) => tab)).toEqual(['info', 'info'])
		})

		it('должен называть первую вкладку "Участники" в групповом чате', () => {
			render(ChatSlideover, { props: baseProps({ activeTab: 'media', isGroup: true }) })

			expect(screen.getByText('Участники')).toBeInTheDocument()
		})
	})

	describe('вкладка медиа', () => {
		it('должен показывать заглушку когда нет медиафайлов', () => {
			render(ChatSlideover, { props: baseProps({ activeTab: 'media', messages: [] }) })

			expect(screen.getByText('Нет медиафайлов')).toBeInTheDocument()
		})

		it('должен показывать сетку изображений когда есть медиа, игнорируя файлы и сообщения без вложений', () => {
			const messages: ChatMessage[] = [
				{ id: '0', text: 'Текст без вложений', sender: 'me', time: '09:59' },
				{
					id: '1',
					text: '',
					sender: 'me',
					time: '10:00',
					attachments: [
						{ id: 'i1', name: 'pic.png', type: 'image', url: 'https://ex.com/pic.png' },
						{ id: 'f1', name: 'doc.pdf', type: 'file', url: 'https://ex.com/doc.pdf' },
					],
				},
			]
			const { container } = render(ChatSlideover, { props: baseProps({ activeTab: 'media', messages }) })

			expect(container.querySelectorAll('.base-chat-slideover__media-item')).toHaveLength(1)
		})

		it('должен показывать дату публикации медиа из поля date сообщения', () => {
			const messages: ChatMessage[] = [
				{
					id: '1',
					text: '',
					sender: 'me',
					time: '10:00',
					date: '12 мая 2024',
					attachments: [{ id: 'i1', name: 'pic.png', type: 'image', url: 'https://ex.com/pic.png' }],
				},
			]
			render(ChatSlideover, { props: baseProps({ activeTab: 'media', messages }) })

			expect(screen.getByText('12 мая 2024')).toBeInTheDocument()
		})

		it('должен показывать time как дату медиа когда поле date отсутствует', () => {
			const messages: ChatMessage[] = [
				{
					id: '1',
					text: '',
					sender: 'me',
					time: '09:45',
					attachments: [{ id: 'i1', name: 'pic.png', type: 'image', url: 'https://ex.com/pic.png' }],
				},
			]
			const { container } = render(ChatSlideover, { props: baseProps({ activeTab: 'media', messages }) })

			expect(container.querySelector('.base-chat-slideover__media-date')).toHaveTextContent('09:45')
		})
	})

	describe('вкладка файлы', () => {
		const fileMessages: ChatMessage[] = [
			{ id: '0', text: 'Без вложений', sender: 'me', time: '09:59' },
			{
				id: '1',
				text: '',
				sender: 'me',
				time: '10:00',
				attachments: [
					{ id: 'f1', name: 'report.pdf', type: 'file', url: 'https://ex.com/report.pdf', size: '1 MB' },
					{ id: 'f2', name: 'archive.unknownext', type: 'file', url: 'https://ex.com/archive.unknownext' },
					{ id: 'i1', name: 'pic.png', type: 'image', url: 'https://ex.com/pic.png' },
				],
			},
		]

		it('должен показывать заглушку когда нет файлов', () => {
			render(ChatSlideover, { props: baseProps({ activeTab: 'files', messages: [] }) })

			expect(screen.getByText('Нет файлов')).toBeInTheDocument()
		})

		it('должен эмитить file-click при клике по файлу', async () => {
			const { container, emitted } = render(ChatSlideover, { props: baseProps({ activeTab: 'files', messages: fileMessages }) })

			const fileItem = container.querySelector('.base-chat-slideover__file-main') as HTMLElement
			await fireEvent.click(fileItem)

			expect(emitted()['file-click']).toBeTruthy()
		})

		it('должен эмитить download-file при клике по иконке скачивания', async () => {
			const { container, emitted } = render(ChatSlideover, { props: baseProps({ activeTab: 'files', messages: fileMessages }) })

			const downloadIcon = container.querySelector('.base-chat-slideover__file-download') as HTMLElement
			await fireEvent.click(downloadIcon)

			expect(emitted()['download-file']).toBeTruthy()
		})

		it('должен показывать размер и дату публикации файла', () => {
			const messages: ChatMessage[] = [
				{
					id: '1',
					text: '',
					sender: 'me',
					time: '10:00',
					date: '3 апреля 2024',
					attachments: [{ id: 'f1', name: 'report.pdf', type: 'file', url: 'https://ex.com/report.pdf', size: '1 MB' }],
				},
			]
			const { container } = render(ChatSlideover, { props: baseProps({ activeTab: 'files', messages }) })

			const meta = container.querySelector('.base-chat-slideover__file-meta') as HTMLElement
			expect(meta).toHaveTextContent('1 MB')
			expect(meta).toHaveTextContent('3 апреля 2024')
		})
	})

	describe('вкладка ссылки', () => {
		it('должен показывать заглушку когда нет ссылок', () => {
			render(ChatSlideover, { props: baseProps({ activeTab: 'links', messages: [] }) })

			expect(screen.getByText('Нет ссылок')).toBeInTheDocument()
		})

		it('должен извлекать уникальные ссылки из текста сообщений', () => {
			render(ChatSlideover, { props: baseProps({ activeTab: 'links', messages: MESSAGES_WITH_LINKS }) })

			// Дубликат https://example.com убран
			expect(screen.getAllByText('https://example.com')).toHaveLength(1)
			expect(screen.getByText('http://test.ru')).toBeInTheDocument()
		})

		it('должен показывать ссылку настоящей ссылкой, открывающейся в новой вкладке', () => {
			render(ChatSlideover, { props: baseProps({ activeTab: 'links', messages: MESSAGES_WITH_LINKS }) })

			const link = screen.getByRole('link', { name: /https:\/\/example\.com/ })
			expect(link).toHaveAttribute('href', 'https://example.com')
			expect(link).toHaveAttribute('target', '_blank')
			expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		})

		it('должен показывать дату публикации рядом со ссылкой', () => {
			const messages: ChatMessage[] = [
				{ id: '1', text: 'Ссылка https://example.com тут', sender: 'me', time: '08:30', date: '1 июня 2024' },
			]
			const { container } = render(ChatSlideover, { props: baseProps({ activeTab: 'links', messages }) })

			const linkDate = container.querySelector('.base-chat-slideover__link-date') as HTMLElement
			expect(linkDate).toHaveTextContent('1 июня 2024')
		})
	})
})
