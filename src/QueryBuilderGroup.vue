<script lang="ts" setup>
import {
  defineProps, PropType, computed, watch, inject, onMounted, ref, WritableComputedRef, ComponentPublicInstance
} from 'vue';
import Draggable, {
  ChangeEvent, Moved, Added, Removed,
} from 'vuedraggable/src/vuedraggable';
import Sortable, { SortableOptions, PutResult } from 'sortablejs';
import {
  QueryBuilderConfig, RuleSet, Rule, OperatorDefinition, RuleDefinition, QueryBuilderGroupSym,
  GroupOperatorSlotProps, GroupCtrlSlotProps, QueryBuilderGroup as QueryBuilderGroupInterface,
} from '@/types';
import { isQueryBuilderConfig, isRule } from '@/guards';
import MergeTrap from '@/MergeTrap';
import QueryBuilderChild from '@/QueryBuilderChild.vue';

const emit = defineEmits(['query-update']);

const props = defineProps({
  config: {
    type: Object as PropType<QueryBuilderConfig>,
    required: true,
    validator: (param: any) => isQueryBuilderConfig(param),
  },
  query: {
    type: Object as PropType<RuleSet>,
  },
  depth: {
    type: Number,
  },
});

const getMergeTrap: () => MergeTrap = inject('getMergeTrap');

watch(() => props.query, (n: any) => pruneChildren());

watch(() => props.config.maxDepth, (n: any) => pruneChildren());

onMounted(() => pruneChildren());

function pruneChildren() {
  if (children.value.length === props.query.children.length) {
    return;
  }

  // We've more groups as children, then allowed by the max policy.
  const childrenUpdate = [...children.value];

  emit(
    'query-update',
      {
        operatorIdentifier: selectedOperator.value,
        children: childrenUpdate,
      } as RuleSet,
  );
}

const selectedOperator: WritableComputedRef<string> = computed<string>({
  get: (): string => props.query.operatorIdentifier,
  set: (operatorIdentifier: string) => {
    emit(
      'query-update',
      {
        ...props.query,
        operatorIdentifier,
      } as RuleSet,
    );
  },
});

const trap = ref<((position: number, newChild: RuleSet | Rule) => void) | null>(null);

const selectedRule = ref<string>('');

const type: Symbol = QueryBuilderGroupSym;

const children = computed<Array<RuleSet | Rule>>(() => {
  if (maxDepthExeeded.value) {
    // filter children exclusively
    return [...props.query.children].filter(isRule);
  }

  return [...props.query.children];
});
const childProxies = computed<Array<any>>(() => children.value.map((item, index) => ({
  __item: item,
  __id: index,
})));

function updateSort(ev: ChangeEvent<RuleSet | Rule>): void {
  if (ev.moved) {
    moveSortedChild(ev.moved);

    return;
  }

  if (ev.added) {
    addSortedChild(ev.added);

    return;
  }

  if (ev.removed) {
    removeSortedChild(ev.removed);
  }
}

// Item has been moved on the same group.
// We can just us the new children for updating the current state.
function moveSortedChild(move: Moved<RuleSet | Rule>): void {
  const childrenUpdate = [...children.value];

  childrenUpdate.splice(move.newIndex, 0, childrenUpdate.splice(move.oldIndex, 1)[0]);

  emit(
    'query-update',
    {
      operatorIdentifier: selectedOperator.value,
      children: childrenUpdate,
    } as RuleSet,
  );
}

// NB: when accessing "this" via $parent, we gain access to the "expose proxy",
// which is safe for comparing in the merge trap.
const draggableComponent = ref<ComponentPublicInstance | null>(null);

function addSortedChild(added: Added<RuleSet | Rule>): void {
  const childrenUpdate = [...children.value];

  childrenUpdate.splice(added.newIndex, 0, added.element.__item);

  getMergeTrap().registerSortUpdate({
    component: draggableComponent.value?.$parent,
    ev: {
      operatorIdentifier: selectedOperator.value,
      children: childrenUpdate,
    } as RuleSet,
    adding: true,
    affectedIdx: added.newIndex,
  });
}

function removeSortedChild(removed: Removed<RuleSet | Rule>): void {
  const childrenUpdate = [...children.value];

  childrenUpdate.splice(removed.oldIndex, 1);

  getMergeTrap().registerSortUpdate({
    component: draggableComponent.value?.$parent,
    ev: {
      operatorIdentifier: selectedOperator.value,
      children: childrenUpdate,
    } as RuleSet,
    adding: false,
    affectedIdx: removed.oldIndex,
  });
}

