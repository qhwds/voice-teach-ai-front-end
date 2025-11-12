<template>
  <el-container class="full-height">
    <!-- 侧边栏 -->
    <el-header class="header">
      <!-- 标题 -->
      <div class="header-title">VoiceTutor</div>
      <!-- 自定义菜单 -->
      <ul class="custom-menu">
        <li
            class="menu-item"
            :class="{ active: currentComponent === Texttospeech }"
            @click="handleMenuSelect('1')"
        >
<!--          <el-tooltip content="文本转语音" placement="bottom">-->
<!--            <div class="menu-icon-container">-->
<!--              <el-image src="src/assets/tts.png" fit="contain" class="menu-icon" />-->
<!--            </div>-->
<!--          </el-tooltip>-->
          <div class="menu-icon-container">
            个性化语音
          </div>
        </li>
        <li
            class="menu-item"
            :class="{ active: currentComponent === Ppt }"
            @click="handleMenuSelect('2')"
        >
<!--          <el-tooltip content="PPT生成" placement="bottom">-->
<!--            <div class="menu-icon-container">-->
<!--              <el-image src="src/assets/ppt.png" fit="contain" class="menu-icon" />-->
<!--            </div>-->
<!--          </el-tooltip>-->
          <div class="menu-icon-container">
            PPT制作
          </div>
        </li>
        <li
            class="menu-item"
            :class="{ active: currentComponent === Addload }"
            @click="handleMenuSelect('3')"
        >
<!--          <el-tooltip content="文件上传" placement="bottom">-->
<!--            <div class="menu-icon-container">-->
<!--              <el-image src="src/assets/v.png" fit="contain" class="menu-icon" />-->
<!--            </div>-->
<!--          </el-tooltip>-->
          <div class="menu-icon-container">
            用户语言上传
          </div>
        </li>
      </ul>



      <div class="header-content">
        <!-- 根据用户是否登录显示不同内容 -->
        <div v-if="isLoggedIn">
          <div class="user-info">
            <div class="avatar-upload" @click="toggleDropdown">
              <el-image
                  :src="avatarUrl"
                  fit="cover"
                  class="avatar"
              >
                <template v-slot:error>
                  <div class="avatar-placeholder">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </template>
              </el-image>
              <input
                  type="file"
                  ref="fileInput"
                  style="display: none;"
                  accept="image/jpeg, image/png"
                  @change="handleFileChange"
              />
            </div>
            <!-- 下拉菜单 -->
            <div v-if="isDropdownVisible" class="dropdown-menu">
              <ul>
                <li @click="triggerFileInput">上传头像</li>
                <li @click="goToPersonalCenter">个人中心</li>
                <li @click="goToMySoundSamples">我的声音样本</li>
              </ul>
            </div>
            <el-image src="src/assets/退出登录.png" fit="contain" class="login-out" @click="OutLogin"/>
          </div>
          <!-- 上传成功提示 -->
        </div>
        <div v-else>
          <el-button @click="goToLogin">登录</el-button>
          <el-button @click="goToRegister">注册</el-button>
        </div>
      </div>
      </el-header>
    <!-- 主容器 -->
    <el-container class="main-container">
      <!-- 主内容 -->
      <el-main class="main-content">
        <component :is="currentComponent" ref="currentComponentRef"/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
// 引入组件
import Texttospeech from "@/views/texttospeech.vue";
import Ppt from "@/views/ppt.vue";
import Addload from "@/views/addload.vue";
import SoundLibrary from "@/views/soundLibrary.vue";
import {computed, onMounted, ref, shallowRef} from "vue";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";
import { useUserStore} from "@/stores/userStore.js";
const userStore = useUserStore();
const authStore = useAuthStore();
const jwtToken = authStore.accessToken; // 替换为实际的 JWT Token
// 响应式变量
const avatarUrl = ref("src/assets/logo.svg"); // 默认头像
const fileInput = ref(null); // 文件输入框引用
const dialogVisible = ref(false); // 控制上传成功提示对话框
const headers = ref({}); // 请求头
// 判断用户是否登录
const isLoggedIn = computed(() => {
  return authStore.isLoggedIn;
});
// 跳转到登录页面
const goToLogin = () => {
  router.push('/login');
};

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register');
};
// 获取用户的 access_token
const fetchToken = () => {
  headers.value = {
        Authorization: `Bearer ${jwtToken}`,
  };
};

// 点击头像时触发文件选择
const triggerFileInput = () => {
  fetchToken(); // 确保 token 已获取
  fileInput.value.click(); // 触发文件选择对话框
};

// 处理文件选择变化
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      ElMessage.error("只能上传 JPG/PNG 格式的图片");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error("图片大小不能超过 5MB");
      return;
    }
    avatarUrl.value = URL.createObjectURL(file); // 使用临时 URL 预览图片
    uploadAvatar(file); // 上传头像
  }
};

