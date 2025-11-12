// stores/select_standardvoiceStore.js
import { defineStore } from 'pinia';

export const use_standardVoiceStore = defineStore('select_standard_voice', {
    state: () => ({
        voice: null, // 存储当前选择的语音
    }),
    getters: {
        getVoice() {
            return this.voice;
        },
    },
    actions: {
        setVoice(voice) {
            this.voice = voice;
        },
        resetVoice() {
            this.voice = null;
        },
    },
});