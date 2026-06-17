export type ValidationRule = {
	validate: (value: unknown) => boolean
	message: string
}

export type UseFormFieldOptions = {
	value: () => unknown
	rules?: ValidationRule[]
	error?: () => string | undefined
	isRequired?: () => boolean
}

export type UseFormFieldReturn = {
	error: string
	isTouched: boolean
	isDirty: boolean
	isValid: boolean
	validate: () => boolean
	reset: () => void
	onBlur: () => void
}
