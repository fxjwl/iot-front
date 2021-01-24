<template>
  <div class="app-container">
    <el-row style="margin-bottom: 10px">
      <el-input
        v-model="searchName"
        clearable
        placeholder="请输入名称"
        style="width: 200px"
      />
      <el-input
        v-model="searchNumber"
        clearable
        placeholder="请输入序列号"
        style="width: 200px"
      />
      <el-radio-group v-model="searchStatus">
        <el-radio-button label="全部" />
        <el-radio-button label="在线" />
        <el-radio-button label="离线" />
      </el-radio-group>
      <el-button type="primary" icon="el-icon-search" @click="getList()">
        查询
      </el-button>
    </el-row>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" prop="oid" label="序号" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="name" label="名称" />
      <el-table-column align="center" prop="serialNumber" label="序列号" />
      <el-table-column align="center" prop="model" label="型号" />
      <el-table-column align="center" prop="online" label="在线状态">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.online === 1 ? 'success' : 'danger'"
            disable-transitions
          >{{ scope.row.online === 1 ? "在线" : "离线" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="logtime" label="上/离线时间" />
      <el-table-column align="center" prop="address" label="地址" />
      <el-table-column align="center" prop="contacts" width="180px"  label="联系人">
        <template slot-scope="scope">
          {{ scope.row.contactsName === ''?'':scope.row.contactsName + ' | ' +scope.row.contactsMobile }}
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="showContacts(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" width="100px" label="查看终端">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="showClients(scope.row._id, scope.row.name)"
          >
            查看终端
          </el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" width="100px" label="查看流量">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="showChart(scope.row._id, scope.row.name)"
          >
            查看流量
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="设置联系人信息"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <el-row class="textCenter">
        <el-input v-model="contactsName" placeholder="请输入联系人姓名" />
        <el-input v-model="contactsMobile" placeholder="请输入联系人手机" />
      </el-row>
      <el-row style="margin-top:10px;" class="textCenter">
        <el-button type="primary" @click="saveContacts">保存</el-button>
      </el-row>
    </el-dialog>

    <el-drawer
      :title="drawerTitle"
      :with-header="false"
      :visible.sync="drawer"
      direction="btt"
      size="500px"
      :before-close="handleClose"
    >
      <el-card class="box-card" :body-style="{ padding: 0 }">
        <div slot="header" class="dash-title">
          <span>{{ drawerTitle }}</span>
          <div>
            <el-button type="warning" @click="closeChart">关闭</el-button>
            <el-button type="primary" @click="loadChart">查询</el-button>
            <el-date-picker
              v-model="month"
              type="month"
              placeholder="请选择月份"
            />
          </div>
        </div>
        <div class="dash-container">
          <v-chart
            :options="charOptions"
            style="width: 100%; height: 400px"
            :auto-resize="true"
          />
        </div>
      </el-card>
    </el-drawer>
    <el-drawer
      :title="drawerTitle"
      :with-header="false"
      :visible.sync="clientDrawer"
      direction="btt"
      size="500px"
      :before-close="handleClose"
    >
      <el-card class="box-card" :body-style="{ padding: 0 }">
        <div slot="header" class="dash-title">
          <span>{{ drawerTitle }}</span>
        </div>
        <div class="dash-container">
          <el-table
            v-loading="clientListLoading"
            :data="clientList"
            element-loading-text="Loading"
            border
            fit
            highlight-current-row
          >
            <el-table-column align="center" prop="oid" label="序号" width="95">
              <template slot-scope="scope">
                {{ scope.$index }}
              </template>
            </el-table-column>
            <el-table-column align="center" prop="hostname" label="终端主机" />
            <el-table-column align="center" prop="ipAddress" label="终端IP" />
            <el-table-column align="center" prop="model" label="终端MAC" />
            <el-table-column align="center" prop="iface" label="接口名称" />
            <el-table-column align="center" prop="ttl" label="有效期（秒）" />
          </el-table>
        </div>
      </el-card>
    </el-drawer>
  </div>
</template>

<script>
import moment from 'moment'
import { createOrUpdate } from '@/api/contacts'
import {
  getDeviceList,
  getNetworkFlow,
  getClientsByDeviceId
} from '@/api/device'
// import OptionManager from 'echarts/lib/model/OptionManager'

export default {
  data() {
    const cDate = new Date()
    return {
      dialogVisible: false,
      deviceId: '',
      contactsName: '',
      contactsMobile: '',
      searchName: '',
      searchNumber: '',
      searchStatus: '全部',
      drawerTitle: '',
      selectedId: '',
      month: cDate,
      drawer: false,
      flowList: null,
      clientDrawer: false,
      clientList: null,
      clientListLoading: false,
      list: null,
      listLoading: false,
      charOptions: {},
      chartType: 'bar'
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const params = {
        name: this.searchName,
        number: this.searchNumber,
        status: this.searchStatus
      }
      getDeviceList(params)
        .then((res) => {
          console.log(res)
          this.list = res.result
          this.listLoading = false
        })
        .catch(() => {
          this.listLoading = false
        })
    },
    showContacts(val) {
      this.dialogVisible = true
      this.deviceId = val._id
      this.contactsName = val.contactsName
      this.contactsMobile = val.contactsMobile
    },
    saveContacts() {
      const dat = {
        deviceId: this.deviceId,
        contactsName: this.contactsName,
        contactsMobile: this.contactsMobile
      }

      createOrUpdate(dat).then(res => {
        this.$message.success('保存成功')
        this.deviceId = ''
        this.contactsName = ''
        this.contactsMobile = ''
      }).catch(() => {
        this.$message.warning('保存失败')
      })
    },
    showClients(id, name) {
      this.drawerTitle = name + ' 终端信息'
      this.clientDrawer = true
      this.clientListLoading = true
      getClientsByDeviceId(id)
        .then((res) => {
          this.clientList = res.result.clients
          this.drawerTitle += '，终端总数：' + res.result.count
          this.clientListLoading = false
        })
        .catch(() => {
          this.clientListLoading = false
        })
    },
    showChart(id, name) {
      this.selectedId = id
      this.drawerTitle = name + ' 月度流量信息（单位：MB）'
      this.drawer = true
      this.loadChart()
    },
    closeChart() {
      this.drawer = false
    },
    loadChart() {
      const m = moment(this.month).format('YYYYMM')
      getNetworkFlow(m, this.selectedId).then((res) => {
        this.flowList = res
        const xAxis = this.flowList.map((d) => d.day)
        const seriesData = this.flowList.map((t) => t.total)
        const total = seriesData.reduce(function(prev, curr, idx, arr) {
          return prev + curr
        })
        this.drawerTitle += '，本月总流量：' + total
        this.generateChartOptions(xAxis, seriesData)
      })
    },
    generateChartOptions(x, s) {
      this.charOptions = {
        color: ['#3398DB'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: x,
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '流量',
            type: 'bar',
            barWidth: '60%',
            label: {
              show: true,
              position: 'inside'
            },
            data: s
          }
        ]
      }
    },
    handleClose(done) {
      this.$confirm('确认关闭吗？')
        .then((_) => {
          done()
        })
        .catch((_) => {})
    }
  }
}
</script>

<style>
.el-drawer:focus {
  outline: none;
}
</style>

<style lang="scss" scoped>

.el-input{
  width: 180px;
}

.dash-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dash-container {
  padding: 15px;
}
.textCenter{
  text-align: center;
}
</style>
