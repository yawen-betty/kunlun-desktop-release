// 处理流式数据
export const extractDataContent = (data: string, type: string): string => {
    const dataList: string[] = data.split(type)

    const lastDataIndex: number = dataList[1].lastIndexOf('data:');
    return lastDataIndex !== -1 ? dataList[1].substring(lastDataIndex + 5) : '';
};
