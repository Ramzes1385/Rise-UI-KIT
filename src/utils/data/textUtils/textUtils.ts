/** Текст для поиска без различия регистра и букв «е» и «ё»: «Ёлка» и «елка» совпадают */
function foldSearchText(text: string): string {
	return text.toLocaleLowerCase().replace(/ё/g, 'е')
}

export { foldSearchText }
