import request from '@/utils/request'
// import qs from 'qs'

export function login(data) {
  return request.get('user/login',{params:data})
}

export function getInfo(token) {
  return request.get('user/info/' + token)
}

export function logout() {
  return request.put('/user/logout')
}
