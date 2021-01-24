import request from '@/utils/request'

export function getDeviceList(data) {
  return request.get('/device/devices', {
    params: data
  })
}

export function getNetworkFlow(month, id) {
  return request.get('/device/network-flow/' + month + '/' + id)
}

export function getAllDevices() {
  return request.get('/device/device-statistics')
}

export function getNetWorkFlowStatistics() {
  return request.get('/device/netWork-flow-statistics')
}

export function getClientsByDeviceId(id) {
  return request.get('/device/clients/' + id)
}
