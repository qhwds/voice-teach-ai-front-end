// stores/userVoiceStore.js
import { defineStore } from 'pinia';

export const useVoiceUserStore = defineStore('userVoice', {
    state: () => ({
        userVoiceList: [], // 存储用户语音列表
        totalRecords: 0, // 总记录数
    }),
    getters: {
        // 获取用户语音列表
        getUserVoiceVoices:(state) => state.userVoiceList,
        // 获取总记录数
        getTotalRecords:(state) => state.totalRecords,
    },
    actions: {
        // 设置用户语音列表
        setUserVoiceList(data) {
            this.userVoiceList = data;
        },
        // 设置总记录数
        setTotalRecords(total) {
            this.totalRecords = total;
        },
        // 清空用户语音列表
        clearUserVoiceList() {
            this.userVoiceList = [];
            this.totalRecords = 0;
        },
    },
});