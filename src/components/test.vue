<template>
  <div class="tts-container">
    <div class="ai-teaching-platform">
      <header class="header">
        <h1>AI 驱动的教学语言伙伴 - 开启高效学习新体验</h1>
      </header>
      <main class="main-content">
        <section class="introduction">
          <p>
            在教育数字化浪潮中，我们精心打造的基于 AI 的教学语言平台脱颖而出。突破传统教学局限，借助先进人工智能技术，为每一位学习者量身定制专属学习路径，让语言学习变得轻松高效，随时随地畅享优质教育资源。
          </p>
        </section>
      </main>
      <hr>
    </div>
    <hr>
    <div class="tts-top">
      <div class="tts-top-left">
        <div class="text-container">
          <div class="textarea-container">
            <textarea v-model="text" placeholder="请输入文本..." rows="15" cols="60"></textarea>
          </div>
        </div>
        <hr>
        <!-- 覆盖层，条件渲染 -->
        <div
            v-if="isSelectVoiceVisible"
            class="select-voice-overlay"
            @click="hideSelectVoice"
        ></div>
        <!-- SelectVoice 组件，条件渲染 -->
        <SelectVoice
            v-if="isSelectVoiceVisible"
            class="select-voice-modal"
            @closeSelectVoice="hideSelectVoice"
        />
        <div class="voice-container">
          <div class="select-language-button" @click="showSelectVoice">
            选择配音语言
          </div>

          <div class="voice-set" @click="showSetVoice">
            <el-image src="src/assets/设 置.png" fit="contain" @click="showSetVoice" class="menu-icon" style="width: 25px;height: 25px"/>
          </div>
          <div
              v-if="isSetVoice"
              class="set-voice-overlay"
              @click="hideSetVoice"
          ></div>
          <SetVoice
              v-if="isSetVoice"
              class="set-voice-modal"
              style="z-index: 1001"
              @closeSetVoice="hideSetVoice"
          />
          <div class="voice-text-count">
            20/1000
          </div>
          <div class="voice-create" @click="generateVoice">
            <div class="create-img" >
              <el-image src="src/assets/生成语音文本(蓝).png" fit="contain" class="menu-icon"/>
            </div>
            <div class="create-text">
              制作
            </div>
          </div>
        </div>
        <hr>
        <div class="voice-describe">
          在这里面可以添加一些描述或者导航
        </div>
      </div>
      <div class="tts-top-right">
        <div class="tts-top-right-top">
          <div class="tts-top-right-top-text">
            AI配音结果
          </div>
          <div class="tts-top-right-top-count">
            0
          </div>
          <div class="tts-top-right-top-history" @click="showHistoryPage">
            <div class="tts-top-right-top-history-img">
              <el-image src="src/assets/历史记录.png" fit="contain" class="menu-icon" style="width: 25px;height: 25px"/>
            </div>
            <div class="tts-top-right-top-history-text">
              历史记录
            </div>
            <div
                v-if="isHistoryPageVisible"
                class="history-page-overlay"
                @click.stop="hideHistoryPage"
            ></div>
            <HistoryPage
                class="history-page-modal"
                @closeHistory="hideHistoryPage"
                v-if="isHistoryPageVisible"
            />
          </div>
        </div>
        <hr>
        <div class="tts-top-right-body">
          <div class="tts-top-right-body-img-text">
            <div class="tts-top-right-body-img">
              <el-image src="src/assets/开始录音.png" fit="contain" class="menu-icon" style="width: 100%;height: 100%;"/>
            </div>
            <div class="tts-top-right-body-text">
              暂无生成AI配音音频
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tts-bottom">
      <div>
        这里还可以继续添加内容
      </div>
      <!-- 音频播放器 -->
      <div v-if="audioUrl" class="audio-player">
        <audio controls>
          <source :src="audioUrl" type="audio/ogg">
          您的浏览器不支持音频播放。
        </audio>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SelectVoice from "@/components/select-voice.vue";
import SetVoice from "@/components/set-voice.vue";
import HistoryPage from "@/components/history-page.vue";
import axios from "axios";
const audioUrl = ref(''); // 生成的语音音频 URL
const text = ref('');
const language = ref('zh'); // 假设默认语言是中文
const settings = {
  pitch: 1.0,
  speed: 1.0,
  // 其他设置
};

const generateVoice = async () => {
  if (!text.value.trim()) {
    alert('请输入文本');
    return;
  }
  try {
    // 发送 GET 请求，指定 responseType 为 'blob'
    const params = {
      refer_wav_path: 'offical-voice-ref-wav/KangHui.wav',
      prompt_text: '你赚多少钱，这与你无关，你为什么问这个问题？',
      prompt_language: 'zh',
      text: text.value,
      text_language: 'zh',
      speed: 1,
    };
    console.log('请求参数:', params);

    const response = await axios.get('/api2/tts', {
      params,
      responseType: 'blob', // 指定响应类型为二进制数据
    });

    // 将音频流转换为可播放的 URL
    const audioBlob = new Blob([response.data], { type: 'audio/ogg' }); // 根据实际 MIME 类型调整
    audioUrl.value = URL.createObjectURL(audioBlob);
    // 添加时间戳以避免浏览器缓存
    audioUrl.value += `?t=${Date.now()}`;
    console.log('语音生成成功，音频 URL:', audioUrl.value);

    // 提示用户音频已生成
    alert('音频已生成，请点击播放按钮试听');
  } catch (error) {
    console.error('生成语音失败:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
      alert(`生成语音失败，错误代码：${error.response.status}`);
    } else if (error.request) {
      console.error('没有收到响应:', error.request);
      alert('网络错误，请检查后端服务是否运行');
    } else {
      console.error('请求配置错误:', error.message);
      alert('请求配置错误，请联系开发者');
    }
  }
};






