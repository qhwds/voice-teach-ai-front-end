<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="form-header">
        <h2>创建账号</h2>
        <p>开启您的美好旅程</p>
      </div>
      <form @submit.prevent="handleRegister" class="floating-form">
        <div class="input-group">
          <input type="text" id="username" v-model="username" required minlength="4" maxlength="20" />
          <label for="username">用户名</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input type="email" id="email" v-model="email" required />
          <label for="email">邮箱地址</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input type="password" id="password" v-model="password" required minlength="6" maxlength="20" @input="checkPasswordStrength"/>
          <label for="password">密码</label>
          <span class="highlight"></span>
        </div>
         <!-- 密码强度提示 -->
         <div v-if="passwordStrength" class="password-strength">
          <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
        </div>
        <div class="input-group">
          <input type="password" id="confirmPassword" v-model="confirmPassword" required minlength="6" maxlength="20" />
          <label for="confirmPassword">确认密码</label>
          <span class="highlight"></span>
        </div>
        <!-- 个人资料填写区域 -->
        <div class="input-group">
          <input type="text" id="name" v-model="name" />
          <label for="name">姓名</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input type="text" id="occupation" v-model="occupation" />
          <label for="occupation">职业</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input type="text" id="phone" v-model="phone" minlength="11" maxlength="11" />
          <label for="phone">手机号</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <select id="gender" v-model="gender" class="custom-select">
            <option value="" disabled>请选择您的性别</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
          <label for="gender" class="custom-label">性别</label>
          <span class="highlight"></span>
        </div>
        <!-- 我已阅读并同意用户协议和隐私政策复选框 -->
        <div class="input-group checkbox-group">
          <input type="checkbox" id="agree" v-model="isAgreed" />
          <label for="agree">我已阅读并同意 <a href="#" target="_blank">用户协议</a> 和 <a href="#" target="_blank">隐私政策</a></label>
        </div>
        <button type="submit" class="submit-btn">
          <span>立即注册</span>
          <i class="arrow-icon"></i>
        </button>
        <div class="form-footer">
          <span>已有账号？</span>
          <router-link to="/login" class="login-link">立即登录</router-link>
        </div>
      </form>
    </div>
    <!-- 滑动验证模态框 -->
    <Modal :show="showSlideVerify" @update:show="showSlideVerify = $event">
      <slide-verify
          :l="42"
          :r="10"
          :w="310"
          :h="155"
          slider-text="向右滑动完成验证"
          @success="onSlideSuccess"
          @fail="onSlideFail"
      ></slide-verify>
    </Modal>
    <!-- 注册成功消息提示 -->
    <Message :show="showMessage" :message="messageText" />
  </div>
</template>

<script setup>
import {ref} from 'vue'
import SlideVerify from 'vue3-slide-verify' // 导入滑动验证组件
import 'vue3-slide-verify/dist/style.css'
import Modal from '@/components/modal.vue'
import Message from "@/components/message.vue";
import axios from "axios";
import {useUserStore} from "@/stores/userStore.js";
import router from "@/router/index.js";

const userStore = useUserStore(); 
// 定义响应式数据变量
const username = ref('')
const email = ref('')
const phone = ref('')
const verificationCode = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const gender = ref('')
const occupation = ref('')

