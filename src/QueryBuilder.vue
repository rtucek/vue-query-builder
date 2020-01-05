<script lang="ts">
import {
  Component, Vue, Prop, Provide, Watch,
} from 'vue-property-decorator';
import { isQueryBuilderConfig, isRuleSet } from '@/guards';
import { RuleSet, QueryBuilderConfig } from '@/types';
import QueryBuilderGroup from './QueryBuilderGroup.vue';
import MergeTrap from '@/MergeTrap';

@Component({
  components: {
    QueryBuilderGroup,
  },
})
export default class QueryBuilder extends Vue {
  trap: MergeTrap | null = null

  @Prop({
    required: true,
    validator: query => query === null || isRuleSet(query),
  }) readonly value!: RuleSet | null

  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  @Provide() getMergeTrap = this.provideMergeTrap

  @Watch('value')
  removeTrap() {
    // If for any reason the parent who actually owns the state updates the query, we'll remove
    // cleanup any existing traps.
    this.trap = null;
  }

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

  get queryBuiderConfig(): QueryBuilderConfig {
    if (!this.config.dragging) {
      return this.config;
    }

    // Ensure group parameter is unique... otherwise query builder instances would be able to drag
    // across 2 different instances and this is currently not supported.
    return {
      ...this.config,
      dragging: {
        handle: '.query-builder__draggable-handle',
        ...this.config.dragging,
        group: `${new Date().getTime() * Math.random()}`,
      },
    };
  }

  updateQuery(newQuery: RuleSet): void {
    this.trap = null;
    this.$emit('input', { ...newQuery });
  }

  provideMergeTrap(): MergeTrap {
    if (this.trap) {
      return this.trap;
    }

    this.trap = new MergeTrap();

    return this.trap;
  }
}
</script>

<template>
  <query-builder-group
    :config="queryBuiderConfig"
    :query="ruleSet"
    :depth="0"
    class="query-builder__root"
    @query-update="updateQuery"
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
