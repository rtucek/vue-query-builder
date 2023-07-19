<script lang="ts" setup>
import {
  defineProps, PropType, watch, provide, computed, defineEmits,
} from 'vue';
import {
  isQueryBuilderConfig, isRuleSet,
} from '@/guards';
import {
  RuleSet, QueryBuilderConfig,
} from '@/types';
import MergeTrap from '@/MergeTrap';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: Object as PropType<RuleSet>,
    required: false,
    default: null,
    validator: (query: any) => query === null || isRuleSet(query),
  },
  config: {
    type: Object as PropType<QueryBuilderConfig>,
    required: true,
    validator: (param: any) => isQueryBuilderConfig(param),
  },
});

provide('getMergeTrap', provideMergeTrap);

let trap: MergeTrap | null = null;

watch(() => props.modelValue, () => {
  // If for any reason the parent who actually owns the state updates the query, we'll remove
  // cleanup any existing traps.
  trap = null;
});

const ruleSet = computed((): RuleSet => {
  if (props.modelValue) {
    return props.modelValue;
  }

  if (props.config.operators.length === 0) {
    return {
      operatorIdentifier: '',
      children: [],
    };
  }

  return {
    operatorIdentifier: props.config.operators[0].identifier,
    children: [],
  };
});

const queryBuiderConfig = computed((): QueryBuilderConfig => {
  if (!props.config.dragging) {
    return props.config;
  }

  // Ensure group parameter is unique... otherwise query builder instances would be able to drag
  // across 2 different instances and this is currently not supported.
  return {
    ...props.config,
    dragging: {
      handle: '.query-builder__draggable-handle',
      ...props.config.dragging,
      group: `${new Date().getTime() * Math.random()}`,
    },
  };
});

function updateQuery(newQuery: RuleSet): void {
  trap = null;
  emit('update:modelValue', { ...newQuery });
}

function provideMergeTrap(): MergeTrap {
  if (trap) {
    return trap;
  }

  trap = new MergeTrap();

  return trap;
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
      v-for="(_, slotName) in $slots"
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
