<template>
	<div class="section-glass rounded-xl px-4 py-2 mb-4 glass-effect hover:glass-effect">
		<button
			class="w-full flex items-center justify-between bg-transparent text-text-secondary py-2 px-0 text-left text-lg font-semibold border-none cursor-pointer group button-shimmer"
			@click="expanded = !expanded"
		>
			<h2 class="text-text-secondary group-hover:text-text-bright transition-colors duration-300">{{ title }}</h2>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="transition-all duration-300 ml-2 group-hover:scale-110 glow-pulse"
				:class="{ 'rotate-180 scale-110': expanded }"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</button>
		<div v-show="expanded" class="mt-4 animate-fadeIn stagger-1 overflow-hidden">
			<slot />
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
	title: String,
	startExpanded: { type: Boolean, default: false },
})

const expanded = ref(props.startExpanded)
</script>
