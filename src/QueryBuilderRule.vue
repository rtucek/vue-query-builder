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

  get showDragHandle(): boolean {
    if (this.config.dragging) {
      return !this.config.dragging.disabled;
    }

    return false;
  }
}
</script>

<template>
  <div class="query-builder-rule" >
    <img
      v-if="showDragHandle"
      class="query-builder__draggable-handle"
      src="./grip-vertical-solid.svg"
      alt="Drag element to target"
    >
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

<style lang="scss" scoped>
.query-builder-rule {
  position: relative;
  background-color: hsl(0, 0, 95%);
  padding: 16px;
  padding-right: 32px;
  display: flex;
  flex-direction: row;

  .query-builder__draggable-handle {
    display: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 4px;
    width: 8px;
    cursor: move;
  }

  &:hover .query-builder__draggable-handle {
    display: block;
  }
}

.query-builder-rule__name {
  margin-right: 16px;
  font-weight: bold;
}

.query-builder-rule__component-container {
  flex: 1;
}
</style>
