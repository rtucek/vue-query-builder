<script lang="ts">
import {
  Component, Vue, Prop, Inject,
} from 'vue-property-decorator';
import Draggable, {
  MoveEvent, Moved, Added, Removed,
} from 'vuedraggable';
import { SortableOptions } from 'sortablejs';
import {
  QueryBuilderConfig, RuleSet, Rule, OperatorDefinition, RuleDefinition,
  GroupOperatorSlotProps, GroupCtrlSlotProps, QueryBuilderGroup as QueryBuilderGroupInterface,
} from '@/types';
import { isRuleSet, isRule, isQueryBuilderConfig } from '@/guards';
import QueryBuilderChild from './QueryBuilderChild.vue';
import MergeTrap from '@/MergeTrap';

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

  selectedRule: string = ''

  get children(): Array<RuleSet | Rule> {
    return [...this.query.children];
  }

  updateSort(ev: MoveEvent<RuleSet | Rule>): void {
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
    if (this.config.dragging) {
      return this.config.dragging;
    }

    return {
      disabled: true,
    };
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

    let initialValue: any = null; // null as sensitive default...
    if (typeof selectedRule.initialValue === 'function') {
      // Use factory function
      initialValue = selectedRule.initialValue();
    }

    if (typeof selectedRule.initialValue !== 'undefined') {
      // If it exists use the primitive value
      ({ initialValue } = selectedRule);
    }

    children.push({
      identifier: selectedRule.identifier,
      value: initialValue,
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
        <slot
          name="groupOperator"
          v-bind="groupOperatorSlotProps"
        />
      </template>
      <template v-else>
        <div class="query-builder-group__group-selection">
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
          <div class="query-builder-group__spacer"/>
          <button
            @click="newGroup"
            class="query-builder-group__group-adding-button"
          >
            Add Group
          </button>
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

// .query-builder-group__control {
// }

.query-builder-group__group-selection {
  padding: 16px;
  background-color: hsl(0, 0, 95%);
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
  margin-left: 12px;
  margin-right: 12px;
  border-left: 1px solid hsl(0, 0%, 75%);
}

.query-builder-group__group-children {
  margin: 8px 16px;
  margin-bottom: 0;
  border-left-width: 2px;
  border-left-style: solid;
}

.query-builder-group__child:not(:last-child) {
  margin-bottom: 12px;
}
</style>
