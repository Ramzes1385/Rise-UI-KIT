export interface UseDatePickerPanelNavigationOptions {
	isOpen: () => boolean
	modelValue: () => Date | null | undefined
	modelValueEnd: () => Date | null | undefined
	selectedDates: () => Date[] | undefined
	monthsCount: () => number | string
}

export interface MonthItem {
	key: string
	month: number
	year: number
}
