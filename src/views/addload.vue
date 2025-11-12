<script setup>
import {computed, ref, onMounted, onBeforeUnmount, onUnmounted} from 'vue';
import {ElImage, ElMessage} from 'element-plus';
import { useVoiceLibraryStore} from "@/stores/voiceLibraryStore.js";
import { useAuthStore} from "@/stores/auth.js";
import { useUserStore} from "@/stores/userStore.js";
import axios from "axios";
import { useVoiceStandardStore} from "@/stores/voice_standardStore.js";
import {useVoiceUserStore} from "@/stores/Voice_userStore.js";
import {useVoiceDetailsStore} from "@/stores/voiceDetailsStore.js";
const voiceDetailsStore = useVoiceDetailsStore();
const voiceUserStore = useVoiceUserStore();
const voiceStandardStore = useVoiceStandardStore();
const voiceLibraryStore = useVoiceLibraryStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const jwtToken = authStore.accessToken; // 替换为实际的 JWT Token
const fileInput = ref(null); // 添加对文件输入元素的引用
const referenceText = ref(''); // 参考文本
const selectedFile = ref(null); // 用户选择的文件
const audioUrl = ref(null);
const cloneStatus = ref(''); // 克隆状态提示
const voiceDetails = ref(null); // 存储获取到的语音详情
const currentPage = ref(1); // 当前页码
const itemsPerPage = 6; // 每页数据量
const items = 100; // 请求数据量
const itemsuser = 100; // 请求数据量
const voiceListdetail = ref([]); // 存储语音列表
const voiceListstandard = ref([]); // 存储标准语音列表
const voiceList = ref([]); // 存储用户语音列表
const totalRecords = ref(0); // 总记录数
const totalRecordsuser = ref(0); // 总记录数
const hasInitialized = ref(false); // 添加标志来跟踪是否已经初始化
const selectedLibrary = ref('standard'); // 添加选中库的状态
// 获取系统预置的标准语音库数据
const fetchVoiceLibrary = async () => {

  // 检查是否已经有数据
  if (voiceStandardStore.standardVoices.length > 0) {
    voiceListstandard.value = voiceStandardStore.standardVoices;
    totalRecords.value = voiceStandardStore.standardVoices.length;
    console.log("标准语音库数据已存在，跳过请求。");
    return;
  }

  try {
    console.log("获取系统预置的标准语音库数据");
    const response = await axios.get(
        `/api/voice_library_standard/?page=${currentPage.value}&page_size=${items}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
          },
        }
    );
    console.log("后端返回标准语音库数据:", response.data);
    if (response.status === 200) {
      const baseUrl = "http://198.44.179.147:38316/";
      response.data.items.forEach(item => {
        item.reference_audio_path = baseUrl + item.reference_audio_path;
      });
      voiceListstandard.value = response.data.items; // 更新语音库列表
      voiceStandardStore.setStandardVoices(response.data)
      console.log("voiceListstandard:", voiceListstandard.value);
      console.log('标准音频数据已存储:', voiceStandardStore.getStandardVoices);
      totalRecords.value = response.data.total; // 设置总记录数
      totalPages.value = response.data.total_pages; // 设置总页数
      console.log("标准语音库数据voiceListstandard:", voiceListstandard.value);
      console.log("标准语音库数据总记录数:", totalRecords.value);
      console.log("标准语音库数据总页数:", totalPages.value);
    } else {
      console.error("获取语音库数据失败，状态码:", response.status);
    }
  } catch (error) {
    console.error("获取语音库数据失败:", error);
  }


};
// 查询用户语音列表
const fetchUserVoiceList = async () => {

  // 检查是否已经有数据
  if (voiceUserStore.userVoiceList.length > 0) {
    voiceList.value = voiceUserStore.userVoiceList;
    totalRecordsuser.value = voiceUserStore.totalRecords;
    console.log("用户语音库数据已存在，跳过请求。");
    return;
  }

  console.log("查询用户语音列表");
  try {
    const response = await axios.get(
        `/api/voice_library_user/user/${userStore.user.user_id}?page=${currentPage.value}&page_size=${itemsuser}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
          },
        }
    );
    console.log("后端返回的用户语音列表:", response.data);
    if (response.status === 200) {
      console.log("语音列表没有赋值前:", voiceList.value);
      voiceList.value = response.data;
      console.log("语音列表赋值后:", voiceList.value);
      voiceUserStore.setUserVoiceList(response.data);

      totalRecordsuser.value = response.data.length; // 假设返回数据中有总记录数字
      voiceUserStore.setTotalRecords(response.data.length)
      console.log("语音列表总数:", totalRecordsuser.value);

      console.log("用户语言列表userVoiceList:", voiceUserStore.getUserVoiceVoices);
      console.log("用户语言列表userVoiceList 数量:", voiceUserStore.getTotalRecords);
    } else {
      console.error("查询失败，状态码:", response.status);
    }
  } catch (error) {
    console.error("查询语音列表失败:", error);
  }


};
const playuserVoice = (voice) => {
  console.log("playuserVoice尝试播放的语音:", voice);

  // 检查语音是否有音频文件
  if (!voice || !voice.file_urls.reference_audio) {
    alert("该语音没有音频文件！");
    return;
  }

  // 如果点击的是当前正在播放的语音
  if (selectedVoice.value === voice) {
    // 清空选中的语音并暂停音频
    selectedVoice.value = null;
    isPlaying.value = false;
    audio.pause();
    console.log("暂停音频:", voice.voice_name);
    return;
  }

  // 如果点击的是其他语音
  selectedVoice.value = voice; // 更新当前选中的语音
  currentTrack.value = {
    id: voice.voice_id, // 语音的唯一 ID
    name: voice.voice_name, // 音频名称
    url: voice.file_urls.reference_audio, // 音频文件的 URL
    coverUrl: 'src/assets/logo.svg', // 封面图 URL，默认值
    duration: 0, // 如果后端返回时长，可以在这里赋值
  };
  console.log("尝试播放的音频 URL:", currentTrack.value.url);

  // 播放音频
  playuserAudio();
};
const playuserAudio = () => {
  if (isPlaying.value) {
    console.warn("音频已经在播放中，无需重复调用播放方法");
    return;
  }

  if (!currentTrack.value || !currentTrack.value.url) {
    alert("没有可播放的音频文件！");
    return;
  }

  audio.src = currentTrack.value.url; // 设置音频文件的 URL
  audio.play()
      .then(() => {
        isPlaying.value = true; // 设置播放状态为 true
        console.log("开始播放音频:", currentTrack.value.name);
      })
      .catch((error) => {
        console.error("播放失败：", error);
      });
};
const toggleuserPlay = (voice) => {
  console.log("toggleuserPlay 当前语音:", voice);
  // 如果点击的是当前正在播放的语音
  if (selectedVoice.value === voice) {
    // 清空选中的语音并暂停音频
    selectedVoice.value = null;
    isPlaying.value = false; // 设置播放状态为 false
    audio.pause(); // 暂停音频
    console.log("暂停音频:", voice.voice_name);
    return;
  }
  // 如果点击的是其他语音
  selectedVoice.value = voice; // 更新当前选中的语音
  currentTrack.value = {
    id: voice.voice_id, // 语音的唯一 ID
    name: voice.voice_name, // 音频名称
    url: voice.file_urls.reference_audio, // 音频文件的 URL
    coverUrl: 'src/assets/logo.svg', // 封面图 URL，默认值
    duration: 0, // 如果后端返回时长，可以在这里赋值
  };
  console.log("尝试播放的音频 URL:", currentTrack.value.url);

  // 播放音频
  playuserAudio();
};
// 获取语音详情
const fetchVoiceDetails = async () => {

  const id = voiceDetailsStore.getVoiceDetail.voice_id; // 将输入的 ID 转换为整数
  if (!id) {
    alert("请输入有效的语音ID！");
    return;
  }

  try {
    const response = await axios.get(`/api/voice_library_user/${id}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
      },
    });

    if (response.status === 200) {
      voiceDetails.value = response.data; // 存储返回的语音详情
      voiceListdetail.value = [response.data];
      voiceDetailsStore.setVoiceDetail(response.data);
      console.log("存储的语音详情:", voiceDetailsStore.getVoiceDetail);
      console.log("语音详情:", response.data);
    } else {
      alert("获取语音详情失败！");
      console.error("响应状态码:", response.status);
    }
  } catch (error) {
    alert("获取语音详情失败，请检查网络连接！");
    console.error("请求失败:", error);
  }
};

// 定义 progress 变量
const progress = ref(0);
// 生成唯一码
const uniqueCode = crypto.randomUUID(); // 或者使用 Date.now() 生成时间戳
const handleButtonClick = async () => {
  // 弹出输入框让用户输入文件名
  const fileName = window.prompt('请输入文件名：');
  if (fileName === null) {
    // 用户点击了取消
    return;
  }
  if (fileName.trim() === '') {
    ElMessage.error('文件名不能为空！');
    return;
  }

  // 可以在这里使用输入的文件名，例如将其作为语音名称
  const uniqueCode = crypto.randomUUID();
  const voiceNameWithUniqueCode =  `${fileName}-${uniqueCode}`;

  if (!selectedFile.value) {
    cloneStatus.value = '请先选择一个音频文件！';
    return;
  }
  try {
    // 使用 Promise.all 并行上传到两个后端
    const [apiResponse, serverBResponse] = await Promise.all([
      uploadVoiceModel(voiceNameWithUniqueCode), // 上传到 API 后端
      cloneVoice(voiceNameWithUniqueCode),          // 上传到 ServerB
    ]);

    console.log('上传到语音模型 API 后端成功:', apiResponse);
    console.log('克隆语音模型到 ServerB 成功:', serverBResponse);

    // 上传成功后可以执行其他操作，比如生成音频
    // 上传成功后调用用户语音接口
    console.log("更新用户语音列表");
    try {
      const response = await axios.get(
          `/api/voice_library_user/user/${userStore.user.user_id}?page=${currentPage.value}&page_size=${itemsuser}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
            },
          }
      );
      console.log("后端返回的用户语音列表:", response.data);
      if (response.status === 200) {
        console.log("语音列表没有赋值前:", voiceList.value);
        voiceList.value = response.data;
        console.log("语音列表赋值后:", voiceList.value);
        voiceUserStore.setUserVoiceList(response.data);

        totalRecordsuser.value = response.data.length; // 假设返回数据中有总记录数字
        voiceUserStore.setTotalRecords(response.data.length)
        console.log("语音列表总数:", totalRecordsuser.value);

        console.log("用户语言列表userVoiceList:", voiceUserStore.getUserVoiceVoices);
        console.log("用户语言列表userVoiceList 数量:", voiceUserStore.getTotalRecords);
      } else {
        console.error("查询失败，状态码:", response.status);
      }
    } catch (error) {
      console.error("查询语音列表失败:", error);
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('文件上传失败，请检查网络连接或稍后重试！');
  } finally {
    progress.value = 0; // 重置进度条
  }
};
// 克隆语音功能
const cloneVoice = async (voiceNameWithUniqueCode) => {
  if (!selectedFile.value) {
    cloneStatus.value = '请先选择一个音频文件！';
    return;
  }
  if(!selectedLanguage.value){
    ElMessage.error("请选择语言！");
    return; 
  }
  if(referenceText.value===""){
    ElMessage.error("请输入语音参考文本！");
    return; 
  }
  // const voiceNameWithUniqueCode = `my_voice_${uniqueCode}`; // 拼接语音名称和唯一码
  const formData = new FormData();
  formData.append('wav_file', selectedFile.value); // 添加音频文件
  formData.append('user_id', userStore.user.user_id); // 替换为实际的用户 ID
  formData.append('voice_name', voiceNameWithUniqueCode); // 替换为实际的语音名称
  console.log('请求数据：formData:', formData);
  try {
    cloneStatus.value = '正在克隆语音...';
    const response = await axios.post('/serverB/clone_voice', formData, {
      headers: {
        'user_id': userStore.user.user_id,
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
      },
    });

    if (response.status === 200) {
      cloneStatus.value = '语音克隆成功！';
      console.log('克隆成功:', response.data);
    } else {
      cloneStatus.value = '语音克隆失败，请重试！';
      console.error('克隆失败:', response.data);
    }
  } catch (error) {
    cloneStatus.value = '语音克隆失败，请检查网络连接！';
    console.error('克隆失败:', error);
  }
};
// 文件上传 获取文件名
const handleFileChange = (event) => {2
  const file = event.target.files[0];

  if (file) {
    
    selectedFile.value = file;
    voiceLibraryStore.setReferenceAudio(file); // 将文件存储到 store
    // 获取文件名
    const fileName = file.name;

    // 将文件名设置到store或其他地方
    voiceLibraryStore.fileName = fileName;

    // 创建一个可以用于 <audio> 标签的 URL
    currentTrack.value.url = URL.createObjectURL(file);
    ElMessage.success("选择音频成功！");
    console.log('文件名:', fileName);
    console.log('文件 URL:', currentTrack.value.url);
    // 设置默认的封面图片 URL
    currentTrack.value.coverUrl = 'src/assets/logo.svg'; // 替换为你的默认封面图片路径

    // 如果需要，你可以在这里调用上传函数
    // uploadVoiceModel();
  }
};

