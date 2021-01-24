import request from '@/utils/request'

export function createOrUpdate(data) {
  return request.post('/contacts', data)
}
