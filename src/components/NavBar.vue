<script setup lang="ts">
</script>

<template>
  <nav class="nav-bar">
    <div class="nav-content">
      <router-link to="/">首页</router-link>
      <router-link to="/score-editor">乐谱编辑器</router-link>
    </div>
  </nav>
</template>

<style scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-content {
  max-width: 1280px;
  margin: 0 auto;
  height: 20px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

a {
  color: #2c3e50;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

a:hover {
  background-color: #f5f5f5;
}

a.router-link-active {
  color: #42b883;
  background-color: #f0faf5;
}
</style> 