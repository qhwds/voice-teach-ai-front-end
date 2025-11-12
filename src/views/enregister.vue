<template>
  <div class="register-wrapper">
    <div class="register-container">
      <div class="form-header">
        <h2>Create an Account</h2>
        <p>Start Your Journey</p>
      </div>
      <form @submit.prevent="handleRegister" class="floating-form">
        <div class="input-group">
          <input type="text" id="username" v-model="username" required maxlength="20" />
          <label for="username">Username</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input type="email" id="email" v-model="email" required />
          <label for="email">Email Address</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input type="text" id="phone" v-model="phone" required minlength="11" maxlength="11"/>
          <label for="phone">Phone Number</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input type="password" id="password" v-model="password" required minlength="6" maxlength="20" />
          <label for="password">Password</label>
          <span class="highlight"></span>
        </div>
        <div class="input-group">
          <input type="password" id="confirmPassword" v-model="confirmPassword" required minlength="6" maxlength="20" />
          <label for="confirmPassword">Confirm Password</label>
          <span class="highlight"></span>
        </div>
        <button type="submit" class="submit-btn">
          <span> Register Now</span>
          <i class="arrow-icon"></i>
        </button>
        <div class="form-footer">
          <span> Already have an account?</span>
          <a href="/en-login"> Log In Now</a>
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
          slider-text="Slide to the right to complete verification"
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
import SlideVerify from 'vue3-slide-verify'
import 'vue3-slide-verify/dist/style.css'
import Modal from '@/components/Modal.vue'
import Message from "@/components/message.vue";

// 定义响应式数据变量
const username = ref('')
const email = ref('')
const phone = ref('')
const verificationCode = ref('')
const password = ref('')
const confirmPassword = ref('')

// 控制滑动验证模态框的显示
const showSlideVerify = ref(false)
// 是否通过滑动验证
const isVerified = ref(false)
// 控制消息提示的显示和内容
const showMessage = ref(false)
const messageText = ref('')

// 处理注册逻辑的方法
const handleRegister = () => {
  // 每次点击注册按钮时重置验证状态
  isVerified.value = false;
  showSlideVerify.value = true; // 显示滑动验证模态框

  // 如果已经通过验证，继续执行注册逻辑
  if (isVerified.value) {
    if (password.value !== confirmPassword.value) {
      alert('The passwords do not match');
      return;
    }

    // 输出表单数据到控制台
    console.log({
      username: username.value,
      email: email.value,
      phone: phone.value,
      verificationCode: verificationCode.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    })

    // 注册成功
    registerSuccess()
  }
}
// 注册成功后的处理
const registerSuccess = () => {
  showMessage.value = true
  messageText.value = 'Registration Successful！'

  setTimeout(() => {
    showMessage.value = false
    // 跳转到登录页面
    window.location.href = '/en-login'
  }, 2000)
}

// 滑动验证成功回调
const onSlideSuccess = () => {
  isVerified.value = true
  showSlideVerify.value = false // 验证通过后关闭模态框
  console.log('滑动验证成功')
  // 直接执行注册逻辑
  if (password.value !== confirmPassword.value) {
    alert('The passwords do not match');
    return;
  }

  // 输出表单数据到控制台
  console.log({
    username: username.value,
    email: email.value,
    phone: phone.value,
    verificationCode: verificationCode.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  });

  // 注册成功
  registerSuccess();
}

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