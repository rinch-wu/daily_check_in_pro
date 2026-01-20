import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import piniaPluginUnistorage from 'pinia-plugin-unistorage'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 创建 Pinia 实例
  const pinia = Pinia.createPinia()

  // 持久化插件
  pinia.use(piniaPluginPersistedstate)
  // uni-app 持久化插件
  pinia.use(piniaPluginUnistorage)

  app.use(pinia)

  return {
    app
  }
}