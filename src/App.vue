<template>
  <TodoList />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TodoList from "./components/todoList.vue";

export default defineComponent({
  name: "App",
  components: {
    TodoList,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  font: 14px "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>
