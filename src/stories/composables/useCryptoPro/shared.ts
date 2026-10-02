export const COMPOSABLES = '@ramzes1385/rise-ui-kit/composables'

export const diagnosticsTemplate = `
	<div class="story-stack story-medium">
		<ol class="story-stack" aria-label="Диагностика КриптоПро">
			<li v-for="step in status.steps" :key="step.id" class="story-row">
				<span class="story-label">{{ STEP_LABELS[step.id] }}</span>
				<BaseBadge variant="soft" :label="STATE_LABELS[step.state]" />
			</li>
		</ol>
		<p v-if="status.state === 'ready'">Плагин {{ status.pluginVersion }}, КриптоПро CSP {{ status.cspVersion }}</p>
		<BaseAlert v-if="status.error" type="error" :title="status.error.message" :description="status.error.detail" />
		<BaseButton variant="outline" :is-loading="status.state === 'checking'" @click="checkPlugin">Проверить снова</BaseButton>
	</div>
`

export const certificatesTemplate = `
	<div class="story-stack story-medium">
		<BaseButton :is-loading="isLoading" @click="load">Загрузить сертификаты</BaseButton>
		<ul v-if="certificates.length" class="story-stack" aria-label="Сертификаты">
			<li v-for="certificate in certificates" :key="certificate.thumbprint" class="story-col">
				<strong>{{ certificate.name }}</strong>
				<span>{{ certificate.organization || 'Физическое лицо' }}, ИНН {{ certificate.innLe || certificate.inn }}</span>
				<span>Действует до {{ formatDate(certificate.validTo) }}</span>
				<div class="story-row">
					<BaseBadge v-if="!certificate.isValid" variant="outline" label="Недействителен" />
					<BaseBadge v-if="!certificate.hasPrivateKey" variant="outline" label="Нет закрытого ключа" />
				</div>
			</li>
		</ul>
		<BaseAlert v-if="error" type="warning" :title="error.message" />
	</div>
`

export const signTemplate = `
	<div class="story-stack story-medium">
		<BaseTextarea v-model="form.text" label="Текст документа" :rows="2" />
		<BaseRadio v-model="form.thumbprint" :options="certificateOptions" :name="certificateName" label="Сертификат" is-vertical />
		<BaseSegmented v-model="form.mode" :options="modes" label="Подпись" />
		<BaseButton :is-loading="isSigning" :is-disabled="!form.thumbprint" @click="signText">Подписать</BaseButton>
		<BaseAlert v-if="error" type="error" :title="error.message" :description="error.detail" />
		<BaseTextarea v-if="signature" v-model="signature" label="Подпись CAdES-BES, Base64" :rows="4" is-readonly />
	</div>
`
