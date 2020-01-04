<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Component as VueComponent } from 'vue';
import {
  QueryBuilderConfig, Rule, RuleDefinition, RuleSlotProps,
} from '@/types';
import { isQueryBuilderConfig } from '@/guards';

@Component
export default class QueryBuilderRule extends Vue {
  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  @Prop() readonly query!: Rule

  get definition(): RuleDefinition {
    const ruleDefinition = this.config
      .rules
      .find(rule => rule.identifier === this.query.identifier);

    if (ruleDefinition) {
      return ruleDefinition;
    }

    throw new Error(`Invalid identifier "${this.query.identifier}": no rule definition available.`);
  }

  get component(): VueComponent | string {
    return this.definition.component;
  }

  get ruleData(): any {
    return this.query.value;
  }

  set ruleData(update: any) {
    this.ruleUpdate(update);
  }

  get ruleSlotProps(): RuleSlotProps {
    return {
      ruleComponent: this.component,
      ruleData: this.query.value,
      updateRuleData: (ruleData: any) => this.ruleUpdate(ruleData),
    };
  }

  ruleUpdate(update: any) {
    this.$emit(
      'query-update',
      {
        identifier: this.query.identifier,
        value: update,
      } as Rule,
    );
  }
}
</script>

<template>
  <div class="query-builder-rule" >
    <template v-if="$scopedSlots.rule">
      <slot
          name="rule"
          v-bind="ruleSlotProps"
      />
    </template>
    <template v-else>
      <span class="query-builder-rule__name" v-text="definition.name" />
      <div class="query-builder-rule__component-container">
        <component
          :is="component"
          v-model="ruleData"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.query-builder-rule {
  background-color: hsl(0, 0, 95%);
  padding: 16px;
  padding-right: 32px;
  display: flex;
  flex-direction: row;
}

.query-builder-rule__name {
  margin-right: 16px;
  font-weight: bold;
}

.query-builder-rule__component-container {
  flex: 1;
}
</style>
