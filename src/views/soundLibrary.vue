<template>
  <div class="voice-library">
    <el-card
        v-for="voice in voices"
        :key="voice.id"
        class="voice-card"
        style="width: calc(50% - 40px); /* 每行两个卡片，考虑间距 */"
    >
      <template #header>
        <div class="card-header">
          <!-- 添加圆形头像 -->
          <img :src="voice.avatar" alt="Avatar" class="avatar" />
          <div class="card-title"><h3>{{ voice.name }}</h3></div>
        </div>
        <div class="card-time"> <p>合成时间: {{ voice.creationTime }}</p></div>
        <div class="card-text">
          <p>{{ voice.description }}</p>
        </div>
      </template>
      <div class="card-footer">
        <div class="start">
          <el-image src="src/assets/声音库播放.png" alt="播放" class="play-icon" @click="playVoice(voice)"/>
        </div>
        <div class="load">
          <el-image src="src/assets/声音库下载.png" alt="下载" class="play-icon" @click="downloadVoice(voice)"/>
        </div>
        <div class="more">
          <el-image src="src/assets/声音库更多.png" alt="更多" class="play-icon" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElCard, ElButton } from 'element-plus';

const voices = ref([
  {
    id: 1,
    name: "生成语音1",
    creationTime: "2024-12-05 20:28",
    description: "也许，你已无法描述他的模样，但你会记得那是一张张笑脸。也许，...",
    url: "src/assets/beep.wav",
    avatar: "src/assets/用户.png",
  },
  {
    id: 2,
    name: "生成语音2",
    creationTime: "2024-12-05 20:27",
    description: "也许，你已无法描述他的模样，但你会记得那是一张张笑脸。也许，...",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
  {
    id: 3,
    name: "生成语音3",
    creationTime: "2024-12-06 10:15",
    description: "这是一个充满活力的声音，适合用于激励人心的场合。",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
  {
    id: 4,
    name: "生成语音4",
    creationTime: "2024-12-07 14:45",
    description: "这个声音温柔而细腻，适合用于安抚情绪。",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
  {
    id: 5,
    name: "生成语音5",
    creationTime: "2024-12-08 09:30",
    description: "这个声音充满智慧，适合用于教育和讲解。",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
  {
    id: 6,
    name: "生成语音6",
    creationTime: "2024-12-09 18:00",
    description: "这个声音充满激情，适合用于鼓舞人心。",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
  {
    id: 7,
    name: "生成语音7",
    creationTime: "2024-12-10 11:20",
    description: "这个声音充满幽默，适合用于轻松的场合。",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
  {
    id: 8,
    name: "生成语音8",
    creationTime: "2024-12-11 16:55",
    description: "这个声音充满力量，适合用于激励团队。",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
  {
    id: 9,
    name: "生成语音7",
    creationTime: "2024-12-10 11:20",
    description: "这个声音充满幽默，适合用于轻松的场合。",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
  {
    id: 10,
    name: "生成语音8",
    creationTime: "2024-12-11 16:55",
    description: "这个声音充满力量，适合用于激励团队。",
    url: "src/assets/穿越火线.mp3",
    avatar: "src/assets/用户.png",
  },
]);


const playVoice = (voice) => {
  console.log(`播放声音: ${voice.name}`);
  const audio = new Audio(voice.url);
  audio.play();
};

const downloadVoice = (voice) => {
  console.log(`下载声音: ${voice.name}`);
  const link = document.createElement('a');
  link.href = voice.url;
  link.download = `${voice.name}.mp3`;
  link.click();
};
</script>

<style scoped>
.voice-library {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  background-size: cover; /* 使背景图片覆盖整个容器 */
}

.voice-card {
  //background-color: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
  border: none; /* 移除边框 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 减少阴影 */
  //background-image: url("src/assets/img_1.png");
  background-color: rgb(224, 232, 241);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.card-title {
  margin-left: 200px;
}
.card-header h3 {
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.play-icon {
  width: 20px;
  height: 20px;
}
/* 可选：自定义 Element Plus 按钮样式 */
.el-button--small {
  padding: 6px 12px;
}
</style>