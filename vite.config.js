import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { oml2dPlugin } from 'vuepress-plugin-oh-my-live2d';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
        vueDevTools(),
        //引入OhMyLive2D
        oml2dPlugin({
            // 在这里配置选项
            models: [
                {
                    path: 'https://model.oml2d.com/Senko_Normals/senko.model3.json',
                    scale: 0.12,
                    position: [-10, 50],
                    stageStyle: {
                        width: 350
                    }
                }
            ]
        })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
            target: 'http://127.0.0.1:80/',
          //target: 'http://xg-8.frp.one:47342/', // 目标服务器的 URL
        changeOrigin: true, // 是否改变请求的源头
        rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径，去掉 /api 前缀
      },
      '/serverB': {
        target: 'http://25e192ee.r15.vip.cpolar.cn', // 后端服务地址
        changeOrigin: true, // 是否改变请求的源头
        rewrite: (path) => path.replace(/^\/serverB/, ''), // 去掉 /api2 前缀
      },
      '/stream': {
        target: 'http://4f044f42.r9.cpolar.cn', // 后端服务地址
        changeOrigin: true, // 是否改变请求的源头
        rewrite: (path) => path.replace(/^\/stream/, ''), // 去掉 /api2 前缀
      },
    },
  },
})
