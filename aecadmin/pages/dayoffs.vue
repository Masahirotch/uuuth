<template>
  <v-card v-if="loggedin&&adminUser" :elevation="24">
    <v-alert class="alert-message" dense text type="success" :value="alert" transition="fade-transition">{{ alertMessage }}</v-alert>
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">締め時間・休業日設定</v-toolbar-title>
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6" md="2">
          <v-menu v-model="timePicker" :close-on-content-click="false">
            <template v-slot:activator="{on}">
              <v-text-field outlined v-model="closing" label="締め時間" readonly hide-details clearable v-on="on"></v-text-field>
            </template>
            <v-time-picker @change="closingChange" v-model="closing" format="24hr" :min="minClosing" :max="maxClosing" scrollable header-color="orange"></v-time-picker>
          </v-menu>
        </v-col>
        <v-col cols="6" md="2">
          <v-menu ref="yearMonthMenu" v-model="yearMonthMenu" :close-on-content-click="false" max-width="290px" min-width="auto">
            <template v-slot:activator="{ on }">
              <v-text-field outlined v-model="yearMonth" label="休業日設定" prepend-icon="mdi-calendar" readonly v-on="on" ></v-text-field>
            </template>
            <v-date-picker @change="yearMonthChange" v-model="yearMonth" locale="ja-JP" type="month" no-title elevation="12"></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="7" class="">
          <div>
            <v-sheet height="64">
              <v-toolbar flat :dark="true">
                <v-btn fab text color="grey darken-2" @click="prevMonth">
                  <v-icon> mdi-chevron-left</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-toolbar-title>
                  {{ title }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-title v-if="selectedItemsText">
                  {{ selectedItemsText }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn fab text color="grey darken-2" @click="nextMonth">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </v-toolbar>
            </v-sheet>
            <v-sheet>
              <v-calendar
                ref="calendar"
                v-model="value"
                :weekdays="[0, 1, 2, 3, 4, 5, 6]"
                type="month"
                color="green"
                :dark="true"
                locale="ja-JP"
                :events="events"
                event-color="red"
                event-text-color="white"
                :event-height="30"
                :event-margin-bottom="5"
                @moved="movedHandler"
                @click:date="dateClickHandler"
                @click:event="eventClickHandler"
              ></v-calendar>
            </v-sheet>
          </div>
        </v-col>
        <v-col cols="12" md="5">
          <v-card class="mx-auto" style="max-width: 100%;">
            <v-toolbar color="teal" dark>
              <v-toolbar-title>休業日一覧</v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <v-chip v-for="(date, index) in dateList" :key="date + '-' + index" class="ma-2" color="red" text-color="white" label>
                {{ date }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import axios from 'axios'
  import config from '../constants/config.js'

  const SHIPPING = 1
  const NO_SHIPPING = 0

  export default {
    data: () => ({
      timePicker: false,
      closing: '23:00',
      minClosing: config.minClosing,
      maxClosing: config.maxClosing,
      dayoffs: [],
      notDeliveries: [0,3],
      loggedin: false,
      adminUser: false,
      value: '',
      yearMonth: null,
      events: [],
      title: `${new Date().getFullYear()}年${new Date().getMonth() + 1}月`,
      yearMonthMenu: false,
      alertMessage: '',
      alert: false,
    }),
    created () {
      this.getNotDeliveries()
      this.getClosing()
    },
    computed: {
      dateList: function () {
        const cloneDates = JSON.parse(JSON.stringify(this.dayoffs))
        return cloneDates.sort()
      },
      selectedItemsText: function () {
        const clone = [...this.dayoffs]
        return clone.length > 1 ? `${clone.length}日選択中` : (clone.length == 1 ? clone[0] : '')
      }
    },
    mounted () {
      //ログイン中でなければログインページを表示
      if('aeclogin' in sessionStorage) {
        this.loggedin = true;
        this.adminUser = JSON.parse(sessionStorage.getItem('aeclogin'))?.adminUser || false
      } else {
        this.$router.replace('/');
      }
      this.yearMonth = this.$dayjs().format('YYYY-MM');

      const thisMonth = new Date().getMonth() + 1
      const thisYear = new Date().getFullYear()

      this.loadDayOffs(thisMonth, thisYear)
    },
    watch: {
      dayoffs: {
        handler: function (val) {
          const newDayoffs = JSON.parse(JSON.stringify(val))
          let events = []
          for (let day of newDayoffs) {
            events.push({
              name: '休業日',
              start: day,
              end: day,
              color: 'red'
            })
          }

          this.events = events
        },
        immediate: true,
        deep: true
      },
      value: function (val) {
        const year = val.substr(0,4)
        const month = val.substr(5,2)
        this.title = `${year}年${month}月`
      }
    },
    methods: {
      prevMonth () {
        this.$refs.calendar.prev()
      },
      nextMonth () {
        this.$refs.calendar.next()
      },
      dateClickHandler(event) {
        const year = this.value.substr(0,4)
        const month = this.value.substr(5,2)
        const cloneDayoffs = [...this.dayoffs]
        if ((!cloneDayoffs.length && this.yearMonth != this.value.substr(0, 7)) || (cloneDayoffs.length > 0 && this.value.substr(0,7) != cloneDayoffs[0].substr(0,7))) {
          this.dayoffs = []
          this.yearMonth = this.value.substr(0,7)
          this.loadDayOffs(month, year)
          return;
        }
        const index = this.dayoffs.indexOf(this.value)
        const dayInWeek = new Date (this.value).getDay();
        if (index > -1) {
          this.dayoffs.splice(index, 1)
          if (this.notDeliveries.includes(dayInWeek)) {
            this.createDate(this.value, SHIPPING)
          } else {
            this.deleteDate(this.value, NO_SHIPPING)
          }
        } else {
          this.dayoffs.push(this.value)
          if (!this.notDeliveries.includes(dayInWeek)) {
            this.createDate(this.value, NO_SHIPPING)
          } else {
            this.deleteDate(this.value, SHIPPING)
          }
        }
      },
      movedHandler(event) {
        const month = event.month;
        const year = event.year;
        this.title = `${year}年${month}月`
        this.yearMonth = new Date(year, month,0).toISOString().substring(0, 7)
        this.loadDayOffs(month, year)
      },
      eventClickHandler(event) {
        const date = event.day.date
        const index = this.dayoffs.indexOf(date)
        const dayInWeek = new Date (date).getDay();

        this.dayoffs.splice(index, 1)

        if (this.notDeliveries.includes(dayInWeek)) {
          this.createDate(date, SHIPPING)
        } else {
          this.deleteDate(date, NO_SHIPPING)
        }
      },
      async loadDayOffs (month, year) {
        const totalDaysOfMonth = new Date(year, month, 0).getDate()
        try {
          const response = await axios.get(`${process.env.API}/aec/dayoffs/getDaysByMonth?month=${month}&year=${year}`)

          const { dayoffs, holidayNotOffs, notDeliveries } = response.data

          let result = []
          for (let i = 1; i <= totalDaysOfMonth; i++) {
            const newDate = new Date(`${year}-${month}-${i} 23:59`).toISOString().substring(0, 10)
            const dayInWeek = new Date(`${year}-${month}-${i} 23:59`).getDay()

            if (notDeliveries.indexOf(dayInWeek) > -1) {
              if (!holidayNotOffs.includes(newDate)) {
                result.push(newDate)
              }
            } else if(dayoffs.indexOf(newDate) > -1) {
              result.push(newDate)
            }
          }
          this.dayoffs = [...result]
        } catch (err) {
          console.log(err);
          let result = []
          for (let i = 1; i <= totalDaysOfMonth; i++) {
            const newDate = new Date(`${year}-${month}-${i} 23:59`).toISOString().substring(0, 10)
            const dayInWeek = new Date(`${year}-${month}-${i}`).getDay()
            if (this.notDeliveries.indexOf(dayInWeek) > -1) {
              result.push(newDate)
            }
          }
          this.dayoffs = [...result]
        }
      },
      getClosing () {
        axios.get(`${process.env.API}/aec/getClosingConfig`)
        .then((res) => {
          this.closing = res.data.closing
        })
        .catch((err) => {console.log(err);})
      },
      //Get delivery Config Data
      async getNotDeliveries () {
        try {
          const { data } = await axios.get(`${process.env.API}/aec/getNotDeliveries`)
          this.notDeliveries = [...data.notDeliveries]
        } catch (err) {
          console.log(err);
        }
      },
      // insert new record
      createDate (date, shipping) {
        const msg = shipping ? '営業' : '休業';
        axios.post(`${process.env.API}/aec/dayoffs/createDate?date=${date}&shipping=${shipping}`)
        .then((res) => {
          this.alert = true
          this.alertMessage = `「${date}」が${msg}日に変更されました。`
          setTimeout(() => {
            this.alert = false
          }, 1500)
        })
        .catch((err) => {console.log(err)})
      },
      // delete date
      deleteDate (date, shipping) {
        const msg = shipping ? '休業' : '営業';
        axios.post(`${process.env.API}/aec/dayoffs/deleteDate?date=${date}`)
        .then((res) => {
          this.alert = true
          this.alertMessage = `「${date}」が${msg}日に変更されました。`
          setTimeout(() => {
            this.alert = false
          }, 1500)
        })
        .catch((err) => {console.log(err)})
      },
      // update closing config
      closingChange() {
        axios.post(`${process.env.API}/aec/updateClosingConfig?closing=${this.closing}&minClosing=${this.minClosing}&maxClosing=${this.maxClosing}`)
        .then((res) => {
          console.log(res);
          this.alert = true
          this.alertMessage = '締め時間が正常に更新されました。'
          setTimeout(() => {
            this.alert = false
          }, 1500)
        })
        .catch((err) => {console.log(err);})
      },
      async yearMonthChange() {
        this.value = `${this.yearMonth}-01`
        const year = this.yearMonth.substring(0,4)
        const month = this.yearMonth.substring(5,7)
        await this.loadDayOffs(month, year)
      }
    }
  }
</script>

<style scoped>
  >>>.v-calendar .v-event {
    width: 90% !important;
    align-items: center;
    display: flex;
    justify-content: center;
    margin: auto;
  }
  >>>.alert-message {
    margin: 12px !important;
    position: relative;
    top: 12px;
  }
</style>