// 生成随机文件名
const generateRandomFileName = (originalFileName) => {
  const randomUUID = crypto.randomUUID().replace(/-/g, ""); // 生成 UUID
  return `voice_${randomUUID}.wav`; // 拼接随机文件名
};

const uploadedVoiceId = ref(null); // 用于存储上传成功后的 voice_id
const detailedVoiceId = ref(null);
// 上传语音模型
const uploadVoiceModel = async (voiceNameWithUniqueCode) => {
  const user_id = userStore.user.user_id; // 替换为实际用户 ID
  // const voice_name = "my_voice_"; // 替换为实际语音名称
  const voice_type = "人物"; // 固定值：人物或场景
  const voice_category = selectedLanguage.value; // 替换为实际类别
  const description = "这是一个客服语音模型"; // 替换为实际描述
  const reference_text = referenceText.value; // 获取参考文本
  const reference_audio = selectedFile.value; // 获取用户选择的音频文件
  // const voiceNameWithUniqueCode = `my_voice_${uniqueCode}`; // 拼接语音名称和唯一码
  if (!reference_audio) {
    alert("请先选择一个音频文件！");
    return;
  }
  // 生成随机文件名
  const file_name = generateRandomFileName(reference_audio.name);
  const formData = new FormData();
  formData.append("user_id", user_id);
  formData.append("file_name", file_name); // 添加随机文件名
  formData.append("voice_name", voiceNameWithUniqueCode);
  formData.append("voice_type", voice_type);
  formData.append("voice_category", voice_category);
  formData.append("description", description);
  formData.append("reference_text", reference_text);
  formData.append("reference_audio", reference_audio);
  console.log("请求的上传数据：", formData);
  console.log("请求的上传数据的文件名：", file_name)
  try {
    const response = await axios.post("/api/voice_library_user/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
      },
    });

    if (response.status === 201) {
      ElMessage.success("语音模型上传成功！");
      voiceDetailsStore.setVoiceDetail(response.data);
      console.log("上传成功:", response.data);
      // 将返回的 voice_id 存储到 uploadedVoiceId
      uploadedVoiceId.value = response.data.voice_id; // 假设返回的数据中有 voice_id 字段
    } else {
      ElMessage.error("语音模型上传失败！");
      console.error("上传失败:", response.data);
    }
  } catch (error) {
    ElMessage.error("语音模型上传失败，请检查网络连接！");
    console.error("上传失败:", error);
  }
};