const operators = computed<OperatorDefinition[] >(() => props.config.operators);

const rules = computed<RuleDefinition[]>(() => props.config.rules);

const childDepth = computed<number>(() => props.depth + 1);

const childDepthClass = computed<string>(() => `query-builder-group__group-children--depth-${childDepth.value}`);

const hasMaxDepth = computed<boolean>(() => typeof props.config.maxDepth === 'number');

const maxDepthExeeded = computed<boolean>(() => {
  if (!hasMaxDepth.value) {
    return false;
  }

  return props.depth >= (props.config.maxDepth as number);
});

const borderColor = computed<string>(() => {
  if (props.config.colors && props.config.colors.length > 0) {
    return props.config.colors[props.depth % props.config.colors.length];
  }

  return '';
});

const getBorderStyle = computed<string>(() => {
  if (borderColor.value) {
    return `border-color: ${borderColor.value}`;
  }

  // Ignore borders
  return 'border-left: 0';
});

const groupOperatorSlotProps = computed<GroupOperatorSlotProps>(() => (
  {
    currentOperator: selectedOperator.value,
    operators: operators.value,
    updateCurrentOperator: (newOperator: string) => {
      emit(
        'query-update',
        {
          ...props.query,
          operatorIdentifier: newOperator,
        } as RuleSet,
      );
    },
  }
));

const groupControlSlotProps = computed<GroupCtrlSlotProps>(() => (
  {
    maxDepthExeeded: maxDepthExeeded.value,
    rules: rules.value,
    addRule: (newRule: string) => {
      const currentRule = selectedRule.value;
      selectedRule.value = newRule;
      addRule();
      selectedRule.value = currentRule;
    },
    newGroup: (): void => newGroup(),
  }
));

const dragOptions = computed<SortableOptions>(() => {
  if (!props.config.dragging) {
    // Sensitive default
    return {
      disabled: true,
    };
  }

  if (!hasMaxDepth.value) {
    // Config as-it-is
    return props.config.dragging;
  }

  // As a special case, honor max-group policy.
  return {
    ...props.config.dragging,
    group: {
      name: props.config.dragging.group as string,
      put: (to: Sortable, from: Sortable, dragEl: HTMLElement): PutResult => {
        // eslint-disable-next-line no-underscore-dangle
        const dragged = ((dragEl as any)?.__vue__);
        // Calculate maximum depth of dragged element
        const childDepthCurrent = calculateMaxDepth({ ...dragged.query }, 0);

        // Check if dropping element would violate max-depth policy.
        // If so, don't allow dropping.
        return props.depth + childDepthCurrent <= (props.config.maxDepth as number);
      },
    },
  };
});

function calculateMaxDepth(query: RuleSet | Rule, depthCnt: number): number {
  if (isRule(query)) {
    return depthCnt; // No nesting
  }

  return (query as RuleSet).children
    .reduce((cntPerChild, c) => Math.max(
      cntPerChild,
      calculateMaxDepth({ ...c }, depthCnt + 1),
    ), depthCnt);
}

const showDragHandle = computed<boolean>(() => !(dragOptions.value.disabled || props.depth === 0));

function addRule(): void {
  const childrenUpdate = [...children.value];

  const selectedRuleFound = props.config.rules.find(rule => rule.identifier === selectedRule.value);
  if (!selectedRuleFound) {
    throw new Error(`Rule identifier "${selectedRule.value}" is invalid.`);
  }

  if (typeof selectedRuleFound.initialValue === 'object' && selectedRuleFound.initialValue !== null) {
    throw new Error(`"initialValue" of "${selectedRuleFound.identifier}" must not be an object - use a factory function!`);
  }

  let value: any = null; // null as sensitive default...
  if (typeof selectedRuleFound.initialValue !== 'undefined') {
    // If a valid has been passed along, use it
    value = selectedRuleFound.initialValue;
  }
  if (typeof value === 'function') {
    // initialValue is a factory function
    value = value();
  }

  childrenUpdate.push({
    identifier: selectedRuleFound.identifier,
    value,
  } as Rule);

  emit(
    'query-update',
    {
      operatorIdentifier: selectedOperator.value,
      children: childrenUpdate,
    } as RuleSet,
  );

  // Reset selection
  selectedRule.value = '';
}

function newGroup(): void {
  if (maxDepthExeeded.value) {
    // noop, as max depth reached
    return;
  }

  const childrenUpdate = [...children.value];
  childrenUpdate.push({
    operatorIdentifier: props.config.operators[0].identifier,
    children: [],
  } as RuleSet);

  emit(
    'query-update',
    {
      operatorIdentifier: selectedOperator.value,
      children: childrenUpdate,
    } as RuleSet,
  );
}

