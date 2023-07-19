<script lang="ts" setup>
import {
  defineProps, PropType, computed, Component as VueComponent,
} from 'vue';
import {
  RuleSet, Rule, QueryBuilderConfig, RuleDefinition,
} from '@/types';
import { isRule as isRuleParam, isRuleSet as isRuleSetParam, isQueryBuilderConfig } from '@/guards';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderRule from '@/QueryBuilderRule.vue';

defineEmits(['query-update', 'delete-child']);

const props = defineProps({
  query: {
    type: Object as PropType<RuleSet | Rule>,
    required: true,
    validator: (query: any) => isRuleParam(query) || isRuleSetParam(query),
  },
  config: {
    type: Object as PropType<QueryBuilderConfig>,
    required: true,
    validator: (param: any) => isQueryBuilderConfig(param),
  },
  depth: Number,
});

const isRule = computed<boolean>(() => isRuleParam(props.query));

const isRuleSet = computed<boolean>(() => isRuleSetParam(props.query));

const ruleDefinition = computed<RuleDefinition | null>(() => {
  if (!isRule.value) {
    return null;
  }

  const ruleDefinitionResult = props.config
    .rules
    .find(definition => definition.identifier === (props.query as Rule).identifier);

  return ruleDefinitionResult || null;
});

const component = computed<VueComponent>(() => {
  if (isRule.value && ruleDefinition.value) {
    return QueryBuilderRule;
  }

  if (isRuleSet.value) {
    return QueryBuilderGroup;
  }

  throw new Error('No component definition available.');
});

const definition = computed<RuleDefinition | null>(() => {
  if (isRule.value && ruleDefinition.value) {
    return ruleDefinition.value;
  }

  if (isRuleSet.value) {
    return null;
  }

  throw new Error('No component definition available.');
});

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
        v-for="(_, slotName) in $slots"
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
      @click.stop.prevent="$emit('delete-child')"
    >
      <span aria-hidden="true">×</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
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
  cursor: pointer;
}
</style>
