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
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;
.layout{
  height: 100vh;
}
</style>
