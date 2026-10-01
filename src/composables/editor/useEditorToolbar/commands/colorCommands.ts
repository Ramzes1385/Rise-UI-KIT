/** Утилиты: цвет текста и фона в тулбаре редактора */
import type { InlineStyleProperty, UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'

/** Команда execCommand и CSS-свойство для каждого цветового свойства */
const COLOR_COMMANDS: Readonly<Record<InlineStyleProperty, { command: string; css: string; reset: string }>> = {
	color: { command: 'foreColor', css: 'color', reset: 'inherit' },
	backgroundColor: { command: 'hiliteColor', css: 'background-color', reset: 'transparent' },
}

/** Убирает цвет текста или фона у элементов, которые пересекают выделение */
function stripInlineStyle(ctx: UseToolbarCommandsOptions, property: InlineStyleProperty): void {
	const root = ctx.editorRef.value
	const sel = window.getSelection()
	if (!root || !sel || sel.rangeCount === 0) return
	const range = sel.getRangeAt(0)
	const styledElements = root.querySelectorAll<HTMLElement>('[style], font[color]')
	styledElements.forEach(element => {
		if (!range.intersectsNode(element)) return
		element.style.removeProperty(COLOR_COMMANDS[property].css)
		if (element.tagName === 'FONT' && property === 'color') {
			element.removeAttribute('color')
		}
	})
}

/** Задаёт цвет текста или фона выделенному фрагменту */
function applyInlineColor(ctx: UseToolbarCommandsOptions, property: InlineStyleProperty, color: string): void {
	const { command, css } = COLOR_COMMANDS[property]
	if (ctx.isCodeMode.value) {
		ctx.wrapCodeSelection(`<span style="${css}:${color}">`, '</span>')
		return
	}
	ctx.restoreSelection()
	document.execCommand(command, false, color)
	ctx.saveSelection()
	ctx.onInput()
}

/** Сбрасывает цвет текста или фона выделенного фрагмента */
function resetInlineColor(ctx: UseToolbarCommandsOptions, property: InlineStyleProperty): void {
	const { css, reset } = COLOR_COMMANDS[property]
	if (ctx.isCodeMode.value) {
		ctx.wrapCodeSelection(`<span style="${css}:${reset}">`, '</span>')
		return
	}
	ctx.restoreSelection()
	stripInlineStyle(ctx, property)
	ctx.saveSelection()
	ctx.onInput()
}

export { applyInlineColor, resetInlineColor, stripInlineStyle }
