import mitt from 'mitt';

type Events = {
    forcedUpdate: void; // 比如触发弹窗
    updateNewPosition: void; // 更新精选职位 有新职位UI
    exhaustedOfAttempts: void; // 推荐次数用完
};

const emitter = mitt<Events>();

export default emitter;
