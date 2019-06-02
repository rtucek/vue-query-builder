<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { QueryBuilderConfig, Rule, RuleDefinition } from '@/types';
import { isQueryBuilderConfig } from '@/guards';
import { Component as VueComponent } from 'vue';

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

  ruleUpdate(update: any) {
    this.$emit(
      'query-update',
      {
        identifier: this.query.identifier,
        value: update,
      },
    );
  }
}
</script>

<template>
  <div class="query-builder-rule">
    <span class="query-builder-rule__name" v-text="definition.name" />
    <div class="query-builder-rule__component-container">
      <component
        :is="component"
        :value="query.value"
        @input="ruleUpdate"
      />
    </div>
  </div>
</template>

<style lang="scss">
.query-builder-rule {
  padding: 16px;
  background-color: hsl(0, 0, 95%);
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
