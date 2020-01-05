<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { RuleSlotProps } from '@/types';

@Component
export default class RuleSlot extends Vue {
  @Prop({ required: true }) readonly ruleCtrl!: RuleSlotProps

  get ruleData(): any {
    return this.ruleCtrl.ruleData;
  }

  set ruleData(newData: any) {
    this.ruleCtrl.updateRuleData(newData);
  }
}
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
