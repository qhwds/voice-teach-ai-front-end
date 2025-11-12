// stores/voiceDetailsStore.js
import { defineStore } from 'pinia';

export const useVoiceDetailsStore = defineStore('voiceDetails', {
    state: () => ({
        voiceDetail: null, // 用于存储单个语音的详细信息
        voiceDetailsList: [], // 用于存储多个语音的详细信息
    }),
    getters: {
        // 获取单个语音的详细信息
        getVoiceDetail() {
            return this.voiceDetail;
        },
        // 获取多个语音的详细信息
        getVoiceDetailsList() {
            return this.voiceDetailsList;
        },
    },
    actions: {
        // 存储单个语音的详细信息
        setVoiceDetail(detail) {
            this.voiceDetail = detail;
        },
        // 存储多个语音的详细信息
        setVoiceDetailsList(details) {
            this.voiceDetailsList = details;
        },
    },
});