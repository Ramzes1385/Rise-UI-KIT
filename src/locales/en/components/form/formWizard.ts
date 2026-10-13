/** BaseFormWizard multi-step form */
export const enFormWizard = {
	formWizard: {
		/** Wizard area name (`role="group"`) */
		LABEL: 'Step-by-step form',
		/** Buttons for moving between steps */
		BACK: 'Back',
		NEXT: 'Next',
		FINISH: 'Finish',
		SKIP: 'Skip',
		/** Accessible name of the button row */
		ACTIONS: 'Step navigation',
		/** Announcement on step change: "Step 2 of 3: Address" */
		PROGRESS: 'Step {current} of {total}: {title}',
		/** Message when the step check failed and the step gave no reason */
		STEP_INVALID: 'Check the data on this step and try again',
		/** Empty state without steps */
		EMPTY_TITLE: 'No steps',
		EMPTY_DESCRIPTION: 'Pass a list of steps to the component.',
	},
}
