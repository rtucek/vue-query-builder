import { Component } from 'vue';

export interface Rule {
  identifier: string,
  value: any,
}

export interface RuleSet {
  operatorIdentifier: string,
  children: Array<RuleSet | Rule>,
}

export interface Operator {
  identifier: string,
  value: string,
}

export interface OperatorDefinition {
  identifier: string,
  name: string,
}

export interface RuleDefinition {
  identifier: string,
  name: string,
  component: Component | string,
  initialValue: any,
}

export interface QueryBuilderConfig {
  operators: OperatorDefinition[],
  rules: RuleDefinition[],
}
