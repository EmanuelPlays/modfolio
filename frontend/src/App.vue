<template>
    <div class="min-h-screen flex flex-col justify-center items-center pt-10 px-5 pb-0 font-medium text-text-primary overflow-y-auto">
        <div class="bg-card-bg border border-border-dark rounded-2xl p-4 lg:p-8 max-w-[1200px] w-full shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <!-- Left column: Configuration -->
                <div>
                    <a href="/" class="inline-flex items-center gap-2 no-underline mb-2">
                        <svg class="h-10 w-10" viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">
                            <g class="dynamic-fill" transform="translate(-195.12051,-249.04304)">
                                <g transform="matrix(1.2138597,0,0,1.2138597,-53.114434,-63.81136)">
                                    <rect width="60" height="20" x="205.12053" y="259.04303" ry="10"/>
                                    <rect width="20" height="20" x="275.12051" y="259.04303" ry="10"/>
                                    <rect width="90" height="20" x="205.12053" y="319.04303" ry="10"/>
                                    <rect width="90" height="20" x="204.50052" y="289.04303" ry="10"/>
                                </g>
                            </g>
                        </svg>
                        <h1 class="dynamic-color text-5xl font-black leading-none">Modfolio</h1>
                    </a>
                    <p class="mb-4 text-sm opacity-80">Generate fast, beautiful and consistent embeddable cards and badges for Modrinth, CurseForge, Hangar and Spigot content.</p>

                    <!-- Configuration Section -->
                    <CollapsibleSection title="Configuration" :start-expanded="true">
                        <div class="mb-2">
                            <h3 class="text-text-secondary text-base font-semibold mt-2 mb-1">URL</h3>
                            <input type="text" v-model="urlInput" :placeholder="`https://www.${platformConfig.baseUrl}/${platformConfig.projectPath}/example`"
                                class="w-full py-2.5 px-3 bg-input-bg border-2 border-transparent rounded-xl text-text-bright text-sm font-medium transition-[border-color] duration-100 focus:outline-none"
                                @input="onUrlInput" @paste="onUrlPaste" />
                        </div>

                        <hr class="my-4 border-0 border-t border-border-dark" />

                        <PlatformSelector :selected="selectedPlatform" @select="setPlatform" />

                        <hr class="my-4 border-0 border-t border-border-dark" />

                        <div class="mb-2">
                            <h3 class="text-text-secondary text-base font-semibold mb-1">Type</h3>
                            <select v-model="embedType" class="w-full py-2.5 px-3 bg-input-bg border-2 border-transparent rounded-xl text-text-bright text-sm font-medium transition-[border-color] duration-100 focus:outline-none"
                                @change="onConfigChange">
                                <option value="card">Card</option>
                                <option value="badge">Badge</option>
                            </select>
                        </div>

                        <div class="mb-2">
                            <h3 class="text-text-secondary text-base font-semibold mb-1">Target</h3>
                            <select v-model="targetType" class="w-full py-2.5 px-3 bg-input-bg border-2 border-transparent rounded-xl text-text-bright text-sm font-medium transition-[border-color] duration-100 focus:outline-none"
                                @change="onConfigChange">
                                <option v-for="t in platformConfig.targets" :key="t" :value="t">{{ capitalize(t) }}</option>
                            </select>
                        </div>

                        <div v-if="embedType === 'badge'" class="mb-2">
                            <h3 class="text-text-secondary text-base font-semibold mb-1">Badge Metric</h3>
                            <select v-model="badgeMetric" class="w-full py-2.5 px-3 bg-input-bg border-2 border-transparent rounded-xl text-text-bright text-sm font-medium transition-[border-color] duration-100 focus:outline-none"
                                @change="onOptionChange">
                                <option v-for="m in availableMetrics" :key="m" :value="m">{{ METRIC_LABELS[m] }}</option>
                            </select>
                        </div>

                        <div class="mb-2">
                            <h3 class="text-text-secondary text-base font-semibold mb-1">{{ valueLabel }}</h3>
                            <input type="text" v-model="identifier" :placeholder="valuePlaceholder"
                                class="w-full py-2.5 px-3 bg-input-bg border-2 border-transparent rounded-xl text-text-bright text-sm font-medium transition-[border-color] duration-100 focus:outline-none"
                                @input="onIdentifierInput" @paste="onIdentifierPaste" />
                        </div>
                    </CollapsibleSection>

                    <!-- Customization Section -->
                    <CollapsibleSection title="Customization" ref="customizationSection">
                        <ToggleCheckbox v-if="showProjectsVisible" v-model="showProjects" label="Show Projects" @update:model-value="onOptionChange" />
                        <RangeSlider v-if="showProjectsVisible && showProjects" v-model="maxProjects" label="Max Projects" :max="CARD_LIMITS.MAX_COUNT" @update:model-value="onDebouncedChange" />

                        <ToggleCheckbox v-if="showVersionsVisible" v-model="showVersions" :label="versionsLabel" @update:model-value="onOptionChange" />
                        <RangeSlider v-if="showVersionsVisible && showVersions" v-model="maxVersions" :label="maxVersionsLabel" :max="CARD_LIMITS.MAX_COUNT" @update:model-value="onDebouncedChange" />

                        <ToggleCheckbox v-if="relativeTimeVisible" v-model="relativeTime" label="Relative Time" @update:model-value="onOptionChange" />
                        <ToggleCheckbox v-if="sparklinesVisible" v-model="showSparklines" label="Sparkline Graphs" @update:model-value="onOptionChange" />
                        <ToggleCheckbox v-if="sparklinesVisible" v-model="showDownloadBars" label="Download Bars" @update:model-value="onOptionChange" />
                        <ToggleCheckbox v-if="embedType === 'badge'" v-model="showIcon" label="Show Platform Icon" @update:model-value="onOptionChange" />
                        <ToggleCheckbox v-model="showBorder" label="Show Border" @update:model-value="onOptionChange" />
                        <ToggleCheckbox v-model="animations" label="Animations" @update:model-value="onOptionChange" />

                        <ColorPalette label="Accent Color" :model-value="selectedColor"
                            :preset-colors="accentPresets"
                            @update:model-value="onAccentChange" />

                        <div class="mt-2">
                            <ColorPalette label="Background Color" :model-value="selectedBgColor"
                                :preset-colors="BG_COLORS"
                                @update:model-value="onBgChange" />
                            <div v-if="selectedBgColor !== null" class="bg-yellow/10 border border-yellow/30 rounded-lg px-3 py-2 text-sm text-yellow flex items-center gap-2 mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                                    <path d="M12 9v4" /><path d="M12 17h.01" />
                                </svg>
                                <span>Transparent works best in most situations, as it blends in with the background without changing its style.</span>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>

                <!-- Right column: Preview & Output -->
                <div class="flex flex-col gap-4">
                    <div>
                        <h2 class="flex justify-between items-center text-text-secondary text-lg font-semibold">
                            <span>Preview</span>
                            <span class="flex items-center gap-1">
                                <svg v-if="!loading && generationTime" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow">
                                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                                </svg>
                                <svg v-if="loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow loader-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                <span v-if="generationTime" class="text-yellow">{{ generationTime }}ms</span>
                            </span>
                        </h2>

                        <div v-if="apiSlow" class="mb-3 bg-yellow/10 border border-yellow/30 rounded-lg px-3 py-2 text-sm text-yellow">
                            <span class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                <span>The {{ platformConfig.name }} API is responding slowly. Embeds may take longer to load.</span>
                            </span>
                        </div>

                        <div v-if="apiError" class="mb-3 bg-red/10 border border-red/30 rounded-lg px-3 py-2 text-sm text-red">
                            <span class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                                <span>The {{ platformConfig.name }} API is currently down.</span>
                            </span>
                        </div>

                        <div class="bg-section-bg border border-border-dark rounded-xl min-h-[460px] flex items-center justify-center text-text-muted p-4">
                            <span v-if="!previewSrc">Your embed will appear here</span>
                            <a v-else :href="targetUrl" target="_blank">
                                <img :src="previewSrc" alt="Preview" class="max-w-full" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h2 class="text-text-secondary text-lg font-semibold">Markdown</h2>
                        <div class="bg-section-bg border border-border-dark rounded-xl p-3 flex items-center font-mono text-xs break-all" :class="markdownText ? 'text-text-bright' : 'text-text-muted'">
                            {{ markdownText || 'Your markdown code will appear here' }}
                        </div>
                    </div>

                    <div>
                        <h2 class="text-text-secondary text-lg font-semibold">HTML</h2>
                        <div class="bg-section-bg border border-border-dark rounded-xl p-3 flex items-center font-mono text-xs break-all" :class="htmlText ? 'text-text-bright' : 'text-text-muted'">
                            {{ htmlText || 'Your HTML code will appear here' }}
                        </div>
                    </div>

                    <div>
                        <h2 class="text-text-secondary text-lg font-semibold">URL</h2>
                        <div class="bg-section-bg border border-border-dark rounded-xl p-3 flex items-center font-mono text-xs break-all" :class="urlText ? 'text-text-bright' : 'text-text-muted'">
                            {{ urlText || 'Your URL will appear here' }}
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <button :disabled="!embedUrl" class="py-2.5 px-4 text-black border-none rounded-xl text-sm font-semibold cursor-pointer transition-[filter] duration-200 hover:brightness-110 flex items-center gap-2 disabled:bg-input-bg disabled:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            :style="embedUrl ? { backgroundColor: '#' + platformConfig.defaultColor } : {}"
                            @click="copy('markdown')">
                            <span>{{ copyLabels.markdown }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-3" /><path d="M8 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3" /></svg>
                        </button>

                        <button :disabled="!embedUrl" class="py-2.5 px-4 text-black border-none rounded-xl text-sm font-semibold cursor-pointer transition-[filter] duration-200 hover:brightness-110 flex items-center gap-2 disabled:bg-input-bg disabled:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            :style="embedUrl ? { backgroundColor: '#' + platformConfig.defaultColor } : {}"
                            @click="copy('html')">
                            <span>{{ copyLabels.html }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></svg>
                        </button>

                        <button :disabled="!embedUrl" class="py-2.5 px-4 text-black border-none rounded-xl text-sm font-semibold cursor-pointer transition-[filter] duration-200 hover:brightness-110 flex items-center gap-2 disabled:bg-input-bg disabled:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            :style="embedUrl ? { backgroundColor: '#' + platformConfig.defaultColor } : {}"
                            @click="copy('url')">
                            <span>{{ copyLabels.url }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 126.644 96" fill="currentColor">
                                <path d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z"/>
                            </svg>
                        </button>

                        <button class="py-2.5 px-4 bg-input-bg text-text-bright border border-border-dark rounded-xl text-sm font-semibold flex items-center gap-2 hover:brightness-110 cursor-pointer transition-[filter] duration-200"
                            @click="resetToDefaults">
                            <span>Reset</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <footer class="text-center py-8 px-5 pt-8 text-base text-text-muted font-semibold">
            Made with &hearts; by <a href="https://github.com/creeperkatze" target="_blank" class="dynamic-link no-underline">Creeperkatze</a> &middot; View <a href="https://github.com/creeperkatze/modfolio" target="_blank" class="dynamic-link no-underline">Source</a> &middot;
            View <a href="/docs" class="dynamic-link no-underline">API Docs</a> &middot;
            <a href="https://github.com/creeperkatze/modfolio" target="_blank" class="no-underline" style="color: #fbbf24">&starf; On Github</a> &middot; Not affiliated with Modrinth, CurseForge, Hangar or Spigot
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { PLATFORMS, CARD_LIMITS, METRIC_LABELS, BG_COLORS, getAccentColors, parseUrl } from "./platforms.js";
import CollapsibleSection from "./components/CollapsibleSection.vue";
import ColorPalette from "./components/ColorPalette.vue";
import PlatformSelector from "./components/PlatformSelector.vue";
import ToggleCheckbox from "./components/ToggleCheckbox.vue";
import RangeSlider from "./components/RangeSlider.vue";

// ── Reactive state ──
const selectedPlatform = ref("modrinth");
const embedType = ref("card");
const targetType = ref("user");
const badgeMetric = ref("downloads");
const identifier = ref("");
const urlInput = ref("");

const showProjects = ref(true);
const maxProjects = ref(CARD_LIMITS.DEFAULT_COUNT);
const showVersions = ref(true);
const maxVersions = ref(CARD_LIMITS.DEFAULT_COUNT);
const relativeTime = ref(true);
const showSparklines = ref(true);
const showDownloadBars = ref(true);
const showIcon = ref(true);
const showBorder = ref(true);
const animations = ref(true);
const selectedColor = ref("1bd96a");
const selectedBgColor = ref(null);

const loading = ref(false);
const generationTime = ref(null);
const apiSlow = ref(false);
const apiError = ref(false);
const previewSrc = ref(null);
const metaName = ref("");
const metaUrl = ref(null);
const curseforgeSlug = ref(null);

const copyLabels = ref({ markdown: "Copy Markdown", html: "Copy HTML", url: "Copy URL" });

const customizationSection = ref(null);

// ── Computed ──
const platformConfig = computed(() => PLATFORMS[selectedPlatform.value]);

const availableMetrics = computed(() => {
    const metrics = platformConfig.value.badgeMetrics[targetType.value] || platformConfig.value.badgeMetrics[platformConfig.value.targets[0]];
    return metrics || ["downloads"];
});

const accentPresets = computed(() =>
    getAccentColors(selectedPlatform.value).map((c) => ({ name: c, value: c }))
);

const isProject = computed(() => ["project", "resource"].includes(targetType.value));
const isUserLike = computed(() => {
    const t = targetType.value;
    if (["user", "organization", "collection"].includes(t)) return true;
    if (selectedPlatform.value === "spigot" && t === "author") return true;
    return false;
});

const showProjectsVisible = computed(() => embedType.value === "card" && isUserLike.value);
const showVersionsVisible = computed(() => embedType.value === "card" && isProject.value);
const relativeTimeVisible = computed(() => embedType.value === "card" && isProject.value && showVersions.value);
const sparklinesVisible = computed(() => embedType.value === "card" && isUserLike.value);

const versionsLabel = computed(() => selectedPlatform.value === "curseforge" ? "Show Files" : "Show Versions");
const maxVersionsLabel = computed(() => selectedPlatform.value === "curseforge" ? "Max Files" : "Max Versions");

const valueLabel = computed(() => {
    const labels = {
        user: selectedPlatform.value === "curseforge" ? "User ID" : "Username",
        project: selectedPlatform.value === "curseforge" || selectedPlatform.value === "spigot" ? "Project ID" : "Project Slug",
        organization: "Organization Slug",
        collection: "Collection ID",
        author: "Author ID",
        resource: "Resource ID",
    };
    return labels[targetType.value] || "Value";
});

const valuePlaceholder = computed(() => {
    const placeholders = {
        user: selectedPlatform.value === "curseforge" ? "Enter user ID" : "Enter username or id",
        project: selectedPlatform.value === "curseforge" ? "Enter project ID" : "Enter project ID or slug",
        organization: "Enter organization slug or id",
        collection: "Enter collection id",
        author: "Enter author ID",
        resource: "Enter resource ID",
    };
    return placeholders[targetType.value] || "";
});

// Build the embed URL
const embedUrl = computed(() => {
    const id = identifier.value.trim();
    if (!id) return null;

    const config = platformConfig.value;
    const platform = selectedPlatform.value;
    const type = targetType.value;

    if (embedType.value === "badge") {
        const params = new URLSearchParams();
        if (selectedColor.value !== config.defaultColor) params.set("color", selectedColor.value);
        if (selectedBgColor.value !== null) params.set("backgroundColor", selectedBgColor.value);
        if (!showIcon.value) params.set("showIcon", "false");
        if (!showBorder.value) params.set("showBorder", "false");
        const q = params.toString();
        return `${window.location.origin}/${platform}/${type}/${id}/${badgeMetric.value}${q ? "?" + q : ""}`;
    }

    // Card
    const params = new URLSearchParams();

    if (isUserLike.value) {
        if (!showProjects.value) params.set("showProjects", "false");
        if (maxProjects.value !== CARD_LIMITS.DEFAULT_COUNT) params.set("maxProjects", maxProjects.value);
    }
    if (isProject.value) {
        if (!showVersions.value) params.set("showVersions", "false");
        if (maxVersions.value !== CARD_LIMITS.DEFAULT_COUNT) params.set("maxVersions", maxVersions.value);
        if (!relativeTime.value) params.set("relativeTime", "false");
    }
    if (isUserLike.value) {
        if (!showSparklines.value) params.set("showSparklines", "false");
        if (!showDownloadBars.value) params.set("showDownloadBars", "false");
    }
    if (!showBorder.value) params.set("showBorder", "false");
    if (!animations.value) params.set("animations", "false");
    if (selectedColor.value !== config.defaultColor) params.set("color", selectedColor.value);
    if (selectedBgColor.value !== null) params.set("backgroundColor", selectedBgColor.value);

    const q = params.toString();
    return `${window.location.origin}/${platform}/${type}/${id}${q ? "?" + q : ""}`;
});

const targetUrl = computed(() => {
    if (metaUrl.value) return metaUrl.value;
    const config = platformConfig.value;
    const id = identifier.value.trim();
    const type = targetType.value;
    if (selectedPlatform.value === "curseforge") {
        return type === "user"
            ? `https://www.${config.baseUrl}/${config.userPath}/${id}`
            : `https://www.${config.baseUrl}/${config.projectPath}/${curseforgeSlug.value || id}`;
    }
    if (selectedPlatform.value === "hangar") {
        return type === "user"
            ? `https://${config.baseUrl}/u/${id}`
            : `https://${config.baseUrl}/${config.projectPath}/${id}`;
    }
    if (selectedPlatform.value === "spigot") {
        return type === "author"
            ? `https://${config.baseUrl}/authors/${id}`
            : `https://${config.baseUrl}/${config.projectPath}/${id}/`;
    }
    return `https://modrinth.com/${type}/${id}`;
});

const markdownText = computed(() => {
    if (!embedUrl.value) return "";
    return `[![${metaName.value || identifier.value}](${embedUrl.value})](${targetUrl.value})`;
});

const htmlText = computed(() => {
    if (!embedUrl.value) return "";
    return `<a href="${targetUrl.value}"><img src="${embedUrl.value}" alt="${metaName.value || identifier.value}" /></a>`;
});

const urlText = computed(() => {
    if (!embedUrl.value) return "";
    return `${embedUrl.value}${embedUrl.value.includes("?") ? "&" : "?"}timestamp=${Date.now()}`;
});

// ── Debounce ──
let debounceTimer = null;
function debounce(fn, ms = 200) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, ms);
}

// ── Methods ──
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function setPlatform(platform) {
    selectedPlatform.value = platform;
    selectedColor.value = PLATFORMS[platform].defaultColor;
    targetType.value = PLATFORMS[platform].targets[0];
    badgeMetric.value = (PLATFORMS[platform].badgeMetrics[PLATFORMS[platform].targets[0]] || ["downloads"])[0];
    document.documentElement.style.setProperty("--platform-color", `#${PLATFORMS[platform].defaultColor}`);
    updateFavicon(`#${PLATFORMS[platform].defaultColor}`);
    resetToDefaults();
}

function resetToDefaults() {
    const config = platformConfig.value;
    curseforgeSlug.value = null;
    embedType.value = "card";
    targetType.value = config.targets[0];
    badgeMetric.value = (config.badgeMetrics[config.targets[0]] || ["downloads"])[0];
    identifier.value = "";
    urlInput.value = "";
    showProjects.value = true;
    maxProjects.value = CARD_LIMITS.DEFAULT_COUNT;
    showVersions.value = true;
    maxVersions.value = CARD_LIMITS.DEFAULT_COUNT;
    relativeTime.value = true;
    showSparklines.value = true;
    showDownloadBars.value = true;
    showIcon.value = true;
    showBorder.value = true;
    animations.value = true;
    selectedColor.value = config.defaultColor;
    selectedBgColor.value = null;
    previewSrc.value = null;
    generationTime.value = null;
    apiSlow.value = false;
    apiError.value = false;
    metaName.value = "";
    metaUrl.value = null;
    updateBrowserUrl();
}

function onAccentChange(color) {
    selectedColor.value = color;
    generate();
    updateBrowserUrl();
}

function onBgChange(color) {
    selectedBgColor.value = color;
    generate();
    updateBrowserUrl();
}

function onConfigChange() {
    updateBrowserUrl();
    generate();
}

function onOptionChange() {
    updateBrowserUrl();
    generate();
}

function onDebouncedChange() {
    debounce(() => { updateBrowserUrl(); generate(); });
}

function onIdentifierInput() {
    debounce(() => { updateBrowserUrl(); generate(); });
}

function onIdentifierPaste() {
    setTimeout(() => { updateBrowserUrl(); generate(); }, 10);
}

async function onUrlInput() {
    const val = urlInput.value.trim();
    const parsed = parseUrl(val);
    if (!parsed) return;

    if (selectedPlatform.value !== parsed.platform) {
        selectedPlatform.value = parsed.platform;
        selectedColor.value = PLATFORMS[parsed.platform].defaultColor;
        document.documentElement.style.setProperty("--platform-color", `#${PLATFORMS[parsed.platform].defaultColor}`);
        updateFavicon(`#${PLATFORMS[parsed.platform].defaultColor}`);
    }
    targetType.value = parsed.type;

    if (parsed.isCurseForge) {
        if (parsed.type === "project" && parsed.slug) {
            curseforgeSlug.value = parsed.slug;
            try {
                const res = await fetch(`/curseforge/lookup/${encodeURIComponent(parsed.slug)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.id) { identifier.value = String(data.id); updateBrowserUrl(); generate(); return; }
                }
            } catch { /* ignore */ }
            curseforgeSlug.value = null;
        } else if (parsed.type === "user") {
            curseforgeSlug.value = parsed.id;
            try {
                const res = await fetch(`/curseforge/lookup/user/${encodeURIComponent(parsed.id)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.id) { identifier.value = String(data.id); updateBrowserUrl(); generate(); return; }
                }
            } catch { /* ignore */ }
            curseforgeSlug.value = null;
        } else {
            curseforgeSlug.value = null;
            identifier.value = parsed.id;
        }
    } else {
        curseforgeSlug.value = null;
        identifier.value = parsed.id;
    }
    updateBrowserUrl();
    generate();
}

function onUrlPaste() {
    setTimeout(() => onUrlInput(), 10);
}

async function generate() {
    const id = identifier.value.trim();
    if (!id) {
        previewSrc.value = null;
        generationTime.value = null;
        apiSlow.value = false;
        apiError.value = false;
        metaName.value = "";
        metaUrl.value = null;
        return;
    }

    const startTime = performance.now();
    loading.value = true;
    generationTime.value = null;
    apiSlow.value = false;
    apiError.value = false;

    // Fetch meta
    const type = targetType.value;
    const platform = selectedPlatform.value;
    try {
        const metaPath = platform === "curseforge"
            ? `/curseforge/meta/${type}/${encodeURIComponent(id)}`
            : platform === "hangar"
            ? `/hangar/meta/${encodeURIComponent(id)}?type=${type}`
            : platform === "spigot"
            ? `/spigot/meta/${encodeURIComponent(id)}?type=${type}`
            : `/modrinth/meta/${type}/${encodeURIComponent(id)}`;
        const res = await fetch(metaPath);
        if (res.ok) {
            const data = await res.json();
            if (data?.name) metaName.value = data.name;
            if (data?.url) metaUrl.value = data.url;
        }
    } catch { /* ignore */ }

    // Load preview image
    const url = embedUrl.value;
    if (!url) { loading.value = false; return; }

    const img = new Image();
    img.src = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;

    img.onload = async () => {
        const endTime = performance.now();
        generationTime.value = Math.round(endTime - startTime);
        loading.value = false;
        previewSrc.value = img.src;

        try {
            const res = await fetch(url, { method: "HEAD" });
            const errorStatus = res.headers.get("X-Error-Status");
            const apiTime = res.headers.get("X-API-Time");
            apiError.value = !!(errorStatus && (errorStatus.startsWith("5") || ["502", "503", "504"].includes(errorStatus)));
            const ms = apiTime?.match(/(\d+)ms/)?.[1];
            apiSlow.value = !!(ms && parseInt(ms) > 2000);
        } catch {
            apiError.value = false;
        }
    };

    img.onerror = () => {
        loading.value = false;
        generationTime.value = null;
        previewSrc.value = null;
        fetch(url, { method: "HEAD" }).then((res) => {
            const errorStatus = res.headers.get("X-Error-Status");
            apiError.value = !!(errorStatus && (errorStatus.startsWith("5") || ["502", "503", "504"].includes(errorStatus)));
        }).catch(() => { apiError.value = false; });
    };
}

function copy(type) {
    const textMap = { markdown: markdownText.value, html: htmlText.value, url: urlText.value };
    const text = textMap[type];
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        const originals = { markdown: "Copy Markdown", html: "Copy HTML", url: "Copy URL" };
        copyLabels.value = { ...copyLabels.value, [type]: "Copied!" };
        setTimeout(() => { copyLabels.value = { ...copyLabels.value, [type]: originals[type] }; }, 2000);
    });
}

