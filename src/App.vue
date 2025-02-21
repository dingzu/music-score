<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style lang="less" scoped>
#app {
  min-height: 100vh;
}

.main-content {
  margin: 0 auto;
  padding: 0;
}
</style>
