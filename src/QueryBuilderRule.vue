<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { QueryBuilderConfig, Rule } from '@/types';
import { isQueryBuilderConfig } from '@/guards';
import { Component as VueComponent } from 'vue';

@Component
export default class QueryBuilderRule extends Vue {
  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  @Prop() readonly query!: Rule

  get component(): VueComponent | string {
    const ruleDefinition = this.config
      .rules
      .find(rule => rule.identifier === this.query.identifier);

    if (!ruleDefinition) {
      throw new Error(`Invalid identifier "${this.query.identifier}": no rule definition available.`);
    }

    return ruleDefinition.component;
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
    <component
      :is="component"
      :value="query.value"
      @input="ruleUpdate"
    />
  </div>
</template>

<style lang="scss">
.query-builder-rule {
  // may be overloaded from the consumer via global styling...
}
</style>
