<template>
  <div class="container">
    <h1>PPTX 上传与预览</h1>

    <div class="upload-section" @dragover.prevent @drop="handleDrop">
      <p>拖拽文件到此处或点击上传</p>
      <input type="file" @change="setPptFile" accept=".pptx" />
      <div class="upload-button-container">
        <button @click="uploadPpt" class="upload-button">
          上传 PPTX
        </button>
      </div>
    </div>

    <div class="preview-section">
      <h2>PPTX 预览</h2>
      <div id="ppt-preview" v-if="pptPreviewUrl">
        <iframe id="iframe1" width="800" height="600" frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='no' allowtransparency='yes'
                :src="'http://view.officeapps.live.com/op/view.aspx?src='+pptPreviewUrl"></iframe>
      </div>
      <p v-else>暂无 PPTX 文件预览...</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 状态变量
const pptFile = ref(null); // 上传的 PPTX 文件
const pptPreviewUrl = ref(null); // PPTX 预览 URL

// 设置 PPTX 文件
const setPptFile = (event) => {
  pptFile.value = event.target.files[0];
  if (pptFile.value) {
    pptPreviewUrl.value = URL.createObjectURL(pptFile.value);
  }
  console.log('PPTX 文件已选择:', pptFile.value);
  console.log('PPTX 预览 URL:', pptPreviewUrl.value);
};

// 处理拖拽上传
const handleDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    pptFile.value = file;
    pptPreviewUrl.value = URL.createObjectURL(pptFile.value);
  }
};

// 上传 PPTX 文件
const uploadPpt = async () => {
  if (!pptFile.value) {
    alert('请先选择一个 PPTX 文件！');
    return;
  }
  const formData = new FormData();
  formData.append('file', pptFile.value); // 将文件添加到 FormData

  try {
    const response = await fetch('/api/ppt/upload_pptx', {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '上传失败');
    }

    const data = await response.json();
    console.log('上传成功:', data);
    alert('文件上传成功！');
  } catch (error) {
    console.error('上传出错:', error);
    alert('文件上传失败，请检查文件类型或网络连接！');
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
}

.upload-section {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.preview-section {
  margin-top: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.upload-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button:hover {
  background-color: #0056b3;
}
</style>
