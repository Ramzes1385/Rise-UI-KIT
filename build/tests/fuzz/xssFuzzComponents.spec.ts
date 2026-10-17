import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Component } from 'vue'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { render } from '@testing-library/vue'
import BaseCode from '@components/BaseCode/ui/BaseCode.vue'
import BaseChat from '@components/BaseChat/ui/BaseChat.vue'
import BaseEditor from '@components/BaseEditor/ui/BaseEditor.vue'
import BaseMarkdown from '@components/BaseMarkdown/ui/BaseMarkdown.vue'
import BaseAiMessage from '@components/BaseAiMessage/ui/BaseAiMessage.vue'
import BaseTextDiff from '@components/BaseTextDiff/ui/BaseTextDiff.vue'
import BaseJsonViewer from '@components/BaseJsonViewer/ui/BaseJsonViewer.vue'
import BaseCommentThread from '@components/BaseCommentThread/ui/BaseCommentThread.vue'
import { tokenizeCode } from '@utils/data/codeHighlightUtils'
import { createRng } from './rng'
import type { Rng } from './rng'
import { formatFindings, readFuzzConfig, reportSummary, runTarget } from './fuzzRunner'
import type { TargetResult } from './fuzzRunner'
import { generateHtml, generateJson, generateMarkdown, generateText, generateUrl, mutate } from './xssGenerators'
import { componentViolations, sanitizedHtmlViolations } from './xssInvariants'
import type { ComponentCheckOptions } from './xssInvariants'

const config = readFuzzConfig(250)
const results: TargetResult[] = []

let executed = 0

const STRICT_MEDIA: ComponentCheckOptions = { isMediaStrict: true }

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }

function record(result: TargetResult): TargetResult {
	results.push(result)
	return result
}

function expectNoFindings(result: TargetResult): void {
	expect(result.findings, formatFindings([result])).toEqual([])
}

/** Монтирует компонент, проверяет весь документ (с телепортами) и размонтирует */
function renderViolations(component: Component, props: Record<string, unknown>, options: ComponentCheckOptions = {}): string[] {
	const before = executed
	const { unmount } = render(component, { props, global: { stubs } })
	const found = componentViolations(document.body, options)
	if (executed !== before) found.push('исполнен скрипт из данных (вызван alert)')
	unmount()
	document.body.innerHTML = ''
	return found
}

const pick = (rng: Rng, generate: (rng: Rng) => string): string => (rng.chance(0.5) ? generate(rng) : generateText(rng))

const SENDERS = ['me', 'other'] as const
const ATTACHMENT_TYPES = ['image', 'file', 'audio'] as const

interface ChatInput {
	messages: Record<string, unknown>[]
	pinnedMessages: Record<string, unknown>[]
	members: Record<string, unknown>[]
	commands: Record<string, unknown>[]
	title: string
	subtitle: string
	description: string
	avatar: string
	quickReplies: string[]
}

function generateChat(rng: Rng): ChatInput {
	const messages = rng.times(rng.range(1, 4), index => ({
		id: `m${index}`,
		text: generateText(rng),
		sender: rng.pick(SENDERS),
		time: generateText(rng),
		createdAt: rng.pick([generateText(rng), '2026-10-16T10:00:00Z', 0, 1_700_000_000_000] as const),
		senderName: generateText(rng),
		senderAvatar: generateUrl(rng),
		replyToId: rng.chance(0.3) ? 'm0' : undefined,
		replyToText: generateText(rng),
		replyToSenderName: generateText(rng),
		reactions: [{ emoji: generateText(rng), users: [generateText(rng)] }],
		attachments: rng.times(rng.range(0, 2), attachment => ({
			id: `a${attachment}`,
			name: generateText(rng),
			type: rng.pick(ATTACHMENT_TYPES),
			url: generateUrl(rng),
			size: generateText(rng),
		})),
	}))
	return {
		messages,
		pinnedMessages: messages.slice(0, 1).map(message => ({ ...message, isPinned: true })),
		members: rng.times(rng.range(1, 3), index => ({
			id: `u${index}`,
			name: generateText(rng),
			avatar: generateUrl(rng),
			role: generateText(rng),
			status: 'online',
		})),
		commands: [{ name: generateText(rng), description: generateText(rng) }],
		title: generateText(rng),
		subtitle: generateText(rng),
		description: generateText(rng),
		avatar: generateUrl(rng),
		quickReplies: [generateText(rng)],
	}
}

