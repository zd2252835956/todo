import { createApp } from 'vue'
import App from './App.vue'

import Antd from 'ant-design-vue';

import 'ant-design-vue/dist/antd.css';

const app = createApp(App);

app.directive("focus", {
  mounted(el) {
    console.log("focus mounted");
    el.focus();
  }
})
app.use(Antd).mount('#app')
