/** Утилиты: вставка ссылки, разделителя, изображения и видео в редакторе */
import { warn } from '@/locales/warn'
import { UI_WARNINGS } from '@/locales/messages'
import { escapeHtml } from '@utils/dom/htmlUtils'
import { applyEdit, insertHtmlCommand } from './editCommands'
import { isSafeUrl, normalizeLinkUrl } from '@utils/data/urlUtils'
import { wrapSelectionInLink } from '@utils/dom/editorFormatUtils'
import type { MediaMarkup, UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'

const videoMarkup = (url: string): string => `<video src="${url}" controls style="max-width:100%;border-radius:8px;"></video><br/>`

const IMAGE_MARKUP: MediaMarkup = {
	code: url => `<img src="${url}" alt="" />`,
	// Не insertImage: он не задаёт alt, и скринридер читает вместо изображения адрес blob:…
	// Изображение без описания помечается как оформление (alt=""), как и в режиме кода; описание автор добавит в HTML.
	// url — адрес blob:, созданный браузером, кавычек в нём нет.
	visual: url => `<img src="${url}" alt="">`,
}

const VIDEO_MARKUP: MediaMarkup = { code: videoMarkup, visual: videoMarkup }

function insertLink(ctx: UseToolbarCommandsOptions): void {
	const url = normalizeLinkUrl(ctx.promptForUrl?.() ?? '')
	if (!url) return
	// javascript:, data: и другие схемы исполнили бы код по клику на ссылку в документе
	if (!isSafeUrl(url)) {
		warn(UI_WARNINGS.EDITOR_UNSAFE_LINK, { url: url.slice(0, 80) })
		return
	}
	if (ctx.isCodeMode.value) {
		ctx.wrapCodeSelection(`<a href="${escapeHtml(url)}">`, '</a>')
		return
	}
	ctx.saveSelection()
	ctx.restoreSelection()
	applyEdit(ctx, root => wrapSelectionInLink(root, { href: url }))
}

function insertSeparator(ctx: UseToolbarCommandsOptions): void {
	if (ctx.isCodeMode.value) {
		ctx.insertCodeAtCursor('<hr>')
		return
	}
	insertHtmlCommand(ctx, '<hr>')
}

/** Вставляет выбранный в поле файла медиафайл по адресу blob: и очищает поле */
function insertUploadedMedia(ctx: UseToolbarCommandsOptions, event: Event, markup: MediaMarkup): void {
	if (!(event.target instanceof HTMLInputElement)) return
	if (!event.target.files?.length) return
	const url = URL.createObjectURL(event.target.files[0])
	if (ctx.isCodeMode.value) {
		ctx.insertCodeAtCursor(markup.code(url))
		event.target.value = ''
		return
	}
	ctx.restoreSelection()
	insertHtmlCommand(ctx, markup.visual(url))
	event.target.value = ''
}

export { IMAGE_MARKUP, insertLink, insertSeparator, insertUploadedMedia, VIDEO_MARKUP }
