import { Component } from 'vue';
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
  component: Component | string,
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
  ruleComponent: Component | string,
  ruleData: any,
  ruleIdentifier: string,
  updateRuleData: (newData: any) => void,
}
