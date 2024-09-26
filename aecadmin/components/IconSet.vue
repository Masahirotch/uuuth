<template>
  <Icon
    @btnClick="btnClick"
    :iconDisplay="!!icons[iconType][iconNumber]?.icon"
    :iconDisabled="iconDisabled"
    :iconName="icons[iconType][iconNumber]?.icon"
    :iconNameActive="icons[iconType][iconNumber]?.iconActive"
    :iconTooltip="icons[iconType][iconNumber]?.text"
    :iconValue="Number(iconNumber)"
    :isActive="isActive"
  />
</template>
<script>
import { commonData } from "../mixin/CommonData";
export default {
  mixins: [commonData],
  props: {
    iconType: {
      type: String,
      default: null,
    },
    iconNumber: {
      type: Number,
      default: -1,
    },
    iconDisabled: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    btnClick() {
      this.$emit("btnClick");
    },
  },
};
</script>
