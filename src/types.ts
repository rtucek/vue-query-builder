import { Component as VueComponent, ComponentPublicInstance } from 'vue';
import { SortableOptions } from 'sortablejs';

export interface Rule {
  identifier: string,
  value: any,
}

export interface RuleSet {
  operatorIdentifier: string,
  children: Array<RuleSet | Rule>,
}

export interface OperatorDefinition {
  identifier: string,
  name: string,
}

export interface RuleDefinition {
  identifier: string,
  name: string,
  component: VueComponent | string,
  initialValue?: any,
}

export interface QueryBuilderConfig {
  operators: OperatorDefinition[],
  rules: RuleDefinition[],
  maxDepth?: number,
  colors?: string[],
  dragging?: SortableOptions,
}

export interface GroupOperatorSlotProps {
  currentOperator: string,
  operators: OperatorDefinition[],
  updateCurrentOperator: (newOperator: string) => void,
}

export interface GroupCtrlSlotProps {
  maxDepthExeeded: boolean,
  rules: RuleDefinition[],
  addRule: (newRule: string) => void,
  newGroup: () => void,
}

export interface RuleSlotProps {
  ruleComponent: VueComponent | string,
  ruleData: any,
  ruleIdentifier: string,
  updateRuleData: (newData: any) => void,
}

export const QueryBuilderGroupSym = Symbol('QueryBuilderGroup');

export interface QueryBuilderGroup extends ComponentPublicInstance {
  selectedOperator: string,
  depth: number,
  trap: ((position: number, newChild: RuleSet | Rule) => void) | null,
  children: Array<RuleSet | Rule>,
  type: Symbol,
}

export interface ComponentRegistration {
  component: QueryBuilderGroup,
  ev: RuleSet,
  adding: boolean,
  affectedIdx: number,
}

export interface MergeTrap {
  registerSortUpdate(update: ComponentRegistration): void,
}
