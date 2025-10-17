import {reactive} from "vue";

export class UserInfo {
  static info = reactive({
    token: '', // token
    userName: '聘小方聘小方', // 用户名
    userId: '', // 用户ID
    avatar: 'https://ww2.sinaimg.cn/mw690/007ut4Uhly1hx4v375r00j30u017cdla.jpg',  // 头像
  });
}