function chatViolations(input: ChatInput): string[] {
	return renderViolations(BaseChat, { ...input, currentUserId: 'me', isGroup: true })
}

interface CommentInput {
	comments: Record<string, unknown>[]
	label: string
}

function generateComments(rng: Rng): CommentInput {
	const make = (depth: number, id: string): Record<string, unknown> => ({
		id,
		author: { name: generateText(rng), avatar: generateUrl(rng) },
		text: generateText(rng),
		date: rng.pick([generateText(rng), '2026-10-17T10:00:00Z', 0, 1_700_000_000_000] as const),
		likes: rng.int(5),
		replies: depth < 2 && rng.chance(0.5) ? rng.times(rng.range(1, 2), index => make(depth + 1, `${id}-${index}`)) : [],
	})
	return { comments: rng.times(rng.range(1, 3), index => make(0, `c${index}`)), label: generateText(rng) }
}

function commentViolations(input: CommentInput): string[] {
	const { unmount } = render(BaseCommentThread, {
		props: { ...input, seo: true, now: new Date('2026-10-18T00:00:00Z'), currentUser: { name: input.label } } as never,
		global: { stubs },
	})
	const found = componentViolations(document.body)
	for (const script of document.body.querySelectorAll('script[type="application/ld+json"]')) {
		if (/[<>&]/.test(script.textContent ?? '')) found.push('JSON-LD в DOM содержит <, > или &')
		try {
			JSON.parse(script.textContent ?? '')
		} catch {
			found.push('JSON-LD в DOM не разбирается')
		}
	}
	unmount()
	document.body.innerHTML = ''
	return found.filter(item => item !== 'элемент <script>')
}

interface EditorInput {
	initial: string
	pasted: string
	plain: string
	dropped: string
	inserted: string
	typed: string
	code: string
	upload: { src: string; alt: string }
}

function generateEditor(rng: Rng): EditorInput {
	return {
		initial: generateHtml(rng),
		pasted: generateHtml(rng),
		plain: generateText(rng),
		dropped: generateHtml(rng),
		inserted: generateHtml(rng),
		typed: generateHtml(rng),
		code: generateHtml(rng),
		upload: { src: generateUrl(rng), alt: generateText(rng) },
	}
}

function transferEvent(inputType: string, data: Record<string, string>, files: File[] = []): InputEvent {
	const event = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType })
	Object.defineProperty(event, 'dataTransfer', { value: { files, getData: (type: string) => data[type] ?? '' } })
	return event
}

function placeCaret(content: HTMLElement): void {
	const selection = window.getSelection()
	const range = document.createRange()
	range.selectNodeContents(content)
	range.collapse(false)
	selection?.removeAllRanges()
	selection?.addRange(range)
}

/** jsdom загружает `iframe` из живого DOM и вызывает его `onload` вне теста: ввод с клавиатуры `iframe` в область не добавляет, поэтому в «набранный» HTML он не попадает */
const withoutFrames = (html: string): string => html.replace(/<(\/?)iframe\b/gi, '<$1span')

const settle = async (): Promise<void> => {
	await nextTick()
	await new Promise(resolve => setTimeout(resolve, 0))
}

function listEmitted(wrapper: ReturnType<typeof mount>): string[] {
	return ((wrapper.emitted('update:modelValue') ?? []) as string[][]).map(args => args[0])
}

interface EditorHost {
	wrapper: ReturnType<typeof mount>
	uploaded: { src: string; alt: string }
}

