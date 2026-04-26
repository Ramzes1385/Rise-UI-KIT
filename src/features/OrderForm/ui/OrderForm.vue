<template>
	<BaseForm class="order-form" :is-loading="isSubmitting" @submit="handleSubmit">
		<h2 class="order-form__title">Оформление заказа</h2>
		<p v-if="painting" class="order-form__subtitle">
			Картина: <strong>{{ painting.title }}</strong>
		</p>

		<div class="order-form__fields">
			<BaseFormField label="Ваше имя" :error="errors.name" is-required>
				<BaseInput v-model="formData.name" placeholder="Иван Иванов" :has-error="!!errors.name" />
			</BaseFormField>

			<BaseFormField label="Телефон" :error="errors.phone" is-required>
				<BaseInput v-model="formData.phone" type="tel" placeholder="+7 (999) 000-00-00" :has-error="!!errors.phone" />
			</BaseFormField>

			<BaseFormField label="Комментарий">
				<BaseTextarea v-model="formData.comment" placeholder="Ваши пожелания" />
			</BaseFormField>
		</div>

		<div class="order-form__actions">
			<BaseButton variant="outline" @click="$emit('cancel')">Отмена</BaseButton>
			<BaseButton type="submit" variant="primary" :is-loading="isSubmitting"> Отправить заявку </BaseButton>
		</div>
	</BaseForm>
</template>

<script setup lang="ts">
import { BaseButton, BaseForm, BaseFormField, BaseInput, BaseTextarea } from '@/shared/ui'
import { reactive, ref } from 'vue'
import './OrderForm.style.scss'
import type { OrderFormData, OrderFormEmits, OrderFormProps } from './OrderForm.types'

const props = defineProps<OrderFormProps>()
const emit = defineEmits<OrderFormEmits>()

const isSubmitting = ref(false)

const formData = reactive<OrderFormData>({
	name: '',
	phone: '',
	comment: '',
	paintingId: props.painting?.id || 0,
})

const errors = reactive({
	name: '',
	phone: '',
})

function validate(): boolean {
	let isValid = true
	errors.name = ''
	errors.phone = ''

	if (!formData.name) {
		errors.name = 'Введите имя'
		isValid = false
	}

	if (!formData.phone) {
		errors.phone = 'Введите телефон'
		isValid = false
	}

	return isValid
}

async function handleSubmit(): Promise<void> {
	if (!validate()) return

	isSubmitting.value = true
	await new Promise(resolve => setTimeout(resolve, 1500))

	emit('submit', { ...formData })
	isSubmitting.value = false
}
</script>