// 上传头像到服务器
const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  console.log("上传头像body:", formData);
  fetch("/api/auth/avatar", {
    method: "PUT",
    headers: headers.value,
    body: formData,
  })
    .then((response) => {
      //返回的数据
      console.log("后端返回的数据:", response);
      console.log("后端:", response.ok);
      if (!response.ok) {
        console.error("上传失败:", response.statusText);
        throw new Error("上传失败");
      }else {
        dialogVisible.value = true;
        ElMessage.success("头像上传成功！");
      }
    })
    .catch((error) => {
      ElMessage.error(error.message);
      console.error("上传错误:", error);
    });
};
// 定义响应式变量，用于存储当前选中的组件
const currentComponent = shallowRef(null);
currentComponent.value = Addload; // 默认选中组件为 Texttospeech 即文本转语言界面

// 引用组件实例
const currentComponentRef = ref(null);

// 菜单选择处理函数 选中菜单显示对于的组件
const handleMenuSelect = (key) => {
  switch (key) {
    case '1':
      currentComponent.value = Texttospeech;
      break;
    case '2':
      currentComponent.value = Ppt;
      break;
    case '3':
      currentComponent.value = Addload;
      break;
    default:
      return;
  }
};
// 菜单展开时的处理函数
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath); // 打印展开的菜单项及其路径
};
// 菜单关闭时的处理函数
const handleClose = (key, keyPath) => {
  console.log(key, keyPath); // 打印关闭的菜单项及其路径
};
const OutLogin=()=>{
  isDropdownVisible.value = false; // 点击后关闭菜单
  authStore.clearTokens(); // 清除 token
  userStore.clearUser(); // 清除用户信息
}

const router = useRouter();

// 页面加载时获取用户头像
onMounted(() => {
  avatarUrl.value = userStore.user.avatar_url
});

// 控制下拉菜单显示的响应式变量
const isDropdownVisible = ref(false);
// 切换下拉菜单的显示状态
const toggleDropdown = () => {
  isDropdownVisible.value = !isDropdownVisible.value;
};

// 跳转到个人中心
const goToPersonalCenter = () => {
  // 这里添加跳转到个人中心的路由逻辑
  router.push('/personal-center');
  isDropdownVisible.value = false; // 点击后关闭菜单
};

// 跳转到我的声音样本页面
const goToMySoundSamples = () => {
  // 这里添加跳转到我的声音样本页面的路由逻辑
  router.push('/my-sound-samples');
  isDropdownVisible.value = false; // 点击后关闭菜单
};
</script>

<style scoped>
/* Overall Container */
.full-height {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  /* 添加左右边距 */
  margin-left: 200px; 
  margin-right: 200px; 
}

/* Header Bar Optimization */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 20px; 
  right: 20px; 
  z-index: 1000;
  height: 70px;
  transition: all 0.3s ease;
}

.header:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

/* Title Style Optimization */
.header-title {
  font-size: 32px;
  font-weight: 700;
  margin-right: 40px;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

/* Custom Menu Style Optimization */
.custom-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 20px;
}

.menu-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 48px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-item.active {
  background: linear-gradient(135deg, #409eff 0%, #2c3e50 100%);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
}

.menu-icon-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

/* User Info Area Optimization */
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.login-out {
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-out:hover {
  transform: scale(1.1);
  opacity: 1;
  background: #ff4d4f;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

/* Avatar Style */
.avatar-upload {
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  border: 3px solid rgba(255, 255, 255, 0.8);
  width: 40px;
  height: 40px;
}

.avatar-upload:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
  border-color: #409eff;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  color: #909399;
  font-size: 20px;
  transition: all 0.3s ease;
}

/* Header Content */
.header-content {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-right: 16px;
}

/* Main Container Optimization */
.main-container {
  flex: 1;
  display: flex;
  margin-top: 70px;
  overflow: hidden;
  flex-direction: column;
  background: transparent;
}

/* Main Content Style Optimization */
.main-content {
  padding: 32px;
  flex: 1;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  margin: 20px;
  transition: all 0.3s ease;
}

.main-content:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.08);
}
.dropdown-menu {
  position: absolute;
  top: 60px; /* 根据实际情况调整位置 */
  right: 20px; /* 根据实际情况调整位置 */
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dropdown-menu li:hover {
  background-color: #f5f5f5;
}
/* Responsive Design */
@media (max-width: 768px) {
  .full-height {
    margin-left: 10px;
    margin-right: 10px;
  }

  .header {
    left: 10px;
    right: 10px;
    padding: 0 16px;
    height: 60px;
  }

  .header-title {
    font-size: 24px;
  }

  .menu-item {
    width: 100px;
    height: 40px;
    font-size: 14px;
  }

  .main-content {
    padding: 16px;
    margin: 10px;
  }

  .header-content {
    padding-right: 8px;
  }
  
  .user-info {
    gap: 12px;
  }
  
  .avatar-upload {
    width: 36px;
    height: 36px;
  }
  
  .login-out {
    width: 32px;
    height: 32px;
  }
}
</style>