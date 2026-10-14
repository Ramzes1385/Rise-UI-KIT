/** Composable: выполнение команд редактора (форматирование, блоки, цвет, медиа) */
import { insertHtmlCommand } from './commands/editCommands'
import { convertTypedInlineTag } from './commands/inlineHtml'
import { applyInlineColor, resetInlineColor } from './commands/colorCommands'
import type { EditorLinkValue, UseToolbarCommandsOptions } from './types/useToolbarCommands.types'
import { applyLink, getSelectionPoint, readLinkAtSelection, removeLink, resolveLinkUrl } from './commands/linkCommands'
import { IMAGE_MARKUP, insertLink, insertSeparator, insertUploadedMedia, VIDEO_MARKUP } from './commands/insertCommands'
import {
	applyBlock,
	applyFormat,
	clearCodeFormatting,
	clearVisualFormatting,
	handleHeadingChange,
	handleKeyDown,
} from './commands/formatCommands'

/** Команды тулбара: каждая получает опции composable и работает в режиме кода или в визуальном режиме */
function useToolbarCommands(options: UseToolbarCommandsOptions) {
	function applyColor(color: string): void {
		applyInlineColor(options, 'color', color)
	}

	function clearAllFormatting(): void {
		if (options.isCodeMode.value) {
			clearCodeFormatting(options)
			return
		}
		clearVisualFormatting(options)
	}

	/** Превращает только что набранную пару `<b>текст</b>` в элемент форматирования (inlineHtml.ts) */
	function convertInlineHtml(): void {
		if (convertTypedInlineTag(options.editorRef.value)) options.onInput()
	}

	return {
		applyFormat: (command: string) => applyFormat(options, command),
		applyBlock: (tag: string) => applyBlock(options, tag),
		insertHtml: (html: string) => insertHtmlCommand(options, html),
		handleHeadingChange: (value: string | number | (string | number)[]) => handleHeadingChange(options, value),
		applyColor,
		applyBackgroundColor: (color: string) => applyInlineColor(options, 'backgroundColor', color),
		resetColor: () => resetInlineColor(options, 'color'),
		resetBackgroundColor: () => resetInlineColor(options, 'backgroundColor'),
		handleColorInput: (event: Event) => {
			if (event.target instanceof HTMLInputElement) applyColor(event.target.value)
		},
		insertLink: () => insertLink(options),
		resolveLinkUrl,
		readLink: () => readLinkAtSelection(options),
		applyLink: (value: EditorLinkValue) => applyLink(options, value),
		removeLink: () => removeLink(options),
		getLinkPoint: () => getSelectionPoint(options),
		clearAllFormatting,
		insertSeparator: () => insertSeparator(options),
		handleKeyDown: (event: KeyboardEvent) => handleKeyDown(options, event),
		handleImageUpload: (event: Event) => insertUploadedMedia(options, event, IMAGE_MARKUP),
		handleVideoUpload: (event: Event) => insertUploadedMedia(options, event, VIDEO_MARKUP),
		convertInlineHtml,
	}
}

export { useToolbarCommands }
