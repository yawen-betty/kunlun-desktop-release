<!-- svg图标标签 -->
<template>
  <svg class="svg-icon"
       aria-hidden="true"
       :style="'width:' + size + ';height:' + size">
    <use :xlink:href="symbolId" :fill="color"/>
  </svg>
</template>

<script setup lang="ts">
import { computed }from 'vue';
const props = defineProps({
    prefix: {
        type: String,
        default: 'icon'
    },
    name: {
        type: String,
        required: false
    },
    color: {
        type: String
    },
    size: {
        type: String,
        default: '10px'
    }
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);

</script>

<style scoped>
.svg-icon {
  overflow: hidden;
  fill: currentColor;
}
</style>
