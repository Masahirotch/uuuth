<template>
  <v-tooltip top v-if="iconDisplay">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-if="isText"
        @click="$emit('btnClick')"
        :disabled="iconDisabled"
        :value="`${iconValue}`"
        :class="className"
        small
        text
        v-bind="attrs"
        v-on="on"
        ><v-icon :color="isActive ? '#1473e6' : ''">{{ isActive ? iconNameActive : iconName }}</v-icon></v-btn
      >
      <v-btn
        v-else
        @click="$emit('btnClick')"
        :disabled="iconDisabled"
        :value="`${iconValue}`"
        :class="className"
        small
        icon
        v-bind="attrs"
        v-on="on"
        ><v-icon :color="isActive ? '#1473e6' : ''">{{ isActive ? iconNameActive : iconName }}</v-icon></v-btn
      >
    </template>
    <span>{{ iconTooltip }}</span>
  </v-tooltip>
</template>
<script>
export default {
  props: {
    iconDisplay: {
      type: Boolean,
      default: true,
    },
    iconDisabled: {
      type: Boolean,
      default: false,
    },
    iconName: {
      type: String,
      default: null,
    },
    className: {
      type: String,
      default: null,
    },
    iconValue: {
      type: Number,
      default: -1,
    },
    iconTooltip: {
      type: String,
      default: null,
    },
    isText: {
      type: Boolean,
      default: false,
    },
    iconNameActive: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    }
  },
};
</script>
