import { isQueryBuilderConfig, isRule, isRuleSet } from '@/guards';
import Component from '../components/Component.vue';

describe('Testing component props and guards', () => {
  it('checks isQueryBuilderConfig guard', () => {
    // VALID
    [
      { // Default, minimal example with all valid combinations
        operators: [
          {
            identifier: 'foo',
            name: 'foo',
          },
        ],
        rules: [
          {
            identifier: 'foo',
            name: 'foo',
            component: 'foo',
          },
          {
            identifier: 'bar',
            name: 'bar',
            component: () => {},
          },
          {
            identifier: 'baz',
            name: 'baz',
            component: Component,
          },
        ],
      },

      { // Only checking for valid colors
        operators: [],
        rules: [],
        colors: ['foo', 'bar'],
      },

    ].forEach((t: any) => expect(isQueryBuilderConfig(t)).toBeTruthy());

    // INVALID
    [
      null, // Check nulled parameter

      { // Invalid operator
        operators: [
          {
            identifier: 'foo',
          },
        ],
        rules: [],
      },

      { // Invalid rule
        operators: [
        ],
        rules: [
          {
            identifier: 'foo',
            name: 'foo',
            component: 123,
          },
        ],
      },

      { // Invalid color
        operators: [],
        rules: [],
        colors: [
          123,
        ],
      },
    ].forEach((t: any) => expect(isQueryBuilderConfig(t)).toBeFalsy());
    expect(isQueryBuilderConfig(null)).toBeFalsy();
  });

  it('checks isRule guard', () => {
    // VALID
    [
      {
        identifier: 'foo',
        value: null,
      },
    ].forEach(t => expect(isRule(t)).toBeTruthy());
    expect((t: any) => expect(isRule(t)).toBeTruthy());

    // INVALID
    [
      null,
      {},
      'xyz',
      { value: null },
      { identifier: 'foo' },
      { identifier: 123, value: null },
    ].forEach((t: any) => expect(isRule(t)).toBeFalsy());
  });

  it('checks isRuleSet guard', () => {
    // VALID
    [
      {
        operatorIdentifier: 'bar',
        children: [],
      },

      {
        operatorIdentifier: 'foo',
        children: [
          {
            identifier: 'bar',
            value: null,
          },
          {
            operatorIdentifier: 'baz',
            children: [],
          },
        ],
      },
    ].forEach(t => expect(isRuleSet(t)).toBeTruthy());

    // INVALID
    [
      null,
      {},
      'xyz',
      { operatorIdentifier: 'bar' },
      { children: [] },
      { operatorIdentifier: 'bar', children: null },
      { operatorIdentifier: 'bar', children: {} },
      { identifier: 123, value: null },
      { operatorIdentifier: 'foo', children: [{ identifier: 123, value: null }, { operatorIdentifier: 'baz', children: [] }] },
      { operatorIdentifier: 'foo', children: [{ identifier: 'bar', value: null }, { operatorIdentifier: 'baz', children: 'invalid' }] },
    ].forEach((t: any) => expect(isRuleSet(t)).toBeFalsy());
  });
});
