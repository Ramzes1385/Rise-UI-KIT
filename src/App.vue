<template>
	<ErrorBoundary>
		<MainLayout>
			<router-view v-slot="{ Component, route }">
				<transition name="fade" mode="out-in">
					<div :key="route.path">
						<component :is="Component" />
					</div>
				</transition>
			</router-view>
		</MainLayout>
	</ErrorBoundary>
</template>

<script setup lang="ts">
import { MainLayout } from '@/app/layouts/MainLayout'
import { ErrorBoundary } from '@/app/providers'
import '@/app/styles/index.scss'
</script>
