<script lang="ts">
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import {
  QueryBuilderConfig, RuleSet, Rule, OperatorDefinition, RuleDefinition,
} from '@/types';
import { isRuleSet, isRule, isQueryBuilderConfig } from '@/guards';
import QueryBuilderChild from './QueryBuilderChild.vue';

@Component({
  components: {
    QueryBuilderChild,
  },
})
export default class QueryBuilderGroup extends Vue {
  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  @Prop() readonly query!: RuleSet | null

  @Watch('selectedOperator') onSelectedOperatorChange(newOperator: string) {
    this.$emit(
      'query-update',
      {
        ...this.ruleSet,
        ...{ operatorIdentifier: this.selectedOperator },
      },
    );
  }

  selectedOperator: string = this.query
    ? this.query.operatorIdentifier
    : this.config.operators[0].identifier;

  selectedRule: string = ''

  get ruleSet(): RuleSet {
    if (this.query) {
      return this.query;
    }

    return {
      operatorIdentifier: this.selectedOperator,
      children: this.children,
    };
  }

  get children(): Array<RuleSet | Rule> {
    if (this.query === null) {
      return [];
    }

    return this.query.children;
  }

  get operators(): OperatorDefinition[] {
    return this.config.operators;
  }

  get rules(): RuleDefinition[] {
    return this.config.rules;
  }

  addRule(): void {
    console.log('todo addRule...');
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

  addChild(idx: number, child: RuleSet | Rule): void {
    const children = [...this.children];
    children.splice(idx, 1, child);

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
      <div class="query-builder-group__group-selection">
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
          @click="addRule"
          class="query-builder-group__rule-adding-button"
        >
          Add Rule
        </button>
        <button
          @click="newGroup"
          class="query-builder-group__group-adding-button"
        >
          Add Group
        </button>
      </div>
    </div>
    <div class="query-builder-group__group-rules">
      <query-builder-child
        v-for="(child, idx) in children"
        :key="idx"
        :config="config"
        :query="child"
        @query-update="addChild(idx, $event)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.query-builder-group {
  display: flex;
  flex-direction: column;
}
</style>