const selectedVoice = ref(null); // 当前选中的语音
const playVoice = (voice) => {
  console.log("playVoice尝试播放的语音:", voice);

  // 检查语音是否有音频文件
  if (!voice || !voice.reference_audio_path) {
    alert("该语音没有音频文件！");
    return;
  }

  // 如果点击的是当前正在播放的语音
  if (selectedVoice.value === voice) {
    // 清空选中的语音并暂停音频
    selectedVoice.value = null;
    isPlaying.value = false;
    audio.pause();
    console.log("暂停音频:", voice.voice_name);
    return;
  }

  // 如果点击的是其他语音
  selectedVoice.value = voice; // 更新当前选中的语音
  currentTrack.value = {
    id: voice.voice_id, // 语音的唯一 ID
    name: voice.voice_name, // 音频名称
    url: voice.reference_audio_path, // 音频文件的 URL
    coverUrl: 'src/assets/logo.svg', // 封面图 URL，默认值
    duration: 0, // 如果后端返回时长，可以在这里赋值
  };
  console.log("尝试播放的音频 URL:", currentTrack.value.url);

  // 播放音频
  playAudio();
};
const togglePlay = (voice) => {
  console.log("togglePlay 当前语音:", voice);
  // 如果点击的是当前正在播放的语音
  if (selectedVoice.value === voice) {
    // 清空选中的语音并暂停音频
    selectedVoice.value = null;
    isPlaying.value = false; // 设置播放状态为 false
    audio.pause(); // 暂停音频
    console.log("暂停音频:", voice.voice_name);
    return;
  }
  // 如果点击的是其他语音
  selectedVoice.value = voice; // 更新当前选中的语音
  currentTrack.value = {
    id: voice.voice_id, // 语音的唯一 ID
    name: voice.voice_name, // 音频名称
    url: voice.reference_audio_path, // 音频文件的 URL
    coverUrl: 'src/assets/logo.svg', // 封面图 URL，默认值
    duration: 0, // 如果后端返回时长，可以在这里赋值
  };
  console.log("尝试播放的音频 URL:", currentTrack.value.url);
  // 播放音频
  playAudio();
};
// 计算总页数
const totalPages = computed(() => Math.ceil(totalRecords.value / itemsPerPage));
const pages = computed(() => Math.ceil(totalRecordsuser.value / itemsPerPage));
// 计算当前页显示的标准语音列表
const paginatedStandardVoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return voiceListstandard.value.slice(start, end);
});

