<template>
    <div class="app-container">
        <!-- 使用 Oml2d 组件 -->
        <Oml2d />

        <!-- 路由出口 -->
        <router-view />
    </div>
</template>

<script setup>
    import { RouterView } from 'vue-router'
    import Oml2d from '@/components/Oml2d.vue'
</script>

<style>
    body {
        margin: 0;
        padding: 0;
    }

    /* 可选：固定 Live2D 模型位置 */
    .app-container {
        position: relative;
        min-height: 100vh;
    }

    /* 调整模型容器样式，避免遮挡页面 */
    .oh-my-live2d { /* 注意：这里的类名是组件内部 template 中定义的（<div class="oh-my-live2d">），和组件名无关 */
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 999;
    }
</style>