function updateFavicon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 100"><g fill="${color}" transform="translate(-195.12051,-249.04304)"><g transform="matrix(1.2138597,0,0,1.2138597,-53.114434,-63.81136)"><rect width="60" height="20" x="205.12053" y="259.04303" ry="10"/><rect width="20" height="20" x="275.12051" y="259.04303" ry="10"/><rect width="90" height="20" x="205.12053" y="319.04303" ry="10"/><rect width="90" height="20" x="204.50052" y="289.04303" ry="10"/></g></g></svg>`;
    const link = document.querySelector('link[type="image/svg+xml"]');
    if (link) link.href = "data:image/svg+xml," + encodeURIComponent(svg);
}

// ── Browser URL sync ──
function updateBrowserUrl() {
    const params = new URLSearchParams();
    const config = platformConfig.value;
    const type = targetType.value;
    const id = identifier.value.trim();

    if (selectedPlatform.value !== "modrinth") params.set("platform", selectedPlatform.value);
    if (embedType.value !== "card") params.set("type", embedType.value);
    params.set("target", type);
    if (badgeMetric.value !== "downloads") params.set("metric", badgeMetric.value);
    if (id) params.set("value", id);

    if (embedType.value === "card") {
        if (isUserLike.value && !showProjects.value) params.set("showProjects", "false");
        if (isUserLike.value && maxProjects.value !== CARD_LIMITS.DEFAULT_COUNT) params.set("maxProjects", maxProjects.value);
        if (!showVersions.value) params.set("showVersions", "false");
        if (maxVersions.value !== CARD_LIMITS.DEFAULT_COUNT) params.set("maxVersions", maxVersions.value);
        if (!relativeTime.value) params.set("relativeTime", "false");
        if (!showSparklines.value) params.set("showSparklines", "false");
        if (!showDownloadBars.value) params.set("showDownloadBars", "false");
        if (!showBorder.value) params.set("showBorder", "false");
        if (!animations.value) params.set("animations", "false");
        if (selectedColor.value !== config.defaultColor) params.set("color", selectedColor.value);
        if (selectedBgColor.value !== null) params.set("backgroundColor", selectedBgColor.value);
    } else {
        if (selectedColor.value !== config.defaultColor) params.set("color", selectedColor.value);
        if (selectedBgColor.value !== null) params.set("backgroundColor", selectedBgColor.value);
        if (!showIcon.value) params.set("showIcon", "false");
        if (!showBorder.value) params.set("showBorder", "false");
    }

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
}