// 计算当前页显示的用户语音列表
const paginatedUserVoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return voiceList.value.slice(start, end);
});
// 切换页码
const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
// 切换页码
const changePageuser = (page) => {
  if (page > 0 && page <= pages.value) {
    currentPage.value = page;
  }
};
const audio = new Audio(null);// 初始化音频实例，加载当前歌曲的音频文件

// 示例响应式数据
const currentTrack = ref({
  id: null, // 当前音频的唯一 ID
  name: '', // 音频名称
  url: '', // 音频文件的 URL
  coverUrl: '', // 封面图的 URL（可选）
  duration: 0, // 音频总时长（秒）
});
const currentTime = ref(0);
const duration = ref(180); // 假设总时长为180秒
// 定义语言选项
const languages = ref([
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'fr', label: '法语' },
  { value: 'es', label: '西班牙语' },
]);
const selectedLanguage = ref();
// 播放状态
const isPlaying = ref(false);
// 监听音频加载完成事件
audio.addEventListener('loadedmetadata', () => {
  duration.value = Math.floor(audio.duration); // 设置总时长为音频的实际时长
  console.log('Duration set to:', duration.value); // 添加日志
});
// 更新进度条
audio.addEventListener('timeupdate', () => {
  currentTime.value = Math.floor(audio.currentTime); // 四舍五入以避免小数问题 实时更新当前播放时间
});

