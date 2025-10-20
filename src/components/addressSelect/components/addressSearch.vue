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
                         v-html="getHighLightFont(info.name!, searchValue,'address')"
                         @click="handleSelectItem(info)"></div>
                </div>
            </template>
        </Poptip>
        <Poptip
            class="address-select-country"
            v-model="isSelectDropDown"
            placement="bottom-start"
            :disabled="disabled"
        >
            <svg-icon name="icon-qiehuan" size="14" color="#9499A5" class="ml-20 pointer"/>
            <div class="country ml-10 pointer">{{ currentCountry.zhCn }}</div>
            <template #content>
                <div class="select-country_content p10">
                    <SearchBox
                        class="keyword-country"
                        v-model="searchCountryValue"
                        clearable
                        placeholder="请输入"
                        @on-clear="onChangeCountry"
                        @on-change="onChangeCountry"
                        :maxlength="100"
                    />
                    <div class="select-country_list mt-10">
                        <div
                            :class="['select-country_item','ellipsis','pointer',currentCountry.id === item.id && 'select-content-item']"
                            v-for="item in countryList" :key="item.id" @click="handleSelectCountry(item)"
                        >
                            <span class="dian" v-if="currentCountry.id === item.id "></span>
                            <div
                                v-html="getHighLightFont(`${item.zhCn || ''} ${item.name || ''}`,searchCountryValue,'country')"></div>
                        </div>
                    </div>
                </div>
            </template>
        </Poptip>

    </div>
</template>

<script setup lang="ts" name="AddressSearch">
import SearchBox from '@/components/searchBox/index.vue';
import { inject, onMounted, reactive, ref, watch }from 'vue';
import { SystemPath }from '@/api/system/SystemPath';
import { QueryCountryListInDto, QueryCountryListOutDto }from '@/api/system/dto/QueryCountryList';
import { SearchAreaInDto, SearchAreaOutDto }from '@/api/system/dto/SearchArea';
import { AreaInfoBean }from '@/api/system/dto/bean/AreaInfoBean';
import {useCommon} from "@/utiles/useCommon.ts";

const {http} = useCommon();

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
    // 海外查询地址
    getOverseasAreaList: {
        type: Function,
        default: () => {
        }
    }
});

const emitUpdate = inject<(item: AreaInfoBean) => void>('emitUpdate');

const emits = defineEmits(['onChangeCountry', 'update:currentCountry']);
// 国家列表
const countryList = ref<QueryCountryListOutDto[]>([]);
// 搜索弹窗状态
const isSearchDropDown = ref<boolean>(false);
// 选择弹窗状态
const isSelectDropDown = ref<boolean>(false);
// 搜索国家
const searchCountryValue = ref<string>('');
// 搜索框值
const searchValue = ref<string>('');
// 搜索列表
const searchList = ref<SearchAreaOutDto[]>([]);
// 分页
const cityPageInfo = reactive({
    pageNum: 1,
    pageSize: 10
});
// 总数
const cityTotal = ref<number>(0);

watch(() => props.isDropDown, (newVal: boolean) => {
    if (!newVal) {
        searchValue.value = '';
        searchList.value = [];
        cityPageInfo.pageNum = 1;
    }
});

/**
 * @description: 搜索列表
 */
const handleSearch = async (v: Event) => {
    searchList.value = [];
    if (props.currentCountry.id === '1') {
        if (!searchValue.value)return;
        handleSearchCityList();
    }else {
        searchList.value = await props.getOverseasAreaList(props.currentCountry.id, searchValue.value);
    }
};

/**
 * @description: 搜索城市列表
 */