function loadFromUrl() {
    const rawParams = new URLSearchParams(window.location.search);

    // Handle ?url= shortcut
    const urlParam = rawParams.get("url");
    if (urlParam) {
        urlInput.value = urlParam;
        nextTick(() => onUrlInput());
        return;
    }

    const platform = rawParams.get("platform") || "modrinth";
    const config = PLATFORMS[platform];

    selectedPlatform.value = platform;
    embedType.value = rawParams.get("type") || "card";
    targetType.value = rawParams.get("target") || config.targets[0];
    badgeMetric.value = rawParams.get("metric") || "downloads";
    identifier.value = rawParams.get("value") || "";

    showProjects.value = rawParams.get("showProjects") !== "false";
    maxProjects.value = parseInt(rawParams.get("maxProjects")) || CARD_LIMITS.DEFAULT_COUNT;
    showVersions.value = rawParams.get("showVersions") !== "false";
    maxVersions.value = parseInt(rawParams.get("maxVersions")) || CARD_LIMITS.DEFAULT_COUNT;
    relativeTime.value = rawParams.get("relativeTime") !== "false";
    showSparklines.value = rawParams.get("showSparklines") !== "false";
    showDownloadBars.value = rawParams.get("showDownloadBars") !== "false";
    showIcon.value = rawParams.get("showIcon") !== "false";
    showBorder.value = rawParams.get("showBorder") !== "false";
    animations.value = rawParams.get("animations") !== "false";
    selectedColor.value = rawParams.get("color") || config.defaultColor;
    selectedBgColor.value = rawParams.get("backgroundColor") || null;

    document.documentElement.style.setProperty("--platform-color", `#${config.defaultColor}`);
    updateFavicon(`#${config.defaultColor}`);

    // Auto-expand customization if URL has custom values
    const hasCustom = selectedColor.value !== config.defaultColor
        || selectedBgColor.value !== null
        || !showProjects.value || maxProjects.value !== CARD_LIMITS.DEFAULT_COUNT
        || !showVersions.value || maxVersions.value !== CARD_LIMITS.DEFAULT_COUNT
        || !relativeTime.value || !showSparklines.value || !showDownloadBars.value
        || !showIcon.value || !showBorder.value || !animations.value;

    if (hasCustom && customizationSection.value) {
        nextTick(() => {
            // The CollapsibleSection exposes expanded via ref
        });
    }

    generate();
}

onMounted(() => {
    loadFromUrl();
});
</script>