// 播放音频
const playAudio = () => {
  if (isPlaying.value) {
    console.warn("音频已经在播放中，无需重复调用播放方法");
    return;
  }

  if (!currentTrack.value || !currentTrack.value.url) {
    alert("没有可播放的音频文件！");
    return;
  }

  audio.src = currentTrack.value.url; // 设置音频文件的 URL
  audio.play()
      .then(() => {
        isPlaying.value = true; // 设置播放状态为 true
        console.log("开始播放音频:", currentTrack.value.name);
      })
      .catch((error) => {
        console.error("播放失败：", error);
      });
};
// 监听音频播放时间更新
audio.addEventListener("timeupdate", () => {
  currentTime.value = Math.floor(audio.currentTime); // 更新当前播放时间
});

// 监听音频播放结束
audio.addEventListener("ended", () => {
  isPlaying.value = false; // 音频播放结束后，将播放状态设置为 false
});
// 时间格式化函数
const formatTime = (time) => {
  const minutes = Math.floor(time / 60); // 计算分钟数
  const seconds = Math.floor(time % 60); // 计算秒数
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; // 格式化为 mm:ss
};

// 在 script setup 的最后添加 onMounted 钩子
onMounted(() => {
  console.log("组件已挂载，开始加载数据...");
  fetchVoiceLibrary();
  fetchUserVoiceList();
});
</script>

