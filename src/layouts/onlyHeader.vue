<script setup lang="ts">
import Header from '@/layouts/components/header.vue';
</script>

<template>
  <Layout class="layout">
    <Header></Header>
    <Layout>
      <Content>
        <router-view />
      </Content>
    </Layout>
  </Layout>
</template>

<style scoped lang="scss">
.layout{
  height: 100vh;
}
</style>
