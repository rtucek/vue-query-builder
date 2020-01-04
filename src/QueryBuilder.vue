<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isQueryBuilderConfig, isRuleSet } from '@/guards';
import { RuleSet, QueryBuilderConfig } from '@/types';
import QueryBuilderGroup from './QueryBuilderGroup.vue';

@Component({
  components: {
    QueryBuilderGroup,
  },
})
export default class QueryBuilder extends Vue {
  @Prop({
    required: true,
    validator: query => query === null || isRuleSet(query),
  }) readonly value!: RuleSet | null

  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  get ruleSet(): RuleSet {
    if (this.value) {
      return this.value;
    }

    if (this.config.operators.length === 0) {
      return {
        operatorIdentifier: '',
        children: [],
      };
    }

    return {
      operatorIdentifier: this.config.operators[0].identifier,
      children: [],
    };
  }
}
</script>

<template>
  <query-builder-group
    :config="config"
    :query="ruleSet"
    :depth="0"
    class="query-builder__root"
    @query-update="$emit('input', $event)"
  >
    <template
      v-for="(_, slotName) in $scopedSlots"
      v-slot:[slotName]="props"
    >
      <slot
        :name="slotName"
        v-bind="props"
      />
    </template>
  </query-builder-group>
</template>

<style lang="scss" scoped>
.query-builder__root {
  display: flex;
  flex-flow: column;
}
</style>
