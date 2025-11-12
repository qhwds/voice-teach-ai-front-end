import { defineStore } from 'pinia';
import axios from 'axios';
import { useUserStore } from './userStore'; // 引入 userStore
export const useVoiceLibraryStore = defineStore('voiceLibraryStore', {
    state: () => ({
        userId: null, // 用户 ID
        referenceText: '', // 参考文本
        referenceAudio: null, // 参考音频文件
        fileName: '', // 文件名
    }),
    actions: {
        // 设置用户 ID
        setUserId(userId) {
            this.userId = userId;
        },
        // 设置参考文本
        setReferenceText(text) {
            this.referenceText = text;
        },
        // 设置参考音频文件
        setReferenceAudio(file) {
            this.referenceAudio = file;
            this.fileName = file.name; // 同时保存文件名
        },
        // 上传语音模型
        async uploadVoiceModel(jwtToken) {
            const userStore = useUserStore(); // 获取 userStore 实例
            const userId = userStore.user.user_id; // 从 userStore 中获取用户 ID
            if (userId || !this.referenceText || !this.referenceAudio) {
                throw new Error('用户 ID、参考文本或音频文件缺失');
            }

            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('voice_name', '用户自定义名称'); // 可以动态设置
            formData.append('voice_type', '人物'); // 固定值
            formData.append('voice_category', '服务类'); // 固定值
            formData.append('reference_text', this.referenceText);
            formData.append('reference_audio', this.referenceAudio);

            try {
                const response = await axios.post(
                    '/api/voice_library_user/upload',
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                return response.data; // 返回响应数据
            } catch (error) {
                console.error('上传语音模型失败:', error.response?.data || error.message);
                throw error;
            }
        },
    },
});