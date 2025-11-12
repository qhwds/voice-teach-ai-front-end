<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import {useUserStore} from "@/stores/userStore.js";
import { ElMessage } from 'element-plus';
import SelectVoice from "@/components/select-voice.vue";
const userStore = useUserStore();
import {use_standardVoiceStore} from "@/stores/select_standardvoice_Store.js";
const standardVoiceStore = use_standardVoiceStore();
import {use_userVoiceStore} from "@/stores/select_uservoice_Store.js";
const userVoiceStore = use_userVoiceStore();
// 状态变量
const pptFile = ref(null); // 上传的 PPT 文件
const referenceAudioPath = ref(''); // 参考音频路径
const progress = ref(0); // 生成进度
const outputAudioUrl = ref(null); // 生成的音频 URL
const audioUrl = ref(null); // 语音合成结果音频 URL
const records = ref([]); // 记录列表
const slides = ref([]); // 存储幻灯片内容
const currentSlide = ref(1); // 当前显示的幻灯片
const totalSlides = ref(0); // 总幻灯片数
const settings = ref({
  language: '中文',
  format: 'MP3',
  speed: 1.0,
});
const currentPage = ref(1); // 当前页码
const itemsPerPage = 6; // 每页记录数
const totalRecords = ref(0); // 总记录数
const isDragging = ref(false); // 添加拖拽状态变量
const isEditing = ref(false); // 是否处于编辑状态
const editedContent = ref(''); // 编辑中的内容
//上传ppt
const uploadPpts = async () => {
  if (!pptFile.value) {
    ElMessage.error('请先选择一个 PPT 文件！');
    return;
  }

  try {
    // 使用 Promise.all 并行上传到两个后端
    const [apiResponse, serverBResponse] = await Promise.all([
      uploadPPTserverapi(), // 上传到 API 后端
      uploadPpt(),          // 上传到 ServerB
    ]);

    console.log('上传到 API 后端成功:', apiResponse);
    console.log('上传到 ServerB 成功:', serverBResponse);

    ElMessage.success('文件上传成功！');
    // 上传成功后可以执行其他操作，比如生成音频
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('文件上传失败，请检查网络连接或稍后重试！');
  } finally {
    progress.value = 0; // 重置进度条
  }
};
// 上传 PPT 文件 api
const uploadPPTserverapi = async () => {
  if (!pptFile.value) {
    alert('请先选择一个 PPT 文件！');
    return;
  }
  const formData = new FormData();
  formData.append('file', pptFile.value);
  console.log('上传的 PPT 文件:', formData);
  try {
    const response = await axios.post('/api/ppt/upload_ppt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('上传成功:', response.data);
    // 处理后端返回的数据
    if (response.data.slides) {
      slides.value = response.data.slides;
      totalSlides.value = response.data.total_slides;
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      // 服务器返回了错误响应
      console.error('错误响应状态:', error.response.status);
      console.error('错误响应数据:', JSON.stringify(error.response.data));

      // 提取详细的错误信息
      const detail = error.response.data.detail;
      let errorMessage = '上传失败:';
      if (Array.isArray(detail)) {
        errorMessage += detail.join(', ');
      } else if (typeof detail === 'object') {
        errorMessage += JSON.stringify(detail);
      } else {
        errorMessage += detail;
      }
      throw new Error(errorMessage);
    } else if (error.request) {
      // 请求已发送但未收到响应
      console.error('请求已发送，但未收到响应:', error.request);
      throw new Error('上传失败，请检查网络连接！');
    } else {
      // 其他错误
      console.error('请求出错:', error.message);
      throw new Error('上传失败，请稍后重试！');
    }
  }
};


// 设置 PPT 文件
const setPptFile = (event) => {
  const file = event.target.files[0];
  if (!file) {
    pptFile.value = null;
    ElMessage.error('请选择一个文件！');
    return;
  }
  if ( file.size > 20 * 1024 * 1024) {
    pptFile.value = null;
    ElMessage.error('文件大小必须在 0MB 到 20MB 之间！');
    return;
  }
  if (!['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)) {
    pptFile.value = null;
    ElMessage.error('仅支持 .ppt 和 .pptx 格式的文件！');
    return;
  }
  ElMessage.success('文件已选择，可以点击上传按钮开始上传');
  pptFile.value = file;
  console.log('上传的 PPT 文件:', pptFile.value);
};
const testbt = (event) => {
  async function sendTTSRequest() {
    const requestData = {
      refer_wav_path: "offical-voice-ref-wav/KangHui.wav",  // 可选
      prompt_text: "这是一段提示文本",          // 可选
      prompt_language: "zh",                   // 可选
      text_list: ["这是要合成的第一段文本", "这是第二段文本"],
      text_language: "zh",
      cut_punc: "。",                          // 可选
      top_k: 15,                               // 可选，默认15
      top_p: 1.0,                              // 可选，默认1.0
      temperature: 1.0,                        // 可选，默认1.0
      speed: 1.0,                              // 可选，默认1.0
      inp_refs: [],                            // 可选
      sample_steps: 32,                        // 可选，默认32
      if_sr: false                             // 可选，默认false
    };

    try {
      const response = await fetch(`/serverB/ppt`, {
        method: 'POST',
        headers: {
          'user_id': '6',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('Response:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // 调用 sendTTSRequest 函数
  sendTTSRequest();
}

// 上传 PPT 文件 serverB
const uploadPpt = async () => {
  if (!pptFile.value) {
    alert('请先选择一个 PPT 文件！');
    return;
  }
  const formData = new FormData();
  formData.append('file', pptFile.value); // 将文件添加到 FormData
  console.log('上传的 PPT 文件:', pptFile.value);
  try {
    const response = await axios.post('/serverB/upload_ppt', formData, {
      headers: {
        'user_id': userStore.user.user_id,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        // 计算上传进度
        progress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      },
    });

    console.log('上传成功:', response.data);
    // 上传成功后可以执行其他操作，比如生成音频
  } catch (error) {
    console.error('上传失败:', error.response?.data || error.message);
    alert('文件上传失败，请检查文件类型或网络连接！');
  } finally {
    progress.value = 0; // 重置进度条
  }
};
const downloadPptWithAudio = async () => {
  try {
    // 首先上传编辑后的文本列表
    const textList = slides.value.map(slide => slide.content || '').filter(text => text.trim() !== '');
    console.log('textList:', textList);
    // 确保 textList 是一个数组
    if (!Array.isArray(textList) || textList.length === 0) {
      ElMessage.error('没有有效的文本内容！');
      return;
    }
    try {
      console.log('Request payload:', { texts: textList });
      const testResponse = await axios.post('/api/ppt/test', {
        texts: textList  // 直接发送数组，不需要 JSON.stringify
      });
      console.log('文本列表上传成功:', testResponse.data);
    } catch (error) {
      console.error('文本列表上传失败:', error);
      ElMessage.error('文本列表上传失败，请重试！');
      return;
    }

    // 定义 params 变量并初始化为空对象
    let params = {};
    if(userVoiceStore.getVoice===null) {
      const baseUrl = "http://198.44.179.147:38316/";
      params = {
        refer_wav_path: standardVoiceStore.getVoice.reference_audio_path.replace(baseUrl, ''),
        prompt_text: standardVoiceStore.getVoice.reference_text,
        prompt_language: 'zh',
        text_list: textList, // 使用编辑后的文本列表
    //     text_list: [
    //     "欢迎使用本语音系统",
    //     "欢迎使用本语音系统",
    //     "欢迎使用本语音系统",
    //     "欢迎使用本语音系统",
    //     "欢迎使用本语音系统"
    // ],
        text_language: 'zh', // 文本语言
        cut_punc: '', // 切割标点
        top_k: 15, // Top-k
        top_p: 1.0, // Top-p
        temperature: 1.0, // 温度参数
        speed: 1, // 语速
        inp_refs: [], // 输入参考
        sample_steps: 32, // 采样步数
        if_sr: false, // 是否使用 SR
      };
    }else {
      const baseUrl = "http://198.44.179.147:38316/";
      params = {
        refer_wav_path: userVoiceStore.getVoice.file_urls.reference_audio.replace(baseUrl, ''),
        prompt_text: userVoiceStore.getVoice.reference_text,
        prompt_language: 'zh',
        text_list: textList, // 使用编辑后的文本列表
        // text_list: [
        // "欢迎使用本语音系统",
        // "欢迎使用本语音系统",
        // "欢迎使用本语音系统",
        // "欢迎使用本语音系统",
        // "欢迎使用本语音系统"
        // ],
        text_language: 'zh', // 文本语言
        cut_punc: '', // 切割标点
        top_k: 15, // Top-k
        top_p: 1.0, // Top-p
        temperature: 1.0, // 温度参数
        speed: 1, // 语速
        inp_refs: [], // 输入参考
        sample_steps: 32, // 采样步数
        if_sr: false, // 是否使用 SR
      };
    }
    console.log('请求参数:', params);
    // // 构建请求参数
    // params = {
    //   refer_wav_path: 'offical-voice-ref-wav/zhongli.wav', // 参考音频路径
    //   prompt_text: '一份新的契约，好吧，虽然我还在度假', // 提示文本
    //   prompt_language: 'zh', // 提示语言
    //   text_list: ['hello', 'world'],// 文本列表
    //   text_language: 'en', // 文本语言
    //   cut_punc: '', // 切割标点
    //   top_k: 15, // Top-k
    //   top_p: 1.0, // Top-p
    //   temperature: 1.0, // 温度参数
    //   speed: 1, // 语速
    //   inp_refs: [], // 输入参考
    //   sample_steps: 32, // 采样步数
    //   if_sr: false, // 是否使用 SR
    // };
    // 请求头中添加用户 ID
    const headers = {
      'user_id': userStore.user.user_id,
      'Content-Type': 'application/json',
    };
    console.log('请求头:', headers);
    // 发送 POST 请求
    const response = await fetch('/serverB/ppt', {
      method: 'POST',
      headers: headers,
      responseType: 'blob', // 确保接收二进制流
      body: JSON.stringify(params),
    });

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text(); // 读取错误信息
      console.error('接口调用失败:', response.status, errorText);
      ElMessage.error('PPT 下载失败，请稍后重试！');
      return;
    }

    // 处理响应数据
    const blob = await response.blob();
    console.log('文件大小:', blob.size); // 检查文件大小

    if (blob.size === 0) {
      ElMessage.error('下载的文件为空！');
      return;
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'output.pptx'); // 设定下载名称
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // 释放 URL 对象

    ElMessage.success('PPT 下载成功！');
  } catch (error) {
    console.error('请求错误:', error);

    if (error.response) {
      // 服务器返回的错误
      ElMessage.error(`服务器错误：${error.response.status} - ${error.response.data.message}`);
    } else if (error.request) {
      // 请求未收到响应
      ElMessage.error('网络错误，请检查您的网络连接！');
    } else {
      // 其他错误
      ElMessage.error('请求出错，请稍后重试！');
    }
  }
};
// 设置参考音频路径
const setReferenceAudio = () => {
  referenceAudioPath.value = 'path/to/reference/audio.wav'; // 模拟动态获取路径
};

// 保存设置
const saveSettings = () => {
  console.log('保存设置:', settings.value);
};

// 上一页
const prevPage = () => {
  if (currentSlide.value > 1) {
    currentSlide.value--;
  }
};

// 下一页
const nextPage = () => {
  if (currentSlide.value < totalSlides.value) {
    currentSlide.value++;
  }
};

// 限制显示的页码范围
const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5; // 最多显示 5 个页码
  const halfVisible = Math.floor(maxVisiblePages / 2);
  let start = Math.max(1, currentSlide.value - halfVisible);
  let end = start + maxVisiblePages - 1;

  if (end > totalSlides.value) {
    end = totalSlides.value;
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
// 分页逻辑
const totalPages = computed(() => Math.ceil(totalRecords.value / itemsPerPage));

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
const isSelectVoiceVisible = ref(false);
// 隐藏 SelectVoice 组件
const hideSelectVoice = () => {
  isSelectVoiceVisible.value = false;
};
// 显示 SelectVoice 组件
const showSelectVoice = () => {
  isSelectVoiceVisible.value = true;
};

// 添加全局拖拽事件监听
onMounted(() => {
  // 阻止浏览器默认的拖放行为
  document.addEventListener('dragenter', (event) => {
    event.preventDefault();
    event.stopPropagation();
    isDragging.value = true;
  }, false);

  document.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
    isDragging.value = true;
  }, false);

  document.addEventListener('dragleave', (event) => {
    event.preventDefault();
    event.stopPropagation();
    // 检查鼠标是否真的离开了文档
    if (event.clientX <= 0 || event.clientY <= 0) {
      isDragging.value = false;
    }
  }, false);

  document.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    isDragging.value = false;
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)) {
        ElMessage.error('仅支持 .ppt 和 .pptx 格式的文件！');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        ElMessage.error('文件大小必须在 0MB 到 20MB 之间！');
        return;
      }
      pptFile.value = file;
      ElMessage.success('文件已选择，可以点击上传按钮开始上传');
    }
  }, false);
});

onUnmounted(() => {
  // 移除事件监听器时使用匿名函数引用
  document.removeEventListener('dragenter', () => {});
  document.removeEventListener('dragover', () => {});
  document.removeEventListener('dragleave', () => {});
  document.removeEventListener('drop', () => {});
});

// 添加文件输入触发函数
const fileInput = ref(null);
const triggerFileInput = () => {
  fileInput.value.click();
};

// 添加幻灯片切换函数
const changeSlide = (slideNumber) => {
  if (slideNumber > 0 && slideNumber <= totalSlides.value) {
    currentSlide.value = slideNumber;
  }
};

// 添加编辑相关的方法
const startEditing = () => {
  editedContent.value = slides.value[currentSlide.value - 1].content;
  isEditing.value = true;
};

const saveEdit = () => {
  if (editedContent.value !== undefined) {
    // 将当前幻灯片内容更新到本地状态
    slides.value[currentSlide.value - 1].content = editedContent.value;
    ElMessage.success('保存成功！');
    isEditing.value = false;
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  editedContent.value = '';
};
</script>

<template>
  <div class="ppt-container">
    <div class="ai-teaching-platform">
      <header class="header">
        <h1>PPT 智能配音</h1>
        <p class="subtitle">让您的演示文稿更加生动</p>
      </header>
      <main class="main-content">
        <section class="introduction">
          <p>
            通过先进的 AI 技术，为您的 PPT 添加专业的语音配音。支持多种语言和声音风格，让您的演示更加生动有趣，提升演讲效果。
          </p>
        </section>
      </main>
    </div>

    <div class="ppt-main">
      <div class="ppt-left-panel">
        <div class="upload-section">
          <div class="section-header">
            <h2>上传 PPT</h2>
            <div class="file-info" v-if="pptFile">
              <i class="el-icon-document"></i>
              <span>{{ pptFile.name }}</span>
            </div>
          </div>
          
          <div class="upload-area" @click="triggerFileInput">
            <input 
              type="file" 
              ref="fileInput"
              @change="setPptFile" 
              accept=".ppt,.pptx" 
              class="file-input"
            />
            <div class="upload-content">
              <i class="el-icon-upload"></i>
              <p>点击或拖拽文件到此处</p>
              <div class="upload-tips">
                <p>支持 .ppt 和 .pptx 格式</p>
                <p>文件大小：0MB - 20MB</p>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="action-btn upload-btn" @click="uploadPpts" :disabled="!pptFile">
              <i class="el-icon-upload"></i>
              <span>上传 PPT</span>
            </button>
            <button class="action-btn generate-btn" @click="downloadPptWithAudio" :disabled="!pptFile">
              <i class="el-icon-video-play"></i>
              <span>制作有声PPT</span>
            </button>
          </div>

          <div class="voice-selection">
            <button class="voice-btn" @click="showSelectVoice">
              <i class="el-icon-microphone"></i>
              <span>选择配音声音</span>
            </button>
          </div>

          <div class="progress-section" v-if="progress > 0">
            <div class="progress-header">
              <span>上传进度</span>
              <span>{{ progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="ppt-right-panel">
        <div class="result-section">
          <div class="section-header">
            <h2>幻灯片内容</h2>
            <div class="slide-count">第 {{ currentSlide }} 页 / 共 {{ totalSlides }} 页</div>
          </div>

          <div class="result-content">
            <div v-if="!slides.length" class="empty-state">
              <i class="el-icon-document"></i>
              <p>暂无幻灯片内容</p>
            </div>
            <div v-else class="slide-content">
              <div class="slide-header">
                <div class="slide-number">第 {{ currentSlide }} 页</div>
                <div class="edit-controls">
                  <button v-if="!isEditing" class="edit-btn" @click="startEditing">
                    <i class="el-icon-edit"></i>
                    <span>编辑内容</span>
                  </button>
                  <div v-else class="edit-actions">
                    <button class="save-btn" @click="saveEdit">
                      <i class="el-icon-check"></i>
                      <span>保存</span>
                    </button>
                    <button class="cancel-btn" @click="cancelEdit">
                      <i class="el-icon-close"></i>
                      <span>取消</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="slide-text-container">
                <textarea
                  v-if="isEditing"
                  v-model="editedContent"
                  class="slide-text-edit"
                  placeholder="请输入幻灯片内容..."
                ></textarea>
                <div v-else class="slide-text">{{ slides[currentSlide - 1].content || '此页无内容' }}</div>
              </div>
            </div>
          </div>

          <div class="pagination" v-if="totalSlides > 1">
            <button 
              class="page-btn prev-btn" 
              @click="prevPage" 
              :disabled="currentSlide === 1"
            >
              <i class="el-icon-arrow-left"></i>
              <
            </button>

            <!-- 显示省略号，如果前面有隐藏的页码 -->
            <span v-if="visiblePages[0] > 1">...</span>

            <button
              v-for="page in visiblePages"
              :key="page"
              @click="changeSlide(page)"
              :class="{ active: currentSlide === page }"
              class="page-btn"
            >
              {{ page }}
            </button>

            <!-- 显示省略号，如果后面有隐藏的页码 -->
            <span v-if="visiblePages[visiblePages.length - 1] < totalSlides">...</span>

            <button 
              class="page-btn next-btn" 
              @click="nextPage" 
              :disabled="currentSlide === totalSlides"
            >
              <i class="el-icon-arrow-right"></i>
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框组件 -->
    <SelectVoice
      v-if="isSelectVoiceVisible"
      class="modal"
      @closeSelectVoice="hideSelectVoice"
    />

    <!-- 模态框遮罩层 -->
    <div 
      v-if="isSelectVoiceVisible"
      class="modal-overlay"
      @click="hideSelectVoice"
    ></div>

    <!-- 拖拽覆盖层 -->
    <div v-if="isDragging" class="global-drag-overlay">
      <div class="global-drag-content">
        <div class="upload-icon">
          <i class="el-icon-upload"></i>
        </div>
        <div class="upload-text">
          <h3>拖拽文件到此处</h3>
          <div class="upload-tips">
            <p>支持 .ppt 和 .pptx 格式</p>
            <p>文件大小：0MB - 20MB</p>
            <p class="release-tip">释放鼠标开始上传</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ppt-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 2rem;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.ai-teaching-platform {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.introduction {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  color: #666;
  line-height: 1.6;
}

.ppt-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.ppt-left-panel, .ppt-right-panel {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.9rem;
}

.upload-area {
  position: relative;
  border: 2px dashed #e2e8f0;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
}

.upload-area:hover {
  border-color: #4299e1;
  background: #f7fafc;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  pointer-events: none;
}

.upload-content {
  color: #4a5568;
}

.upload-content i {
  font-size: 3rem;
  color: #4299e1;
  margin-bottom: 1rem;
}

.upload-content p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.upload-tips {
  color: #718096;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.upload-btn {
  background: #4299e1;
  color: white;
}

.upload-btn:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-2px);
}

.generate-btn {
  background: #48bb78;
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-2px);
}

.voice-selection {
  margin-bottom: 1.5rem;
}

.voice-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
}

.voice-btn:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.progress-section {
  margin-top: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-size: 0.9rem;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4299e1;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.result-content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.slide-content {
  padding: 2rem;
  background: #f7fafc;
  border-radius: 10px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.edit-controls {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .save-btn, .cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.edit-btn {
  background: #f7fafc;
  color: #4a5568;
}

.edit-btn:hover {
  background: #edf2f7;
}

.save-btn {
  background: #48bb78;
  color: white;
}

.save-btn:hover {
  background: #38a169;
}

.cancel-btn {
  background: #f56565;
  color: white;
}

.cancel-btn:hover {
  background: #e53e3e;
}

.slide-text-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.slide-text-edit {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border: 2px solid #4299e1;
  border-radius: 8px;
  font-size: 1.1rem;
  line-height: 1.6;
  resize: vertical;
  background: white;
  color: #2d3748;
}

.slide-text-edit:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.slide-number {
  font-size: 1.2rem;
  color: #4a5568;
  font-weight: 500;
}

.slide-text {
  font-size: 1.1rem;
  color: #2d3748;
  line-height: 1.6;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-count {
  background: #e2e8f0;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  color: #4a5568;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover {
  background: #edf2f7;
}

.page-btn.active {
  background: #4299e1;
  color: white;
}

.prev-btn, .next-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1000;
}

.global-drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.global-drag-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .ppt-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ppt-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>