// 控制滑动验证模态框的显示
const showSlideVerify = ref(false)
// 是否通过滑动验证
const isVerified = ref(false)
// 控制消息提示的显示和内容
const showMessage = ref(false)
const messageText = ref('')
// 密码强度相关变量
const passwordStrength = ref('')
const passwordStrengthClass = ref('')
// 是否同意用户协议和隐私政策
const isAgreed = ref(false)
// 检查密码强度
const checkPasswordStrength = () => {
  const passwordValue = password.value
  let strength = 0

  if (passwordValue.length >= 8) {
    strength++
  }
  if (/[A-Z]/.test(passwordValue)) {
    strength++
  }
  if (/[a-z]/.test(passwordValue)) {
    strength++
  }
  if (/[0-9]/.test(passwordValue)) {
    strength++
  }
  if (/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) {
    strength++
  }

  switch (strength) {
    case 0:
    case 1:
      passwordStrength.value = '弱'
      passwordStrengthClass.value = 'weak'
      break
    case 2:
    case 3:
      passwordStrength.value = '中'
      passwordStrengthClass.value = 'medium'
      break
    case 4:
    case 5:
      passwordStrength.value = '强'
      passwordStrengthClass.value = 'strong'
      break
  }
}
// 处理注册逻辑的方法
const handleRegister = () => {
  if (!isAgreed.value) {
    alert('请阅读并同意用户协议和隐私政策');
    return;
  }
  // 每次点击注册按钮时重置验证状态
  if(!isVerified.value){
    showSlideVerify.value = true; // 显示滑动验证模态框
  }


  // 如果已经通过验证，继续执行注册逻辑
  if (isVerified.value) {
    if (password.value !== confirmPassword.value) {
      alert('两次输入的密码不一致');
      return;
    }

    // 构造注册请求数据
    const registerData = {
      username: username.value,
      email: email.value,
      password: password.value
    };
    console.log('注册请求数据:', {
      username: username.value,
      email: email.value,
      password: password.value,
    });
    // 发送注册请求
    axios.post('/api/auth/register', registerData)
        .then(response => {
          // 注册成功
          const { user_id, username, email } = response.data;
          userStore.setUser({ user_id, username, email }); // 存储用户信息到 Pinia store
          console.log('用户信息已存储:', userStore.user);
          console.log('注册成功：', response.data);
          registerSuccess();
        })
        .catch(error => {
          // 注册失败
          console.error('注册失败：', error.response.data);
          if (error.response.status === 409) {
            alert('邮箱已被注册');
          } else {
            alert('注册失败，请稍后重试');
          }
        });
  }
};
// 注册成功后的处理
const registerSuccess = () => {
  showMessage.value = true
  messageText.value = '注册成功！'

  setTimeout(() => {
    showMessage.value = false
    // 跳转到登录页面
    router.push('/login')
  }, 2000)
}

// 滑动验证成功回调
const onSlideSuccess = () => {
  isVerified.value = true;
  showSlideVerify.value = false; // 验证通过后关闭模态框
  console.log('滑动验证成功');
  handleRegister(); // 调用注册逻辑
};

// 滑动验证失败回调
const onSlideFail = () => {
  isVerified.value = false
  console.log('滑动验证失败')
}

</script>

<style scoped>
.register-wrapper {
  min-height: 93.5vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px;
  padding: 40px;
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

.verification-group {
  display: flex;
  gap: 10px;
}

.verification-group input {
  flex: 1;
}
.password-strength {
  margin-top: -20px;
  margin-bottom: 20px;
  font-size: 14px;
}

.weak {
  color: #ff0000;
}

.medium {
  color: #ff9900;
}

.strong {
  color: #008000;
}

.send-code-btn {
  padding: 0 20px;
  background: #e8f5fe;
  color: #3498db;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-code-btn:hover {
  background: #d0e9fd;
}

.submit-btn {
  width: 100%;
  padding: 15px;
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
.custom-select {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
}

.custom-select:focus {
  border-color: #3498db;
}

.custom-label {
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

.custom-select:focus + .custom-label,
.custom-select:valid + .custom-label {
  top: 0;
  font-size: 14px;
  color: #3498db;
}
.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input {
  width: auto;
  margin-right: 10px;
}

.checkbox-group label {
  position: relative;
  top: auto;
  left: auto;
  transform: none;
  background: none;
  padding: 0;
}

@media (max-width: 480px) {
  .register-container {
    padding: 20px;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .input-group input {
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .register-container {
    max-width: 400px;
    padding: 30px;
  }

  .form-header h2 {
    font-size: 28px;
  }

  .form-header p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 20px;
    margin: 10px;
    max-width: 100%;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .form-header p {
    font-size: 14px;
  }

  .input-group input {
    padding: 12px;
    font-size: 14px;
  }

  .input-group label {
    font-size: 14px;
  }

  .verification-group {
    flex-direction: column;
    gap: 5px;
  }

  .send-code-btn {
    width: 100%;
    padding: 12px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 16px;
  }
}

@media (max-width: 320px) {
  .register-container {
    padding: 15px;
  }

  .form-header h2 {
    font-size: 20px;
  }

  .input-group {
    margin-bottom: 20px;
  }
}
</style>