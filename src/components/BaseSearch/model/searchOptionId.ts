/** id результата поиска в списке: на него указывает aria-activedescendant поля */
export function getSearchOptionId(listboxId: string, index: number): string {
	return `${listboxId}-option-${index}`
}