<template>
  <div class="voice-training">
    <!-- 标题部分 -->
    <div class="ai-teaching-platform">
      <header class="header">
        <h1>AI 声音克隆</h1>
        <p class="subtitle">开启声音新次元</p>
      </header>
      <main class="main-content">
        <section class="introduction">
          <p>
            欢迎来到声音克隆的奇妙世界！在这里，您只需轻松上传或录制音频文件，借助先进的AI模型，即可实现声音的完美克隆。
          </p>
          <p class="feature-highlight">
            我们精心雕琢了这个专门用于声音素材训练的界面，每一个功能元素都经过深思熟虑，只为给您带来便捷、高效的声音素材管理与训练体验。
          </p>
        </section>
      </main>
    </div>

    <!-- 上传和文本输入部分 -->
    <div class="voice-training-main">
      <div class="voice-training-left">
        <div class="upload-section">
          <h2 class="upload-title">上传指南</h2>
          <div class="upload-content">
            <div class="upload-tip">
              <i class="el-icon-check check-icon"></i>
              <p>支持 MP3、WAV、M4A、AAC、OGG 格式</p>
            </div>
            <div class="upload-tip">
              <i class="el-icon-check check-icon"></i>
              <p>建议时长：3-10秒</p>
            </div>
            <div class="upload-tip">
              <i class="el-icon-check check-icon"></i>
              <p>最大文件大小：20MB</p>
            </div>
            <div class="upload-tip">
              <i class="el-icon-check check-icon"></i>
              <p>清晰的声音，最少背景噪音</p>
            </div>
            <input
                type="file"
                @change="handleFileChange"
                accept=".wav, .mp3, .m4a, .aac, .ogg"
                ref="fileInput"
                class="file-input"
            />
            <button class="upload-btn" @click="fileInput.click()">
              <i class="el-icon-upload"></i>
              <span>选择音频文件</span>
            </button>
          </div>
        </div>
      </div>

      <div class="voice-training-right">
        <div class="text-input-section">
          <div class="section-header">
            <h2>参考文本</h2>
          </div>
          <div class="text-input-content">
            <textarea 
              v-model="referenceText" 
              placeholder="请输入音频念的文本..." 
              rows="6"
            ></textarea>
          </div>
          <!-- 语言选择 -->
          <div class="language-select">
            <label>语言</label>
            <el-select
              v-model="selectedLanguage"
              placeholder="选择语言"
              class="mt-20"
              clearable
            >
              <el-option
                v-for="lang in languages"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
              />
            </el-select>
          </div>
          <div class="action-buttons">
            <button class="action-btn upload-btn" @click="handleButtonClick">
              <i class="el-icon-upload"></i>
              <span>上传语音</span>
            </button>
            <p v-if="cloneStatus" class="status-message">{{ cloneStatus }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 语音库展示部分 -->
    <div class="voice-library-section">
      <div class="section-header">
        <h2>语音库</h2>
        <div class="action-buttons">
<!--          <button class="action-btn" @click="fetchVoiceDetails">-->
<!--            <i class="el-icon-refresh"></i>-->
<!--            <span>获取最新语音</span>-->
<!--          </button>-->
          <button 
            class="action-btn" 
            :class="{ 'active': selectedLibrary === 'standard' }"
            @click="() => {
              selectedLibrary = 'standard';
              fetchVoiceLibrary();
            }"
          >
            <i class="el-icon-collection"></i>
            <span>标准语音库</span>
          </button>
          <button 
            class="action-btn" 
            :class="{ 'active': selectedLibrary === 'user' }"
            @click="() => {
              selectedLibrary = 'user';
              fetchUserVoiceList();
            }"
          >
            <i class="el-icon-list"></i>
            <span>我的语音列表</span>
          </button>
        </div>
      </div>

      <div class="voice-card-grid" v-if="selectedLibrary === 'standard'">
        <div
          class="voice-card"
          v-for="voice in paginatedStandardVoices"
          :key="voice.voice_id"
          @click="togglePlay(voice)"
        >
          <div class="voice-card-content">
            <div class="voice-icon">
              <img :src="'src/assets/logo.svg'" alt="Voice Icon" />
            </div>
            <div class="voice-info">
              <h3>{{ voice.voice_name }}</h3>
              <div class="voice-controls">
                <button 
                  class="play-btn"
                  @click.stop="togglePlay(voice)"
                >
                  <el-image
                    :src="selectedVoice === voice ? 'src/assets/tts暂停.png' : 'src/assets/tts播放.png'"
                    fit="contain"
                    class="play-icon"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="voice-card-grid" v-if="selectedLibrary === 'user'">
        <div
          class="voice-card"
          v-for="voice in paginatedUserVoices"
          :key="voice.voice_id"
          @click="toggleuserPlay(voice)"
        >
          <div class="voice-card-content">
            <div class="voice-icon">
              <img :src="'src/assets/logo.svg'" alt="Voice Icon" />
            </div>
            <div class="voice-info">
              <h3>{{ voice.voice_name }}</h3>
              <div class="voice-controls">
                <button
                  class="play-btn"
                  @click.stop="toggleuserPlay(voice)"
                >
                  <el-image
                    :src="selectedVoice === voice ? 'src/assets/tts暂停.png' : 'src/assets/tts播放.png'"
                    fit="contain"
                    class="play-icon"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="selectedLibrary === 'standard' && totalPages > 1">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="changePage(page)"
          :class="{ active: currentPage === page }"
          class="page-btn"
        >
          {{ page }}
        </button>
      </div>
      <div class="pagination" v-if="selectedLibrary === 'user' && pages > 1">
        <button
            v-for="page in pages"
            :key="page"
            @click="changePageuser(page)"
            :class="{ active: currentPage === page }"
            class="page-btn"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voice-training {
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

.feature-highlight {
  margin-top: 1rem;
  font-style: italic;
  color: #4a5568;
}

.voice-training-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.voice-training-left, .voice-training-right {
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

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中 */
  margin: 2rem 0; /* 上下留一些间距 */
}

.upload-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; /* 每个指南项之间的间距 */
  max-width: 400px; /* 限制最大宽度 */
  width: 100%; /* 响应式宽度 */
}

