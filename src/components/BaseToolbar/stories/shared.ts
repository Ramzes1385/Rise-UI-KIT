export const FORMAT_BUTTONS = [
	{ icon: 'bold', label: 'Полужирный' },
	{ icon: 'italic', label: 'Курсив' },
	{ icon: 'underline', label: 'Подчёркнутый' },
]

export const ALIGN_BUTTONS = [
	{ icon: 'align-left', label: 'По левому краю' },
	{ icon: 'align-center', label: 'По центру' },
	{ icon: 'align-right', label: 'По правому краю' },
]

export const TOOLBAR_TEMPLATE = `
	<BaseToolbar v-bind="props">
		<BaseButton v-for="button in format" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }">
			<BaseIcon :name="button.icon" />
		</BaseButton>
		<BaseSeparator orientation="vertical" style="height: 20px;" />
		<BaseButton v-for="button in align" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }" :is-disabled="button.icon === disabledIcon">
			<BaseIcon :name="button.icon" />
		</BaseButton>
	</BaseToolbar>
`
