<template>
  <div class="app-container">
    <el-card class="box-card" shadow="never" :body-style="{ padding: 0 }">
      <!-- <div class="dash-title" slot="header">
        <span>设备数量信息</span>
      </div> -->
      <div class="dash-container">
        <div class="item">
          <div>设备总量</div>
          <div class="num">{{ total }}</div>
        </div>
        <div class="item">
          <div>在线总量</div>
          <div class="num">{{ online }}</div>
        </div>
        <div class="item">
          <div>离线总量</div>
          <div class="num">{{ offline }}</div>
        </div>
      </div>
    </el-card>
    <br>
    <el-card class="box-card" shadow="never" :body-style="{ padding: 0 }">
      <div slot="header" class="dash-title">
        <span>本年度流量信息（单位：MB）</span>
      </div>
      <div class="dash-container">
        <v-chart :options="charOptions" style="width:100%;height:400px" :auto-resize="true" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getAllDevices, getNetWorkFlowStatistics } from '@/api/device'

export default {
  data() {
    return {
      total: 0,
      online: 0,
      offline: 0,
      charOptions: {},
      chartType: 'bar'
    }
  },

  mounted() {
    getAllDevices().then(res => {
      this.total = res.total
      this.online = res.online
      this.offline = res.offline
    })

    getNetWorkFlowStatistics().then(res => {
      const xAxis = res.map(d => d.day)
      const seriesData = res.map(t => t.total)
      this.generateChartOptions(xAxis, seriesData)
    })
  },
  methods: {
    generateChartOptions(x, s) {
      this.charOptions = {
        color: ['#3398DB'],
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
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
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

.dash-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dash-container {
  display: flex;

  .item {
    padding: 20px;
    flex: 1;
    border-right: 1px solid #dfdfdf;
    font-size: 14px;

    &:last-child {
      border-right: 0;
    }

    .num {
      font-size: 26px;
      font-weight: 500;
      margin: 10px 0;
    }

    i {
      margin-left: 10px;
      &.red {
        color: #f60007;
      }
      &.green {
        color: #76e474;
      }
    }
  }
}
</style>