const isSelectVoiceVisible = ref(false);
const container = ref(null);
// 显示 SelectVoice 组件
const showSelectVoice = () => {
  isSelectVoiceVisible.value = true;
};
// 隐藏 SelectVoice 组件
const hideSelectVoice = () => {
  isSelectVoiceVisible.value = false;
};
// 监听全局点击事件，点击组件外部时隐藏 SelectVoice
const handleClickOutside = (event) => {
  if (container.value && !container.value.contains(event.target)) {
    hideSelectVoice();
    hideSetVoice();
    hideHistoryPage();
  }
};
onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
const isSetVoice = ref(false);
const showSetVoice = () => {
  isSetVoice.value = true;
};
const hideSetVoice = () => {
  isSetVoice.value = false;
};
const isHistoryPageVisible = ref(false);
const showHistoryPage = () => {
  isHistoryPageVisible.value = true;
};
const hideHistoryPage = () => {
  isHistoryPageVisible.value = false;
};


</script>

<style scoped>
/* 添加 hr 样式 */
hr {
  border: 2px solid rgba(231, 222, 222, 0.6); /* 设置边框宽度和颜色 */
  border-radius: 10px;
  margin: 0 0; /* 设置上下外边距 */
}
.tts-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  flex-direction: column;
  //justify-content: space-between;
  //align-items: center;
  .ai-teaching-platform {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* 更换为更现代易读的字体 */
    padding: 30px;
    display: flex;
    flex: 1 1 10%;
    flex-direction: column;
    color: #333;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px; /* 增大标题字体大小 */
      color: #2c3e50; /* 调整标题颜色，使其更醒目 */
      font-weight: bold; /* 加粗标题文字 */
      margin-bottom: 15px;
    }
  }

  .tts-top {
    display: flex;
    flex: 1 1 30%;
    margin: 20px 0 20px 0;
    gap: 20px;
    flex-direction: row;
    justify-content: center;
    .tts-top-left {
      flex: 0 1 30%;
      border: 2px solid black;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      .text-container {
        display: flex;
        flex: 1 1 100%;
        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
        textarea{
          background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
        }
      }
      .voice-container {
        padding: 5px;
        display: flex;
        gap: 5px;
        flex-direction: row;
        align-items: flex-end;
        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
        .select-language-button {
          display: flex;
          flex: 0 1 20%;
          cursor: pointer;
        }
        .voice-set{
          display: flex;
          flex: 1 1 10%;
          cursor: pointer;
        }
        .voice-text-count{
          display: flex;
          flex: 0 1 5%;
        }
        .voice-create{
          display: flex;
          flex: 0 1 15%;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          cursor: pointer;
          background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
          .create-img{
            width: 30px;
            height: 30px;
          }
          .create-text{
            font-size: 20px;
          }
        }
      }
      .voice-describe {
        padding: 5px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
       }
    }
    .tts-top-right {
      flex: 0 1 20%;
      display: flex;
      flex-direction: column;
      border: 2px solid black;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      .tts-top-right-top {
        padding: 5px;
        display: flex;
        flex: 0 1 10%;
        gap: 5px;
        flex-direction: row;
        .tts-top-right-top-text {
          display: flex;
          flex: 0 1 20%;
        }
        .tts-top-right-top-count {
          display: flex;
          flex: 1 1 5%;
        }
        .tts-top-right-top-history {
          display: flex;
          flex: 0 1 30%;
          flex-direction: row;
          .tts-top-right-top-history-img{
            width: 30px;
            height: 30px;
          }
          .tts-top-right-top-history-text{
            font-size: 20px;
            cursor: pointer;
          }
        }
      }
      .tts-top-right-body {
        flex: 0 1 90%;
        padding: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        .tts-top-right-body-img-text{
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .tts-top-right-body-img{
            width: 40px;
            height: 40px;
          }
        }
      }
    }
  }

  .tts-bottom {
    display: flex;
    flex: 1 1 60%;
  }
}
.select-voice-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 40%;
  height: 300px;
  transform: translate(-50%, -50%);
  z-index: 1001; /* 确保模态在按钮之上 */
  /* 其他样式根据 SelectVoice 组件需求调整 */
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
/* 可选：添加一个覆盖层以增强点击外部的效果 */
.select-voice-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000; /* 在模态之下 */
}

.set-voice-modal{
  position: fixed;
  top: 40%;
  left: 32.5%;
  z-index: 1001; /* 确保模态在按钮之上 */
  /* 其他样式根据 SelectVoice 组件需求调整 */
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
/* 添加覆盖层样式 */
.set-voice-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999; /* 确保覆盖层在 SetVoice 模态之下 */
}

.history-page-modal{
  position: fixed;
  top: 20%;
  left: 75%;
  z-index: 1001; /* 确保模态在按钮之上 */
  /* 其他样式根据 SelectVoice 组件需求调整 */
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
/* 添加覆盖层样式 */
.history-page-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;  /* 确保覆盖层在 HistoryPage 模态之下 */
}
</style>