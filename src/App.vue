<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div id="app">
    <nav>
      <router-link to="/">首页</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style lang="less" scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  nav {
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 2rem;

    a {
      color: #2c3e50;
      text-decoration: none;
      margin-right: 1rem;

      &.router-link-active {
        color: #42b883;
      }
    }
  }
}
</style>
