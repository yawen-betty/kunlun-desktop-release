/**
 * 枚举类回显
 * @param val 转换的value
 * @param enumList 枚举列表
 * @param keyKey 对应参数val的key 默认为'key'
 * @param valueKey 要转换的值的key 默认为'value'
 */
export const enumEcho = (val: any, enumList: any, keyKey: string = 'key', valueKey: string = 'value') => {
    const classItem = enumList.filter((item: any) => item[keyKey] === val);

    if (classItem && classItem.length > 0) {
        return classItem[0][valueKey]
    } else {
        return ''
    }
};

export const AgreementType = [
    {
        key: 1,
        value: '服务协议'
    }, {
        key: 2,
        value: '隐私协议'
    }
];

export const sex = [
    {
        key: 1,
        value: '男'
    }, {
        key: 2,
        value: '女'
    }
]

export const aiModal = [
    {
        key: '1',
        value: '智谱'
    }
]

export const aiOptimize = [
    {
        key: '1',
        value: '润色'
    }, {
        key: '2',
        value: '扩展'
    }, {
        key: '3',
        value: '简化'
    }, {
        key: '4',
        value: '总结'
    }
]

export const workExperienceList = [
    {
        key: '在校/应届生',
        value: '1'
    },
    {
        key: '1年以下',
        value: '2'
    },
    {
        key: '1-3年',
        value: '3'
    },
    {
        key: '3-5年',
        value: '4'
    },
    {
        key: '5-10年',
        value: '5'
    },
    {
        key: '10年以上',
        value: '6'
    }
]

export const channelList = [
    {
        key: 'BOSS直聘',
        value: 0
    },
    {
        key: '智联招聘',
        value: 1
    },
    // {
    //     key: '猎聘',
    //     value: '2'
    // },
    {
        key: '国聘网',
        value: 3
    },
    // {
    //     key: '应届生招聘',
    //     value: '4'
    // },
    // {
    //     key: '拉钩',
    //     value: '5'
    // },
]

