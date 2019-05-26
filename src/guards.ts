import {
  Rule, RuleSet, Operator, QueryBuilderConfig, OperatorDefinition, RuleDefinition,
} from '@/types';

export function isRule(param: any): param is Rule {
  if (typeof param !== 'object') {
    return false;
  }

  if (typeof param.identifier !== 'string') {
    return false;
  }

  const { hasOwnProperty } = Object.prototype;

  return hasOwnProperty.call(param, 'value');
}

export function isRuleSet(param: any): param is RuleSet {
  if (typeof param !== 'object') {
    return false;
  }

  if (typeof param.operatorIdentifier !== 'string') {
    return false;
  }

  return Array.isArray(param.children)
    && param.children.every((child: any) => isRule(child) || isRuleSet(child));
}

export function isOperator(param: any): param is Operator {
  if (typeof param !== 'object') {
    return false;
  }

  if (typeof param.identifier !== 'string') {
    return false;
  }

  const { hasOwnProperty } = Object.prototype;

  return hasOwnProperty.call(param, 'value');
}

export function isOperatorDefinition(param: any): param is OperatorDefinition {
  if (typeof param !== 'object') {
    return false;
  }

  if (typeof param.identifier !== 'string') {
    return false;
  }

  return typeof param.name === 'string';
}

export function isRuleDefinition(param: any): param is RuleDefinition {
  if (typeof param !== 'object') {
    return false;
  }

  if (typeof param.identifier !== 'string') {
    return false;
  }

  if (typeof param.name !== 'string') {
    return false;
  }

  if (typeof param.component !== 'string') {
    return false;
  }

  const { hasOwnProperty } = Object.prototype;

  return hasOwnProperty.call(param, 'initialValue');
}

export function isQueryBuilderConfig(param: any): param is QueryBuilderConfig {
  if (typeof param !== 'object') {
    return false;
  }

  return Array.isArray(param.operators)
    && param.operators.every((operator: any) => isOperatorDefinition(operator))
    && Array.isArray(param.rules)
    && param.rules.every((rule: any) => isRuleDefinition(rule));
}
