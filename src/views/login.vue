<template>
  <div class="login-wrapper">
    <!-- 图片按钮 -->
    <!-- <div class="image-button" @click="toggleImage">
      <el-image
          :src="currentImage"
          fit="cover"
          class="toggle-image"
      ></el-image>
    </div> -->
    <div class="login-container">
      <div class="form-header">
        <h2>用户登录</h2>
        <p>欢迎回来，请登录您的账号</p>
      </div>
      <form @submit.prevent="handleLogin" class="floating-form">
        <div class="input-group">
          <input id="username" v-model.trim="email" type="email" autocomplete="off" @input="validateInput" required />
          <label for="username">邮箱</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input id="password" v-model.trim="password" type="password" autocomplete="off" @input="validateInput" required />
          <label for="password">密码</label>
          <span class="highlight"></span>
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn" :disabled="!isFormValid">
          <span>登录</span>
          <i class="arrow-icon"></i>
        </button>
        <div class="form-footer">
          <span>还没有账号？</span>
          <a href="/register">立即注册</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import {useUserStore} from "@/stores/userStore.js";
import axios from 'axios';
const router = useRouter() // 路由实例
const authStore = useAuthStore(); // 身份验证存储
const userStore = useUserStore(); // 用户信息存储
// 当前语言
const currentLanguage = ref('zh'); // 默认语言为中文
// 表单数据
const loginForm = reactive({
  email: '', // 用户名
  password: ''  // 密码
})
const email = ref('') // 邮箱
const password = ref('')   // 密码
// 错误消息
const errorMsg = ref('') // 初始为空字符串
// 表单验证状态
const isFormValid = ref(false) // 初始为 false
// 图片相关
const imageList = ref([
  'src/assets/ch.png', // 替换为实际图片URL
  'src/assets/en.png', // 替换为实际图片URL
]);
const currentImage = ref(imageList.value[0]); // 当前显示的图片

// 输入验证函数
const validateInput = () => {
  // 基本验证
  if (email.value && password.value) {
    // 如果用户名和密码都不为空，则表单有效
    isFormValid.value = true
    // 清空错误消息
    errorMsg.value = ''
  } else {
    // 否则表单无效
    isFormValid.value = false
  }
}

// 登录处理函数
const handleLogin = async () => {
  // 防止XSS攻击的正则表达式
  const xssPattern = /([~{}"'<>?])/g
  // 检查用户名和密码是否包含非法字符
  if (xssPattern.test(email.value) || xssPattern.test(password.value)) {
    errorMessage('警告:输入内容包含非法字符'); // 显示错误消息
    return // 停止执行
  }
  // 登录数据
  const loginData = {
    email: email.value,
    password: password.value,
  };
  console.log('登录请求:', loginData);
  // 登录请求
  try {
    // 发送登录请求
    const response = await axios.post('/api/auth/login',loginData);

    // 处理成功响应
    if (response.status === 200) {
      const { access_token, token_type, expires_in } = response.data;
      // 使用Pinia存储token
      authStore.setTokens({ accessToken: access_token, tokenType: token_type, expiresIn: expires_in });
      console.log('登录返回', response);
      // 获取用户信息并存储到 userStore
      await authStore.fetchUser();
      // 跳转到主页
      router.push('/home');
    }
  } catch (error) {
    console.error('登录失败:', error);
    // 处理错误响应
    if (error.response && error.response.status === 401) {
      errorMsg.value = '无效的邮箱或密码';
    } else {
      errorMsg.value = '登录失败，请稍后重试';
    }
  }
}

// 错误提示函数
const errorMessage = (text) => {
  errorMsg.value = text // 设置错误消息
  setTimeout(() => {
    errorMsg.value = '' // 3秒后清空错误消息
  }, 3000)
}

// 组件挂载后执行验证
onMounted(() => {
  validateInput()
  console.log('当前注册用户信息:', userStore.user);
})

// 切换语言
const changeLanguage = (lang) => {
  currentLanguage.value = lang; // 更新当前语言
};

// 切换图片
const toggleImage = () => {
  currentImage.value = currentImage.value === imageList.value[0]
      ? imageList.value[1]
      : imageList.value[0];
  router.push('/en-login')
  console.log('切换图片成功，当前图片:', currentImage.value)
};
watch(
    () => userStore.user,
    (newUser) => {
      console.log('用户信息已更新:', newUser);
    },
    { immediate: true }
);
</script>

<style scoped>
.login-wrapper {
  min-height: 93.5vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  padding-right: 80px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 700;
}

.form-header p {
  color: #95a5a6;
  font-size: 16px;
}

.floating-form .input-group {
  position: relative;
  margin-bottom: 30px;
}

.input-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: transparent;
}

.input-group label {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 5px;
  color: #95a5a6;
  font-size: 16px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-group input:focus,
.input-group input:valid {
  border-color: #3498db;
}

.input-group input:focus + label,
.input-group input:valid + label {
  top: 0;
  font-size: 14px;
  color: #3498db;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  margin-left: 15px;
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.arrow-icon {
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(-45deg);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #95a5a6;
}

.form-footer a {
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 600;
}

.form-footer a:hover {
  text-decoration: underline;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
}

.image-button {
  position: absolute;
  top: 20px;
  right: 20px;
}


.toggle-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  /* 可选：使图片呈圆形 */
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.image-button:hover .toggle-image {
  transform: scale(1.1);
}
</style>