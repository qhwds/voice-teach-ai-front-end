import { defineStore } from 'pinia';

export const useVoiceStandardStore = defineStore('voiceLibrary', {
    state: () => ({
        standardVoices: [], // 存储标准语音库数据
        totalRecords: 0, // 总记录数
        totalPages: 0, // 总页数
    }),
    getters: {
        // 获取标准语音库数据
        getStandardVoices: (state) => state.standardVoices,
    },
    actions: {
        // 存储标准语音库数据
        setStandardVoices(data) {
            this.standardVoices = data.items; // 假设返回的数据中有 `items` 字段
            this.totalRecords = data.total; // 假设返回的数据中有 `total` 字段
            this.totalPages = data.total_pages; // 假设返回的数据中有 `total_pages` 字段
        },
        // 设置总记录数
        setTotalRecords(total) {
            this.totalRecords = total;
        },
        // 设置总页数
        setTotalPages(total) {
            this.totalPages = total;
        },
        //清除
        clearStandardVoiceList() {
            this.standardVoices = [];
            this.totalRecords = 0;
            this.totalPages = 0;
        },
    },
});