/** Редактор монтируется один раз на цель: сборка панели инструментов в jsdom занимает около секунды, а проверяются данные, не монтирование */
function mountEditorHost(): EditorHost {
	const host: EditorHost = { uploaded: { src: '', alt: '' }, wrapper: null as unknown as ReturnType<typeof mount> }
	host.wrapper = mount(BaseEditor, {
		props: { modelValue: '', uploadMedia: () => Promise.resolve({ ...host.uploaded }) },
		global: { stubs },
		attachTo: document.body,
	})
	return host
}

const rootOf = (host: EditorHost): HTMLElement => host.wrapper.element as HTMLElement
const findContent = (host: EditorHost): HTMLElement | null => rootOf(host).querySelector<HTMLElement>('.base-editor__content')
const findCode = (host: EditorHost): HTMLTextAreaElement | null => rootOf(host).querySelector<HTMLTextAreaElement>('textarea')
const findToggle = (host: EditorHost): HTMLButtonElement | null =>
	rootOf(host).querySelector<HTMLButtonElement>('button[aria-label="Режим кода"]')

async function resetEditor(host: EditorHost): Promise<void> {
	if (findCode(host)) {
		findToggle(host)?.click()
		await settle()
	}
	await host.wrapper.setProps({ modelValue: '' })
	const content = findContent(host)
	if (content) content.innerHTML = ''
	host.wrapper.emitted()['update:modelValue'] = []
}

async function editorViolations(host: EditorHost, input: EditorInput): Promise<string[]> {
	const found: string[] = []
	await resetEditor(host)
	host.uploaded = input.upload
	await host.wrapper.setProps({ modelValue: input.initial })
	await nextTick()
	const content = findContent(host)
	const api = host.wrapper.vm as unknown as { getHtml: () => string; insertHtml: (html: string) => void }
	if (!content) return ['нет области редактора']
	let baseline = executed
	const checkContent = (stage: string): void => {
		if (executed !== baseline) found.push(`${stage}: исполнен скрипт из данных (вызван alert)`)
		baseline = executed
		for (const item of [...sanitizedHtmlViolations(content.innerHTML), ...componentViolations(content)]) found.push(`${stage}: ${item}`)
	}
	const checkEmitted = (stage: string): void => {
		for (const value of listEmitted(host.wrapper))
			for (const item of sanitizedHtmlViolations(value)) found.push(`${stage}, update:modelValue: ${item}`)
		for (const item of sanitizedHtmlViolations(api.getHtml())) found.push(`${stage}, getHtml: ${item}`)
	}
	checkContent('modelValue')
	placeCaret(content)
	content.dispatchEvent(transferEvent('insertFromPaste', { 'text/html': input.pasted, 'text/plain': input.plain }))
	checkContent('вставка HTML')
	content.dispatchEvent(transferEvent('insertFromPaste', { 'text/plain': input.plain }))
	checkContent('вставка текста')
	content.dispatchEvent(transferEvent('insertFromDrop', { 'text/html': input.dropped }))
	checkContent('перетаскивание')
	api.insertHtml(input.inserted)
	checkContent('insertHtml')
	content.dispatchEvent(transferEvent('insertFromPaste', {}, [new File(['x'], 'a.png', { type: 'image/png' })]))
	await settle()
	checkContent('uploadMedia')
	checkEmitted('после вставок')
	content.innerHTML = withoutFrames(input.typed)
	baseline = executed
	content.dispatchEvent(new Event('input', { bubbles: true }))
	await nextTick()
	checkEmitted('ввод')
	findToggle(host)?.click()
	await settle()
	const area = findCode(host)
	if (area) {
		area.value = input.code
		area.dispatchEvent(new Event('input', { bubbles: true }))
		await nextTick()
		checkEmitted('режим кода')
		findToggle(host)?.click()
		await settle()
		const visual = findContent(host)
		if (visual)
			for (const item of [...sanitizedHtmlViolations(visual.innerHTML), ...componentViolations(visual)])
				found.push(`выход из режима кода: ${item}`)
	}
	return found
}

