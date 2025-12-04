import mitt from 'mitt';

type Events = {
    forcedUpdate: void; // 比如触发弹窗
};

const emitter = mitt<Events>();

export default emitter;
