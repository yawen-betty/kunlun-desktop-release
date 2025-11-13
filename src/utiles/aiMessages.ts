// AI助手回复话术
const aiMessages = [
    '好的，我来帮你完成撰写！',
    '收到，这就帮你着手撰写！',
    '没问题，我将协助你撰写！',
    '好的，现在就帮你撰写相关内容！',
    '没问题，这就安排～',
    '好的，交给我！',
    '收到，我来搞定！',
    '收到，这就帮你着手撰写！'
];

// 获取随机AI回复话术
export const getRandomAiMessage = (): string => {
    const randomIndex = Math.floor(Math.random() * aiMessages.length);
    return aiMessages[randomIndex];
};
