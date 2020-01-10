<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { GroupCtrlSlotProps } from '@/types';

@Component
export default class GroupCtrlSlot extends Vue {
  @Prop({ required: true }) readonly groupCtrl!: GroupCtrlSlotProps

  selectedRule: string = ''
}
</script>

<template>
  <div class="query-builder-group-slot__group-control">
    SLOT #groupControl
    <select
      v-model="selectedRule"
      class="query-builder-group-slot__rule-selection"
    >
      <option disabled value="">Select a rule</option>
      <option
        v-for="rule in groupCtrl.rules"
        :key="rule.identifier"
        :value="rule.identifier"
        v-text="rule.name"
      />
    </select>
    <button
      :disabled="selectedRule === ''"
      @click="groupCtrl.addRule(selectedRule)"
      class="query-builder-group-slot__rule-adding-button"
    >
      Add Rule
    </button>
    <div class="query-builder-group-slot__spacer"/>
    <button
      @click="groupCtrl.newGroup"
      class="query-builder-group-slot__group-adding-button"
    >
      Add Group
    </button>
  </div>
</template>

<style lang="scss" scoped>
.query-builder-group-slot__group-control {
  padding: 16px;
  display: flex;
  flex-direction: row;
}

.query-builder-group-slot__rule-selection,
.query-builder-group-slot__rule-adding-button {
  margin-left: 8px;
}

.query-builder-group-slot__spacer {
  width: 0;
  margin-left: 12px;
  margin-right: 12px;
  border-left: 1px solid hsl(0, 0%, 75%);
}
</style>