const handleSearchCityList = () => {
    const inDto: SearchAreaInDto = {
        maxLevel: 3,
        keyWord: searchValue.value,
        pageInfo: cityPageInfo
    };
    const path = SystemPath.SearchArea;

    http.request<SearchAreaOutDto>(path, inDto).then((res) => {
        if (res.code === 200) {
            const filterList: SearchAreaOutDto[] = res.data.list.filter(
                // 直辖市去除全部 北京110000 天津120000 上海310000 重庆500000
                (item: SearchAreaOutDto) => item.id !== '110000' && item.id !== '120000' && item.id !== '310000' && item.id !== '500000'
            );

            if (cityPageInfo.pageNum === 1) {
                searchList.value = filterList;
                cityTotal.value = res.data.total;
            }else {
                searchList.value.push(...filterList);
            }
        }
    });
};

// 当前选中
const handleSelectItem = (item: AreaInfoBean) => {
    emitUpdate!(item);
};

// 搜索文字高亮
const getHighLightFont = (name: string, highLightFont: string, type: string): string => {
    if (!highLightFont)return name;
    const parts = name.split('/');
    const regex = new RegExp(highLightFont, 'gi');

    if (parts[1] && parts[1].includes(highLightFont)) {
        return parts[0] + '/' + parts[1].replace(regex, (match) => `<span>${match}</span>`);
    }
    if (parts[0] && parts[0].includes(highLightFont)) {
        return type === 'country' ? parts[0].replace(regex, (match) => `<span>${match}</span>`) : parts[0].replace(regex, (match) => `<span>${match}</span>`) + '/' + parts[1];
    }

    return name;
};

// 获取所有国家列表
const getOverseasCountry = () => {
    const data: QueryCountryListInDto = {
        keyword: searchCountryValue.value
    };
    const path = SystemPath.QueryCountryList;

    http.request<QueryCountryListOutDto>(path, data).then((res) => {
        if (res.code === 200) {
            let list: QueryCountryListOutDto[] = res.data;

            if (!searchCountryValue.value) {
                list = [
                    {
                        id: '1',
                        zhCn: '中国'
                    }, ...res.data
                ] as QueryCountryListOutDto[];
            }

            countryList.value = list;
        }
    });
};

// 为关键词新增标签
const addSpanToKeyword = (text: string, keyword: string) => {
    const regex = new RegExp(`[${keyword}]`, 'gi');

    return text.replace(regex, (match) => {
        return `<span>${match}</span>`;
    });
};

// 搜索内容国家
const onChangeCountry = () => {
    getOverseasCountry();
};

// 选择国家
const handleSelectCountry = (item: QueryCountryListOutDto) => {
    emits('update:currentCountry', item);
    emits('onChangeCountry');
    isSelectDropDown.value = false;
};

onMounted(() => {
    getOverseasCountry();
});

</script>

<style scoped lang="scss">
.address-search_box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid $border-default;

    .keyword {
        width: 300px;
    }

    .country {
        color: $font-dark;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 14px;
    }

    .search-content {
        .search-item {
            padding: 9px 10px;
            color: $font-dark;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 14px;

            :deep(span) {
                color: $text-high-light;
            }
        }
    }
}

.address-select-country {
    :deep(.ivu-poptip-popper) {
        width: 300px !important;
        padding: 0;
    }

    :deep(.ivu-poptip-rel) {
        display: flex;
    }
}

.select-country_content {
    .keyword-country {
        width: 280px;
    }

    .select-country_list {
        height: 174px;
        overflow-y: auto;

        .select-country_item {
            margin-bottom: 4px;
            padding: 9px 10px;
            color: $font-dark;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 14px;
            transition: padding-left 0.2s ease-in-out;
            position: relative;

            :deep(span) {
                color: $text-high-light;
            }

            .dian {
                width: 6px;
                height: 6px;
                background: $white;
                border-radius: 50%;
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
            }

            &:hover {
                background: #EEF5FF;
                padding-left: 26px;
            }

            &.select-content-item {
                background: $theme-color;
                padding-left: 26px;
                color: $white;
            }

        }
    }
}

.address-search-pop_tip {
    :deep(.ivu-poptip-popper) {
        width: 300px !important;
    }
}
</style>
