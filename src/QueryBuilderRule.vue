<script lang="ts" setup>
import {
  defineProps, PropType, computed, Component as VueComponent, WritableComputedRef,
} from 'vue';
import {
  QueryBuilderConfig, Rule, RuleDefinition, RuleSlotProps,
} from '@/types';
import { isQueryBuilderConfig } from '@/guards';

const emit = defineEmits(['query-update']);

const props = defineProps({
  config: {
    type: Object as PropType<QueryBuilderConfig>,
    required: true,
    validator: (param: any) => isQueryBuilderConfig(param),
  },
  query: {
    type: Object as PropType<Rule>,
  },
});

const definition = computed<RuleDefinition>(() => {
  const ruleDefinition = props.config
    .rules
    .find(rule => rule.identifier === props.query.identifier);

  if (ruleDefinition) {
    return ruleDefinition;
  }

  throw new Error(`Invalid identifier "${props.query.identifier}": no rule definition available.`);
});

const component = computed<VueComponent | string>(() => definition.value.component);

const ruleData: WritableComputedRef<any> = computed<any>({
  get: () => props.query.value,
  set: (update: any) => {
    ruleUpdate(update);
  },
});

const ruleSlotProps = computed<RuleSlotProps>(() => (
  {
    ruleComponent: component.value,
    ruleData: props.query.value,
    ruleIdentifier: props.query.identifier,
    updateRuleData: (ruleDataParam: any) => ruleUpdate(ruleDataParam),
  }
));

function ruleUpdate(update: any) {
  emit(
    'query-update',
    {
      identifier: props.query.identifier,
      value: update,
    } as Rule,
  );
}

const showDragHandle = computed<boolean>(() => {
  if (props.config.dragging) {
    return !props.config.dragging.disabled;
  }

  return false;
});

</script>

<template>
  <div class="query-builder-rule" >
    <img
      v-if="showDragHandle"
      class="query-builder__draggable-handle"
      src="./grip-vertical-solid.svg"
      alt="Drag element to target"
    >
    <template v-if="$slots.rule">
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
  background-color: hsl(0, 0%, 95%);
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
