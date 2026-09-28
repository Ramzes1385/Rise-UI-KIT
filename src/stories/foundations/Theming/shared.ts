import { ref } from 'vue'
import { BaseAlert } from '@components/BaseAlert'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import { BaseCheckbox } from '@components/BaseCheckbox'

export const Sample = {
	components: { BaseAlert, BaseBadge, BaseButton, BaseCheckbox, BaseInput, BaseSwitch },
	setup: () => ({ text: ref('Анна'), on: ref(true), checked: ref(true) }),
	template: `
		<div class="story-col" style="width: 100%;">
			<div class="story-row">
				<BaseButton>Сохранить</BaseButton>
				<BaseButton variant="soft">Черновик</BaseButton>
				<BaseButton variant="outline">Отмена</BaseButton>
				<BaseBadge label="Новый" variant="soft" />
			</div>
			<BaseInput v-model="text" label="Имя" style="max-width: 280px;" />
			<div class="story-row">
				<BaseSwitch v-model="on" label="Уведомления" />
				<BaseCheckbox v-model="checked" label="Согласен с условиями" />
			</div>
			<BaseAlert type="info" title="Доступно обновление" description="Новая версия ускоряет загрузку отчётов." />
		</div>
	`,
}
