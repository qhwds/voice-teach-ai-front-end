// stores/auth.js
import { defineStore } from 'pinia';
import axios from "axios";
export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
        tokenType: null,
        expiresIn: null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.accessToken,
    },
    actions: {
        setTokens({ accessToken, tokenType, expiresIn }) {
            console.log('收到的 tokens', accessToken, tokenType, expiresIn);
            this.accessToken = accessToken;
            this.tokenType = tokenType;
            this.expiresIn = expiresIn;
        },
        clearTokens() {
            console.log('清除 tokens');
            this.accessToken = null;
            this.tokenType = null;
            this.expiresIn = null;
        },
        async fetchUser() {
            if (!this.accessToken) {
                console.error('No access token available');
                return;
            }

            try {
                const response = await axios.get('/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                });
                // 将用户信息存储到 userStore
                const { useUserStore: userStore } = await import('@/stores/userStore.js');
                const userStoreInstance = userStore();
                userStoreInstance.setUser(response.data);// 调用 userStore 的 setUser 方法
                console.log('通过tokens获得的用户信息:', response.data);
            } catch (error) {
                console.error('获取用户信息失败:', error);
                this.user = null; // 清除用户信息
            }
        },
    },
});