.upload-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 1rem;
}

.check-icon {
  color: #48bb78; /* 图标颜色 */
  font-size: 1.2rem; /* 图标大小 */
}

.upload-tip p {
  margin: 0; /* 去掉默认的段落间距 */
}

.file-input {
  display: none; /* 隐藏原生文件输入框 */
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: #48bb78; /* 按钮背景色 */
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: #31976e; /* 鼠标悬停效果 */
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .upload-title {
    font-size: 1.5rem; /* 小屏幕减小标题字体 */
  }

  .upload-tip {
    font-size: 0.9rem; /* 小屏幕减小指南文字字体 */
  }

  .upload-btn {
    width: 100%; /* 小屏幕按钮占满宽度 */
    padding: 1rem;
  }
}

.text-input-content {
  margin-bottom: 1.5rem;
}

.text-input-content textarea {
  width: 90%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  resize: vertical;
  font-size: 1rem;
  line-height: 1.5;
  color: #4a5568;
  background: #f7fafc;
  transition: all 0.3s;
}

.text-input-content textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  background: #f7fafc;
  color: #4a5568;
}

.action-btn:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.action-btn.active {
  background: #4299e1;
  color: white;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.action-btn.active:hover {
  background: #3182ce;
}

.status-message {
  text-align: center;
  color: #48bb78;
  margin: 0;
  font-size: 0.9rem;
}

.voice-library-section {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.voice-card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  margin: 1.5rem 0;
  padding: 0.5rem;
}

.voice-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.8rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  min-height: 100px;
}

.voice-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.12);
  background: #fafafa;
}

.voice-card-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1.8rem;
  width: 100%;
  padding: 0.5rem;
}

.voice-icon {
  width: 64px;
  height: 64px;
  border-radius: 2px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.voice-icon img {
  width: 75%;
  height: 75%;
  object-fit: contain;
  opacity: 0.8;
}

.voice-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
}

.voice-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2d3748;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  text-align: center;
}

.voice-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.play-btn {
  background: #f1f5f9;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.play-btn:hover {
  transform: scale(1.05);
  background: #e2e8f0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.play-icon {
  width: 32px;
  height: 32px;
  opacity: 0.7;
}

.play-icon:hover {
  opacity: 0.9;
}

.pagination {
  display: flex;
  justify-content: center;
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

@media (max-width: 1024px) {
  .voice-training-main {
    grid-template-columns: 1fr;
  }
  .voice-card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .voice-training {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .voice-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>