describe('фаззинг XSS: компоненты', () => {
	beforeEach(() => {
		if (typeof document.execCommand !== 'function')
			Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true, writable: true })
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:own')
		executed = 0
		vi.spyOn(window, 'alert').mockImplementation(() => {
			executed += 1
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	afterAll(() => {
		reportSummary(results, config.seed)
	})

	it('BaseMarkdown: пользовательская разметка и адреса не дают элементов, обработчиков и опасных ссылок', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'BaseMarkdown',
					weight: 0.2,
					generate: generateMarkdown,
					check: source => renderViolations(BaseMarkdown, { source }, STRICT_MEDIA),
				}),
			),
		)
	})

	it('BaseMarkdown: потоковый вывод и без переносов строк', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'BaseMarkdown(stream)',
					weight: 0.06,
					generate: generateMarkdown,
					check: source =>
						renderViolations(
							BaseMarkdown,
							{ source: mutate(createRng(source.length), source), isStreaming: true, hasLineBreaks: false },
							STRICT_MEDIA,
						),
				}),
			),
		)
	})

	it('BaseAiMessage: ответ ассистента, имя, аватар и ошибка', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'BaseAiMessage',
					weight: 0.1,
					generate: rng => ({
						content: generateMarkdown(rng),
						name: generateText(rng),
						avatar: generateUrl(rng),
						error: generateText(rng),
						time: generateText(rng),
					}),
					check: input => renderViolations(BaseAiMessage, input),
				}),
			),
		)
	})

	it('BaseCode: код с разметкой выводится текстом, подсветка не теряет и не добавляет символов', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'BaseCode',
					weight: 0.15,
					generate: rng => ({
						code: pick(rng, generateHtml),
						language: rng.pick(['ts', 'js', 'html', 'json', 'css', 'python', 'sh', generateText(rng), ''] as const),
						title: generateText(rng),
					}),
					check: input => {
						const joined = tokenizeCode(input.code, input.language)
							.map(token => token.value)
							.join('')
						const found = joined === input.code ? [] : ['подсветка изменила текст кода']
						return [...found, ...renderViolations(BaseCode, input, STRICT_MEDIA)]
					},
				}),
			),
		)
	})

	it('BaseJsonViewer: ключи и строки значений выводятся текстом', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'BaseJsonViewer',
					weight: 0.08,
					generate: rng => ({ value: generateJson(rng), label: generateText(rng) }),
					check: input => renderViolations(BaseJsonViewer, { ...input, expandDepth: 6 }, STRICT_MEDIA),
					describe: input => JSON.stringify(input),
				}),
			),
		)
	})

	it('BaseTextDiff: строки до и после выводятся текстом', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'BaseTextDiff',
					weight: 0.15,
					generate: rng => ({
						before: generateText(rng),
						after: generateText(rng),
						label: generateText(rng),
						mode: rng.pick(['unified', 'split'] as const),
						isWordDiff: rng.chance(0.5),
					}),
					check: input => renderViolations(BaseTextDiff, input, STRICT_MEDIA),
					describe: input => JSON.stringify(input),
				}),
			),
		)
	})

	it('BaseChat: сообщения, ответы, реакции, вложения и адреса не дают активной разметки', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'BaseChat',
					weight: 0.03,
					generate: generateChat,
					check: chatViolations,
					describe: input => JSON.stringify(input),
				}),
			),
		)
	})

	it('BaseCommentThread: комментарии, авторы, аватары и JSON-LD', async () => {
		expectNoFindings(
			record(
				await runTarget(config, {
					name: 'BaseCommentThread',
					weight: 0.06,
					generate: generateComments,
					check: commentViolations,
					describe: input => JSON.stringify(input),
				}),
			),
		)
	})

	it('BaseEditor: modelValue, вставка, перетаскивание, insertHtml, uploadMedia, ввод и режим кода', async () => {
		const host = mountEditorHost()
		await nextTick()
		const result = await runTarget(config, {
			name: 'BaseEditor',
			weight: 0.012,
			generate: generateEditor,
			check: input => editorViolations(host, input),
			describe: input => JSON.stringify(input),
		})
		host.wrapper.unmount()
		expectNoFindings(record(result))
	})
})
