let messageInstance: any = null;
let Message: any
const resetMessage = (options: any) => {
    if (!messageInstance) {
        Message[options.type](options);
    }

    messageInstance = true;
    setTimeout(() => {
        messageInstance = null;
    }, 2000);

};
resetMessage.error = (message: any, options: any) => {
    dispose(options, 'error', message);
};
resetMessage.success = (message: any, options: any) => {
    dispose(options, 'success', message);
};
resetMessage.info = (message: any, options: any) => {
    dispose(options, 'info', message);
};
resetMessage.warning = (message: any, options: any) => {
    dispose(options, 'warning', message);
};

const dispose = (options: any, type: string, message: any) => {
    Message = message || Message
    Message.config({
        top: 60,
        duration: 2
    })
    if (typeof options === 'string') {
        options = {
            content: options
        };
    }
    options.type = type;
    return resetMessage(options);
};
export const message = resetMessage;