function updateChild(position: number, newChild: RuleSet | Rule): void {
  if (trap.value) {
    trap.value(position, newChild);

    return;
  }

  const childrenUpdate = [...children.value];
  childrenUpdate.splice(position, 1, newChild); // Replace child

  emit(
    'query-update',
    {
      operatorIdentifier: selectedOperator.value,
      children: childrenUpdate,
    } as RuleSet,
  );
}

function deleteChild(idx: number): void {
  const childrenUpdate = [...children.value];
  childrenUpdate.splice(idx, 1);

  emit(
    'query-update',
    {
      operatorIdentifier: selectedOperator.value,
      children: childrenUpdate,
    } as RuleSet,
  );
}

defineExpose({
  type,
  children,
  depth: computed(() => props.depth),
  selectedOperator,
  trap,
});

</script>

<template>
  <div class="query-builder-group">
    <div class="query-builder-group__control">
      <template v-if="$slots.groupOperator">
        <div class="query-builder-group__group-selection-slot">
          <img
            v-if="showDragHandle"
            class="query-builder__draggable-handle"
            src="./grip-vertical-solid.svg"
            alt="Drag element to target"
          >
          <slot
            name="groupOperator"
            v-bind="groupOperatorSlotProps"
          />
        </div>
      </template>
      <template v-else>
        <div class="query-builder-group__group-selection">
          <img
            v-if="showDragHandle"
            class="query-builder__draggable-handle"
            src="./grip-vertical-solid.svg"
            alt="Drag element to target"
          >
          <span class="query-builder-group__group-operator">Operator</span>
          <select v-model="selectedOperator">
            <option disabled value="">Select an operator</option>
            <option
              v-for="operator in operators"
              :key="operator.identifier"
              :value="operator.identifier"
              v-text="operator.name"
            />
          </select>
        </div>
      </template>
      <template v-if="$slots.groupControl">
        <slot
          name="groupControl"
          v-bind="groupControlSlotProps"
        />
      </template>
      <template v-else>
        <div class="query-builder-group__group-control">
          <select v-model="selectedRule">
            <option disabled value="">Select a rule</option>
            <option
              v-for="rule in rules"
              :key="rule.identifier"
              :value="rule.identifier"
              v-text="rule.name"
            />
          </select>
          <button
            :disabled="selectedRule === ''"
            @click="addRule"
            class="query-builder-group__rule-adding-button"
          >
            Add Rule
          </button>
          <template v-if="! maxDepthExeeded">
            <div class="query-builder-group__spacer"/>
            <button
              @click="newGroup"
              class="query-builder-group__group-adding-button"
            >
              Add Group
            </button>
          </template>
        </div>
      </template>
    </div>
    <draggable
      class="query-builder-group__group-children"
      :class="childDepthClass"
      :style="getBorderStyle"
      :modelValue="childProxies"
      @change="updateSort"
      item-key="__id"
      tag="div"
      v-bind="dragOptions"
      ref="draggableComponent"
    >
      <template #item="{element: child, index: idx}">
        <query-builder-child
          :key="idx"
          :config="config"
          :query="child.__item"
          :depth="childDepth"
          @query-update="updateChild(idx, $event)"
          @delete-child="deleteChild(idx)"
          class="query-builder-group__child"
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
        </query-builder-child>
      </template>

    </draggable>
  </div>
</template>

<style lang="scss" scoped>
.query-builder-group {
  display: flex;
  flex-direction: column;
}

.query-builder-group__group-selection {
  padding: 16px;
  background-color: hsl(0, 0%, 95%);
}

.query-builder-group__group-selection,
.query-builder-group__group-selection-slot {
  position: relative;

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

.query-builder-group__group-operator {
  margin-right: 16px;
  font-weight: bold;
}

.query-builder-group__group-control {
  padding: 16px;
  display: flex;
  flex-direction: row;
}

.query-builder-group__rule-adding-button {
  margin-left: 8px;
}

.query-builder-group__spacer {
  width: 0;
  margin: auto 12px;
  border-left: 1px solid hsl(0, 0%, 75%);
}

.query-builder-group__group-children {
  margin: 8px 0 8px 16px;
  margin-bottom: 0;
  border-left-width: 2px;
  border-left-style: solid;
}

.query-builder-group__child:not(:last-child) {
  margin-bottom: 12px;
}
</style>
