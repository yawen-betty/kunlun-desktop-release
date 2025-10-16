import {reactive} from "vue";

export class UserInfo {
  static info = reactive({
    token: '', // token
    userName: '聘小方聘小方', // 用户名
    userId: '', // 用户ID
    // 头像
  });
}
