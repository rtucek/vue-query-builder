<script lang="ts">
import {
  Component, Vue, Prop, Inject, Watch,
} from 'vue-property-decorator';
import Draggable, {
  ChangeEvent, Moved, Added, Removed,
} from 'vuedraggable';
import Sortable, { SortableOptions, PutResult } from 'sortablejs';
import {
  QueryBuilderConfig, RuleSet, Rule, OperatorDefinition, RuleDefinition, QueryBuilderGroupSym,
  GroupOperatorSlotProps, GroupCtrlSlotProps, QueryBuilderGroup as QueryBuilderGroupInterface,
} from '@/types';
import { isQueryBuilderConfig, isRule } from '@/guards';
import MergeTrap from '@/MergeTrap';
import QueryBuilderChild from './QueryBuilderChild.vue';

@Component({
  components: {
    Draggable,
    QueryBuilderChild,
  },
})
export default class QueryBuilderGroup extends Vue implements QueryBuilderGroupInterface {
  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  @Prop() readonly query!: RuleSet

  @Prop() readonly depth!: number

  @Inject() readonly getMergeTrap!: () => MergeTrap

  @Watch('query')
  watchQuery() {
    this.pruneChildren();
  }

  @Watch('config.maxDepth')
  watchMaxDepth() {
    this.pruneChildren();
  }

  mounted() {
    this.pruneChildren();
  }

  pruneChildren() {
    if (this.children.length === this.query.children.length) {
      return;
    }

    // We've more groups as children, then allowed by the max policy.
    const children = [...this.children];

    this.$emit(
      'query-update',
        {
          operatorIdentifier: this.selectedOperator,
          children,
        } as RuleSet,
    );
  }

  get selectedOperator(): string {
    return this.query.operatorIdentifier;
  }

  set selectedOperator(operatorIdentifier: string) {
    this.$emit(
      'query-update',
      {
        ...this.query,
        operatorIdentifier,
      } as RuleSet,
    );
  }

  trap: ((position: number, newChild: RuleSet | Rule) => void) | null = null;

  selectedRule: string = '';

  type: Symbol = QueryBuilderGroupSym;

  get children(): Array<RuleSet | Rule> {
    if (this.maxDepthExeeded) {
      // filter children exclusively
      return [...this.query.children].filter(isRule);
    }

    return [...this.query.children];
  }

  updateSort(ev: ChangeEvent<RuleSet | Rule>): void {
    if (ev.moved) {
      this.moveSortedChild(ev.moved);

      return;
    }

    if (ev.added) {
      this.addSortedChild(ev.added);

      return;
    }

    if (ev.removed) {
      this.removeSortedChild(ev.removed);
    }
  }

  // Item has been moved on the same group.
  // We can just us the new children for updating the current state.
  moveSortedChild(move: Moved<RuleSet | Rule>): void {
    const children = [...this.children];

    children.splice(move.newIndex, 0, children.splice(move.oldIndex, 1)[0]);

    this.$emit(
      'query-update',
      {
        operatorIdentifier: this.selectedOperator,
        children,
      } as RuleSet,
    );
  }

  addSortedChild(added: Added<RuleSet | Rule>): void {
    const children = [...this.children];

    children.splice(added.newIndex, 0, added.element);

    this.getMergeTrap().registerSortUpdate({
      component: this,
      ev: {
        operatorIdentifier: this.selectedOperator,
        children,
      } as RuleSet,
      adding: true,
      affectedIdx: added.newIndex,
    });
  }

  removeSortedChild(removed: Removed<RuleSet | Rule>): void {
    const children = [...this.children];

    children.splice(removed.oldIndex, 1);

    this.getMergeTrap().registerSortUpdate({
      component: this,
      ev: {
        operatorIdentifier: this.selectedOperator,
        children,
      } as RuleSet,
      adding: false,
      affectedIdx: removed.oldIndex,
    });
  }

  get operators(): OperatorDefinition[] {
    return this.config.operators;
  }

  get rules(): RuleDefinition[] {
    return this.config.rules;
  }

  get childDepth(): number {
    return this.depth + 1;
  }

  get childDepthClass(): string {
    return `query-builder-group__group-children--depth-${this.childDepth}`;
  }

  get hasMaxDepth(): boolean {
    return typeof this.config.maxDepth === 'number';
  }

  get maxDepthExeeded(): boolean {
    if (!this.hasMaxDepth) {
      return false;
    }

    return this.depth >= (this.config.maxDepth as number);
  }

  get borderColor(): string {
    if (this.config.colors && this.config.colors.length > 0) {
      return this.config.colors[this.depth % this.config.colors.length];
    }

    return '';
  }

  get getBorderStyle(): string {
    if (this.borderColor) {
      return `border-color: ${this.borderColor}`;
    }

    // Ignore borders
    return 'border-left: 0';
  }

