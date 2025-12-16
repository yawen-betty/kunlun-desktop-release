/**
 * 通用时间工具类js方法封装处理
 * Copyright (c) 2022 yu.chuan
 */

/**
 * 时间格式化
 *
 * @param time 需要格式化的时间
 * @param pattern 格式化字符
 * @returns 格式化后的时间
 */
export function parseDate(time: number | string, pattern?: string) {
    if (arguments.length === 0 || !time) {
        return null;
    }

    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';

    let date;

    if (typeof time === 'object') {
        date = time;
    } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time);
        } else if (typeof time === 'string') {
            time = time.replace(/-/gm, '/').replace('T', ' ').replace(/\.[\d]{3}/gm, '');
        }

        if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000;
        }

        date = new Date(time);
    }

    const formatObj = {

        y: date.getFullYear(),

        m: date.getMonth() + 1,

        d: date.getDate(),

        h: date.getHours(),

        i: date.getMinutes(),

        s: date.getSeconds(),

        a: date.getDay()

    };

    return format.replace(/{([ymdhisa])+}/g, (result, key) => {
        // @ts-ignore
        let value = formatObj[key];

        // Note: getDay() returns 0 on Sunday
        if (key === 'a') {
            return ['日', '一', '二', '三', '四', '五', '六'][value];
        }
        if (result.length > 0 && value < 10 && key === 'i') {
            value = '0' + value;
        }

        return value || 0;
    });
}
