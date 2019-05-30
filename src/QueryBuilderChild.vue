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
  <component
    :is="component"
    :config="config"
    :query="query"
    v-on="$listeners"
    class="child-container"
  />
</template>

<style lang="scss">
.child-container {
  border: 1px solid black;
  margin: 8px 16px;
}
</style>
