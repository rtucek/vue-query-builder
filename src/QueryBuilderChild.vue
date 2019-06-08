<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import {
  RuleSet, Rule, QueryBuilderConfig, RuleDefinition, OperatorDefinition, Operator,
} from '@/types';
import { isRule, isRuleSet, isQueryBuilderConfig } from '@/guards';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderRule from '@/QueryBuilderRule.vue';
import { Component as VueComponent } from 'vue';

@Component({
  components: {
    QueryBuilderGroup,
    QueryBuilderRule,
  },
})
export default class QueryBuilderChild extends Vue {
  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  @Prop({
    required: true,
    validator: query => isRule(query) || isRuleSet(query),
  }) readonly query!: RuleSet | Rule

  @Prop() readonly depth!: number

  get isRule(): boolean {
    return isRule(this.query);
  }

  get isRuleSet(): boolean {
    return isRuleSet(this.query);
  }

  get ruleDefinition(): RuleDefinition | null {
    if (!this.isRule) {
      return null;
    }

    const ruleDefinition = this.config
      .rules
      .find(definition => definition.identifier === (this.query as Rule).identifier);

    return ruleDefinition || null;
  }

  get component(): VueComponent | string {
    if (this.isRule && this.ruleDefinition) {
      return QueryBuilderRule;
    }

    if (this.isRuleSet) {
      return QueryBuilderGroup;
    }

    throw new Error('No component definition available.');
  }

  get definition(): RuleDefinition | null {
    if (this.isRule && this.ruleDefinition) {
      return this.ruleDefinition;
    }

    if (this.isRuleSet) {
      return null;
    }

    throw new Error('No component definition available.');
  }
}
</script>

<template>
  <div class="query-builder-child">
    <component
      :is="component"
      :config="config"
      :query="query"
      :depth="depth"
      @query-update="$emit('query-update', $event)"
      class="query-builder-child__component"
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
    </component>
    <button
      aria-label="Close"
      class="query-builder-child__delete-child"
      @click="$emit('delete-child')"
    >
      <span aria-hidden="true">×</span>
    </button>
  </div>
</template>

<style lang="scss">
.query-builder-child {
  display: flex;
  flex-flow: row;
  position: relative;
}

.query-builder-child__component {
  flex: 1;
}

.query-builder-child__delete-child {
  position: absolute;
  top: 16px;
  right: 8px;

  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: .5;
  padding: 0;
  background-color: transparent;
  border: 0;
  appearance: none;
}
</style>
