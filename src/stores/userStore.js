// stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('userStore', {
    state: () => ({
        user: {
            user_id: null,
            username: null,
            email: null,
            avatar_url: null,
        }, // 存储用户信息
    }),
    actions: {
        setUser(userData) {
            // 动态解构后端返回的数据并更新 state
            console.log('更新用户数据:', userData);
            this.user = {
                ...this.user, // 保留已有字段
                ...userData,  // 更新新字段
            };
        },
        clearUser() {
            this.user = {
                user_id: null,
                username: null,
                email: null,
                avatar_url: null,
            };
        },
    },
});