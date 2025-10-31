<template>
  <div class="address-search_box p15">
    <Poptip
      class="address-search-pop_tip"
      v-model="isSearchDropDown"
      placement="bottom"
      :disabled="disabled"
    >
      <SearchBox
        class="keyword"
        v-model="searchValue"
        clearable
        placeholder="请输入关键词"
        @on-clear="handleSearch"
        @on-change="handleSearch"
        :maxlength="100"
      />
      <template #content>
        <div class="search-content p10" v-if="searchList.length > 0">
          <div class="search-item pointer" v-for="info in searchList" :key="info.id"
               v-html="getHighLightFont(info.name!, searchValue)"
               @click="handleSelectItem(info)"></div>
        </div>
      </template>
    </Poptip>

    <svg-icon name="icon-cha" size="16" @click.stop="handleClose" class="icon-close pointer"
              color="#9499A5"
    />
  </div>
</template>

<script setup lang="ts" name="AddressSearch">
import SearchBox from '@/components/searchBox/index.vue';
import {inject, ref, watch} from 'vue';
import {AreaInfoBean} from "@/api/user/dto/bean/AreaInfoBean.ts";
import {SearchAreaInDto} from "@/api/address/dto/SearchArea.ts";
import {AddressService} from "@/service/AddressService.ts";

const props = defineProps({
  // 禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 当前选中国家
  currentCountry: {
    type: Object,
    default: () => {
    }
  },
  // 弹窗状态
  isDropDown: {
    type: Boolean,
    default: false
  },
  // 查询最大层级
  maxLevel: {
    type: Number,
    default: 2
  }
});

const emits = defineEmits(['onClose']);

const emitUpdate = inject<(item: AreaInfoBean) => void>('emitUpdate');
// 搜索弹窗状态
const isSearchDropDown = ref<boolean>(false);
// 搜索框值
const searchValue = ref<string>('');
// 搜索列表
const searchList = ref<AreaInfoBean[]>([]);
const addressService = new AddressService();


watch(() => props.isDropDown, (newVal: boolean) => {
  if (!newVal) {
    searchValue.value = '';
    searchList.value = [];
  }
});

/**
 * @description: 搜索列表
 */
const handleSearch = async (v: Event) => {
  searchList.value = [];
  if (!searchValue.value) return;
  handleSearchCityList();
};

/**
 * @description: 关闭
 */
const handleClose = async () => {
  emits('onClose')
};

/**
 * @description: 搜索城市列表
 */
const handleSearchCityList = () => {
  const inDto: SearchAreaInDto = {
    rangeType: '1',
    maxLevel: props.maxLevel,
    keyWord: searchValue.value,
  };

  addressService.searchArea(inDto).then(res => {
    if (res.code === 200) {
      searchList.value = res.data.list.filter(
        // 直辖市去除全部 北京110000 天津120000 上海310000 重庆500000
        (item: AreaInfoBean) => item.id !== '110000' && item.id !== '120000' && item.id !== '310000' && item.id !== '500000'
      );
    }
  })
}

// 当前选中
const handleSelectItem = (item: AreaInfoBean) => {
  emitUpdate!(item);
};

// 搜索文字高亮
const getHighLightFont = (name: string, highLightFont: string): string => {
  if (!highLightFont) return name;
  const parts = name.split('/');
  const regex = new RegExp(highLightFont, 'gi');

  if (parts[1] && parts[1].includes(highLightFont)) {
    return parts[0] + '/' + parts[1].replace(regex, (match) => `<span>${match}</span>`);
  }
  if (parts[0] && parts[0].includes(highLightFont)) {
    return parts[0].replace(regex, (match) => `<span>${match}</span>`) + '/' + parts[1];
  }

  return name;
};

</script>

<style scoped lang="scss">
.address-search_box {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid $border-default;
  position: relative;

  .icon-close {
    position: absolute;
    right: vw(20);
    top: 50%;
    transform: translateY(-50%);
  }

  .keyword {
    width: vw(300);
    border: 1px solid $border-default;

    :deep(.ivu-input) {
      background: $white;
    }
  }

  .country {
    color: $font-dark;
    font-size: vw(14);
    font-style: normal;
    font-weight: 400;
    line-height: vw(14);
  }

  .search-content {
    .search-item {
      padding: vh(9) vw(10);
      color: $font-dark;
      font-size: vw(14);
      font-style: normal;
      font-weight: 400;
      line-height: vw(14);

      :deep(span) {
        color: $text-high-light;
      }
    }
  }
}

.address-search-pop_tip {
  :deep(.ivu-poptip-popper) {
    width: vw(300) !important;
  }
}
</style>