  get groupOperatorSlotProps(): GroupOperatorSlotProps {
    return {
      currentOperator: this.selectedOperator,
      operators: this.operators,
      updateCurrentOperator: (newOperator: string) => {
        this.$emit(
          'query-update',
          {
            ...this.query,
            operatorIdentifier: newOperator,
          } as RuleSet,
        );
      },
    };
  }

  get groupControlSlotProps(): GroupCtrlSlotProps {
    return {
      maxDepthExeeded: this.maxDepthExeeded,
      rules: this.rules,
      addRule: (newRule: string) => {
        const currentRule = this.selectedRule;
        this.selectedRule = newRule;
        this.addRule();
        this.selectedRule = currentRule;
      },
      newGroup: (): void => this.newGroup(),
    };
  }

  get dragOptions(): SortableOptions {
    if (!this.config.dragging) {
      // Sensitive default
      return {
        disabled: true,
      };
    }

    if (!this.hasMaxDepth) {
      // Config as-it-is
      return this.config.dragging;
    }

    // As a special case, honor max-group policy.
    return {
      ...this.config.dragging,
      group: {
        name: this.config.dragging.group as string,
        put: (to: Sortable, from: Sortable, dragEl: HTMLElement): PutResult => {
          // eslint-disable-next-line no-underscore-dangle
          const dragged = ((dragEl as any)?.__vue__) as QueryBuilderChild;
          // Calculate maximum depth of dragged element
          const childDepth = this.calculateMaxDepth({ ...dragged.query }, 0);

          // Check if dropping element would violate max-depth policy.
          // If so, don't allow dropping.
          return this.depth + childDepth <= (this.config.maxDepth as number);
        },
      },
    };
  }

  calculateMaxDepth(query: RuleSet | Rule, depthCnt: number): number {
    if (isRule(query)) {
      return depthCnt; // No nesting
    }

    return query.children
      .reduce((cntPerChild, c) => Math.max(
        cntPerChild,
        this.calculateMaxDepth({ ...c }, depthCnt + 1),
      ), depthCnt);
  }

  get showDragHandle(): boolean {
    return !(this.dragOptions.disabled || this.depth === 0);
  }

  addRule(): void {
    const children = [...this.children];

    const selectedRule = this.config.rules.find(rule => rule.identifier === this.selectedRule);
    if (!selectedRule) {
      throw new Error(`Rule identifier "${this.selectedRule}" is invalid.`);
    }

    if (typeof selectedRule.initialValue === 'object' && selectedRule.initialValue !== null) {
      throw new Error(`"initialValue" of "${selectedRule.identifier}" must not be an object - use a factory function!`);
    }

    let value: any = null; // null as sensitive default...
    if (typeof selectedRule.initialValue !== 'undefined') {
      // If a valid has been passed along, use it
      value = selectedRule.initialValue;
    }
    if (typeof value === 'function') {
      // initialValue is a factory function
      value = value();
    }

    children.push({
      identifier: selectedRule.identifier,
      value,
    } as Rule);

    this.$emit(
      'query-update',
      {
        operatorIdentifier: this.selectedOperator,
        children,
      } as RuleSet,
    );

    // Reset selection
    this.selectedRule = '';
  }

  newGroup(): void {
    if (this.maxDepthExeeded) {
      // noop, as max depth reached
      return;
    }

    const children = [...this.children];
    children.push({
      operatorIdentifier: this.config.operators[0].identifier,
      children: [],
    } as RuleSet);

    this.$emit(
      'query-update',
      {
        operatorIdentifier: this.selectedOperator,
        children,
      } as RuleSet,
    );
  }

  updateChild(position: number, newChild: RuleSet | Rule): void {
    if (this.trap) {
      this.trap(position, newChild);

      return;
    }

    const children = [...this.children];
    children.splice(position, 1, newChild); // Replace child

    this.$emit(
      'query-update',
      {
        operatorIdentifier: this.selectedOperator,
        children,
      } as RuleSet,
    );
  }

  deleteChild(idx: number): void {
    const children = [...this.children];
    children.splice(idx, 1);

    this.$emit(
      'query-update',
      {
        operatorIdentifier: this.selectedOperator,
        children,
      } as RuleSet,
    );
  }
}
</script>

<template>
  <div class="query-builder-group">
    <div class="query-builder-group__control">
      <template v-if="$scopedSlots.groupOperator">
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
      <template v-if="$scopedSlots.groupControl">
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
      :value="children"
      @change="updateSort"
      tag="div"
      v-bind="dragOptions"
    >
      <query-builder-child
        v-for="(child, idx) in children"
        :key="idx"
        :config="config"
        :query="child"
        :depth="childDepth"
        @query-update="updateChild(idx, $event)"
        @delete-child="deleteChild(idx)"
        class="query-builder-group__child"
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
      </query-builder-child>
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
  background-color: hsl(0, 0, 95%);
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
