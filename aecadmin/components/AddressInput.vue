<template>
  <v-form ref="form">
    <v-row dense class="mb-2">
      <v-col cols="2">
        <v-text-field v-model="address.zip" label="郵便番号(－なし)" clearable type="number" hide-spin-buttons :rules="rule_zip" @change="resetErr" dense>
        </v-text-field>
      </v-col>
      <v-col cols="1">
        <Icon @btnClick="setAddress" iconName="mdi-home-search-outline" iconTooltip="郵便番号から住所を自動入力" />
      </v-col>
      <v-col cols="2">
        <v-text-field  v-model="address.perf" label="都道府県" clearable dense></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field  v-model="address.city" label="市区町村" clearable dense></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field  v-model="address.street" label="町名" clearable dense></v-text-field>
      </v-col>
    </v-row>
    <v-row dense class="mb-2">
      <v-col cols="4">
        <v-text-field v-model="address.address" label="番地" clearable dense></v-text-field>
      </v-col>
      <v-col cols="8">
        <v-text-field v-model="address.addition" label="建物名等" clearable dense></v-text-field>
      </v-col>
    </v-row>
    <v-row dense v-if="!isInOrderDetail">
      <v-col cols="5">
        <v-row no-gutters dense>
          <v-col cols="3">
            <v-text-field v-model="address.tel1" label="電話番号" clearable type="number" hide-spin-buttons dense></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="address.tel2" prepend-icon="mdi-minus" clearable type="number" hide-spin-buttons dense></v-text-field>
          </v-col>
          <v-col cols="5">
            <v-text-field v-model="address.tel3" prepend-icon="mdi-minus" clearable type="number" hide-spin-buttons dense></v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="7">
        <v-text-field v-model="address.name" label="届け先名" clearable dense></v-text-field>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import axios from 'axios';
export default {
  props: {
    address: {},
    isInOrderDetail: {
      type: Boolean,
      default: false,
    }
  },
  data: () => ({
    found: true,
  }),
  computed: {
    //入力ルール
    rule_zip() {
      return [this.found ||'誤った郵便番号です'];
    },
  },
  methods: {
    //郵便番号から住所を設定
    setAddress() {
      if(!this.address.zip) return;
// TODO
      axios.get(`${process.env.API}/aec/const-zips?zip=${this.address.zip}`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          if(Object.keys(response.data).length === 0) {
            this.found = false;
            this.$refs.form.validate();
          } else {
            this.address.prefCode = response.data.prefCode;
            this.address.perf = response.data.prefName;
            this.address.city = response.data.cityName;
            this.address.street = response.data.printName;
          }
        })
        .catch(error => {
          this.found = false;
          this.$refs.form.validate();
          console.log(error);
          return;
        });
    },
    //バリデーションエラーのリセット
    resetErr() {
      this.found = true;
      this.$refs.form.resetValidation();
    },
  },
}
</script>
