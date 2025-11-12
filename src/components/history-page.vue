<template>
  <div class="history-page">
    <div class="top-nav">
      <div class="top-nav-content1">
        <div class="top-nav-content-title">
          历史记录
        </div>
        <div class="top-nav-content-buttons" @click="closeHistory">
          <div class="close-icon-container">
            <el-image src="src/assets/关  闭.png" style="height: 20px;cursor: pointer" alt="关闭" class="close-icon" />
          </div>
        </div>
      </div>
      <div class="top-nav-content2">
        <el-input
            v-model="searchQuery"
            placeholder="搜索历史记录"
            clearable
            @input="handleSearch"
            class="top-nav-content2-input"
        />
        <el-image src="src/assets/搜索.png" alt="搜索" class="search-icon" />
      </div>
      <div class="top-nav-content3">
        一些其他选项
      </div>
    </div>
    <hr>
    <div class="content">
      <div
          v-for="(record, index) in historyRecords"
          :key="index"
          class="history-card"
          @mouseenter="showDelete[index] = true"
          @mouseleave="showDelete[index] = false"
      >
        <div class="history-image-container">
          <img :src="record.image" alt="" class="history-image" />
        </div>
        <div class="history-text">
          {{ record.title }}
        </div>
        <div class="history-time-delete-button">
          <div class="history-time">{{ record.time }}</div>
          <button
              v-if="showDelete[index]"
              class="delete-button"
              @click="deleteRecord(index)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const emit = defineEmits(['closeHistory',]);
const closeHistory = () => {
  emit('closeHistory', false);
  console.log('closeHistory');
  // 关闭选择器
};
// 控制搜索框显示状态
const isSearchVisible = ref(false);

// 模拟历史记录数据
const historyRecords = ref([
  {
    image: 'https://via.placeholder.com/40', // 图片链接，可以替换为实际图片
    title: '浏览了某网页,浏览了某网页,浏览了某网页浏览了某网页浏览了某网页浏览了某网页浏览了某网页',
    description: '详细说明了此次浏览的相关信息',
    time: '14:30'
  },
  {
    image: 'https://via.placeholder.com/40',
    title: '下载了某个文件',
    description: '文件名为 example.pdf',
    time: '10:15'
  }
]);

// 控制删除按钮的显示
const showDelete = reactive({});

// 初始化 showDelete 对象，确保每个记录都有对应的显示状态
historyRecords.value.forEach((_, index) => {
  showDelete[index] = false;
});

// 切换搜索框显示的方法
const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
  // TODO: 实现搜索框的显示和隐藏逻辑
};

// 删除历史记录的方法
const deleteRecord = (index) => {
  historyRecords.value.splice(index, 1);
  // 删除后更新 showDelete 对象
  // 由于 Vue 会自动响应式更新，这里无需额外操作
};
</script>

<style scoped>
/* 添加 hr 样式 */
hr {
  border: 2px solid rgba(231, 222, 222, 0.6); /* 设置边框宽度和颜色 */
  border-radius: 10px;
  margin: 0 0; /* 设置上下外边距 */
}
.history-page {
  display: flex;
  width: 400px;
  height: 700px;
  flex-direction: column;
  border-radius: 20px;
  background-color: rgba(225, 214, 214, 0.38);
}
.top-nav {
  display: flex;
  padding: 10px;
  flex-direction: column;
  .top-nav-content1 {
    display: flex;
    flex-direction: row;
    margin: 0 0 10px 0;
    justify-content: space-between;
  }
  .top-nav-content2 {
    position: relative;
    flex-direction: row;
    width: 100%;
    height: 40px;
    .top-nav-content2-input {
      position: relative;
      width: 100%;
    }
    .search-icon {
      position: absolute;
      cursor: pointer;
      z-index: 1;
      width: 30px;
      height: 30px;
      right: 10px;
      top: 0;
    }
  }
  .top-nav-content3 {
    margin: 10px 0 10px 0;
  }
}

.content {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  /* 历史记录卡片 */
  .history-card {
    display: flex;
    align-items: flex-end;
    background-color: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 5px;
    margin-bottom: 16px;
    cursor: pointer;
    position: relative; /* 为删除按钮定位 */
    .history-image {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      margin-right: 15px;
    }
    .history-text {
      flex: 1;
      color: #333333;
      font-size: 16px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .history-time-delete-button {
      position: relative;
      .history-time {
        position: relative;
        z-index: 1;
        color: #666666;
        font-size: 14px;
      }
      .delete-button {
        position: absolute;
        right: 0;
        top: 0;
        background: none;
        border: none;
        color: #FF4D4F;
        font-size: 18px;
        cursor: pointer;
      }
      .delete-button:hover {
        color: #FF1919;
      }
    }
  }
  .history-card:hover{
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  .history-card:hover .history-time {
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 0;
  }
}



</style>