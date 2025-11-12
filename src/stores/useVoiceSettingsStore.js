// stores/useVoiceSettingsStore.js
import { defineStore } from 'pinia';

export const useVoiceSettingsStore = defineStore('voiceSettings', {
    state: () => ({
        volume: 0.5, // 默认音量
        selectedLanguage: '',
        selectedScene: '',
        selectedFormat: '',
        selectedRhythm: '', 
    }),
    actions: {
        setVolume(volume) {
            this.volume = volume;
        },
        setSelectedLanguage(language) {
            this.selectedLanguage = language;
        },
        setSelectedScene(scene) {
            this.selectedScene = scene;
        },
        setSelectedFormat(format) {
            this.selectedFormat = format;
        },
        setSelectedRhythm(rhythm) {
            this.selectedRhythm = rhythm;
        },
    },
    // persist: true, // 可选：如果你希望状态持久化
});