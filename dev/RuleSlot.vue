<script lang="ts" setup>
import { computed, defineProps, PropType, WritableComputedRef } from 'vue';
import { RuleSlotProps } from '@/types';

const props = defineProps({
  ruleCtrl: {
    type: Object as PropType<RuleSlotProps>,
    required:true
  }
});

const ruleData: WritableComputedRef<any> = computed<any>({
  get: (): any => {
    return props.ruleCtrl.ruleData;
  },

  set: (newData: any) => {
    props.ruleCtrl.updateRuleData(newData);
  }
});
</script>

<template>
  <div>
    <span class="slot-text">SLOT #rule</span>
    <component
      :is="ruleCtrl.ruleComponent"
      v-model="ruleData"
    />
  </div>
</template>

<style lang="scss" scoped>
.slot-text {
  margin-right: 8px;
}
</style>
