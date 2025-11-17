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
