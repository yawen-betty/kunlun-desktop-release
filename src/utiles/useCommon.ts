import {inject} from 'vue'
import HttpClient from '@/api/HttpClient.ts'

export function useCommon(offsetHeight?: number) {
  // 注入 http
  const http = inject('$http') as HttpClient

  return {
    http
  }
}
