import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import QueryBuilder from '@/QueryBuilder.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderRule from '@/QueryBuilderRule.vue';
import { QueryBuilderConfig } from '@/types';
import App from '../components/App.vue';
import Component from '../components/Component.vue';

interface QueryBuilderTemplate {
  modelValue: any,
  config: QueryBuilderConfig,
}

describe('Test basic functionality of QueryBuilder.vue', () => {
  const getTemplate = (): QueryBuilderTemplate => ({
    modelValue: null,
    config: {
      operators: [
        {
          name: 'AND',
          identifier: 'and',
        },
        {
          name: 'OR',
          identifier: 'or',
        },
      ],
      rules: [
        {
          identifier: 'txt',
          name: 'Text Selection',
          component: markRaw(Component),
          initialValue: '',
        },
        {
          identifier: 'num',
          name: 'Number Selection',
          component: markRaw(Component),
          initialValue: 10,
        },
      ],
    },
  });

  it('it renders with blank configuration', () => {
    const template = getTemplate();

    template.config.operators = [];
    template.config.rules = [];

    // The bare minimum configuration.
    // It entirely useless, but according to the spec, this is a valid configuration and show not
    // fail.
    mount(QueryBuilder, {
      props: template,
    });
  });

  it('selects an operator', () => {
    const app = mount(App, {
      data: getTemplate,
    });
    const wrapper = app.findComponent(QueryBuilder);

    // Assert operators are available
    const options = wrapper.find('.query-builder-group__group-selection select').findAll('option');
    expect(options).toHaveLength(3);
    expect(options.at(0).text()).toBe('Select an operator');
    expect(options.at(0).element.attributes.getNamedItem('disabled')).toBeTruthy();
    expect(options.at(1).text()).toBe('AND');
    expect((options.at(1).element as HTMLOptionElement).value).toBe('and');
    expect(options.at(2).text()).toBe('OR');
    expect((options.at(2).element as HTMLOptionElement).value).toBe('or');

    // Assert update has propagated
    options.at(2).setSelected();
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')).toStrictEqual([[{ operatorIdentifier: 'or', children: [] }]]);
  });

  it('selects a rule', async () => {
    const app = mount(App, {
      data: getTemplate,
    });
    const wrapper = app.findComponent(QueryBuilder);

    // Assert rules are available
    const rules = wrapper.find('.query-builder-group__group-control select').findAll('option');
    expect(rules).toHaveLength(3);
    expect(rules.at(0).text()).toBe('Select a rule');
    expect(rules.at(0).element.attributes.getNamedItem('disabled')).toBeTruthy();
    expect(rules.at(1).text()).toBe('Text Selection');
    expect((rules.at(1).element as HTMLOptionElement).value).toBe('txt');
    expect(rules.at(2).text()).toBe('Number Selection');
    expect((rules.at(2).element as HTMLOptionElement).value).toBe('num');

    const addRuleBtn = wrapper.find('.query-builder-group__rule-adding-button');
    expect((addRuleBtn.element as HTMLButtonElement).disabled).toBeTruthy();

    // Assert update has propagated with default value
    rules.at(2).setSelected();
    await wrapper.vm.$nextTick();
    expect((addRuleBtn.element as HTMLButtonElement).disabled).toBeFalsy();
    addRuleBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')).toStrictEqual([[{ operatorIdentifier: 'and', children: [{ identifier: 'num', value: 10 }] }]]);

    // Manually update value
    await wrapper.vm.$nextTick();
    const num = wrapper.findComponent(Component);
    num.vm.$emit('update:modelValue', 20);
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2);
    expect((wrapper.emitted('update:modelValue') as any)[1]).toStrictEqual([{ operatorIdentifier: 'and', children: [{ identifier: 'num', value: 20 }] }]);
  });

  it('makes use of an initial value\'s factory function', async () => {
    const initialValue = vi.fn(() => 'Hello World');

    const data = getTemplate();
    data.config.rules = [
      {
        identifier: 'txt',
        name: 'Text Selection',
        component: markRaw(Component),
        initialValue,
      },
    ];

    const app = mount(App, {
      data() {
        return { ...data };
      },
    });
    const wrapper = app.findComponent(QueryBuilder);

    // Assert rules are available
    const group = wrapper.findComponent(QueryBuilderGroup);
    const rules = group.find('.query-builder-group__group-control select').findAll('option');
    const addRuleBtn = group.find('.query-builder-group__rule-adding-button');

    // Assert update has propagated with default value
    rules.at(1).setSelected();
    await group.vm.$nextTick();
    addRuleBtn.trigger('click');
    expect(group.emitted('query-update')).toHaveLength(1);
    expect((group.emitted('query-update') as any)[0]).toStrictEqual([{ operatorIdentifier: 'and', children: [{ identifier: 'txt', value: 'Hello World' }] }]);
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect((wrapper.emitted('update:modelValue') as any)[0]).toStrictEqual([{ operatorIdentifier: 'and', children: [{ identifier: 'txt', value: 'Hello World' }] }]);
    expect(initialValue).toHaveBeenCalled();
  });

  it('deletes a rule', () => {
    const data = () => ({
      query: {
        operatorIdentifier: 'and',
        children: [
          {
            identifier: 'txt',
            value: 'A',
          },
          {
            identifier: 'txt',
            value: 'B',
          },
          {
            identifier: 'txt',
            value: 'C',
          },
        ],
      },
      config: {
        operators: [
          {
            name: 'AND',
            identifier: 'and',
          },
          {
            name: 'OR',
            identifier: 'or',
          },
        ],
        rules: [
          {
            identifier: 'txt',
            name: 'Text Selection',
            component: markRaw(Component),
            initialValue: '',
          },
          {
            identifier: 'num',
            name: 'Number Selection',
            component: markRaw(Component),
            initialValue: 10,
          },
        ],
      },
    });

    const app = mount(App, {
      data,
    });

    app.findAllComponents(QueryBuilderRule)
      .filter(({ vm }) => vm.$props.query.identifier === 'txt' && vm.$props.query.value === 'B')
      .at(0)
      .vm
      .$parent
      .$emit('delete-child');

    expect(app.vm.$data.query).toStrictEqual({
      operatorIdentifier: 'and',
      children: [
        {
          identifier: 'txt',
          value: 'A',
        },
        {
          identifier: 'txt',
          value: 'C',
        },
      ],
    });
  });

  it('renders a complex dataset', async () => {
    const data = () => ({
      query: {
        operatorIdentifier: 'or',
        children: [
          {
            operatorIdentifier: 'and',
            children: [
              {
                identifier: 'txt',
                value: 'A',
              },
              {
                identifier: 'txt',
                value: 'B',
              },
              {
                identifier: 'txt',
                value: 'C',
              },
              {
                operatorIdentifier: 'and', // <-- on this group, we're performing our tests
                children: [
                  {
                    identifier: 'txt',
                    value: 'c',
                  },
                  {
                    identifier: 'txt',
                    value: 'd',
                  },
                  {
                    operatorIdentifier: 'and',
                    children: [
                      {
                        identifier: 'txt',
                        value: 'a',
                      },
                      {
                        identifier: 'txt',
                        value: 'b',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            operatorIdentifier: 'and',
            children: [
              {
                identifier: 'txt',
                value: 'X',
              },
              {
                identifier: 'txt',
                value: 'Y',
              },
              {
                identifier: 'txt',
                value: 'Z',
              },
            ],
          },
        ],
      },
      config: {
        operators: [
          {
            name: 'AND',
            identifier: 'and',
          },
          {
            name: 'OR',
            identifier: 'or',
          },
        ],
        rules: [
          {
            identifier: 'txt',
            name: 'Text Selection',
            component: markRaw(Component),
            initialValue: '',
          },
          {
            identifier: 'num',
            name: 'Number Selection',
            component: markRaw(Component),
            initialValue: 10,
          },
        ],
      },
    });

    const app = mount(App, {
      data,
    });
    const wrapper = app.findComponent(QueryBuilder);

    const qbGroup = wrapper.findAllComponents(QueryBuilderGroup)
      .filter(
        ({ vm }) => (vm as (QueryBuilderGroup & { readonly selectedOperator: string })).selectedOperator === 'and'
            && vm.$props.query.children.length === 3
            && vm.$props.query.children[0].identifier === 'txt'
            && vm.$props.query.children[0].value === 'c',
      )
      .at(0);

    // Assert operators are available
    const options = qbGroup.find('.query-builder-group__group-selection select').findAll('option');
    expect(options).toHaveLength(3);
    expect(options.at(0).text()).toBe('Select an operator');
    expect(options.at(0).element.attributes.getNamedItem('disabled')).toBeTruthy();
    expect(options.at(1).text()).toBe('AND');
    expect((options.at(1).element as HTMLOptionElement).value).toBe('and');
    expect(options.at(2).text()).toBe('OR');
    expect((options.at(2).element as HTMLOptionElement).value).toBe('or');

    // Assert update has propagated
    options.at(2).setSelected();
    expect(app.vm.$data.query).toStrictEqual({
      operatorIdentifier: 'or',
      children: [
        {
          operatorIdentifier: 'and',
          children: [
            {
              identifier: 'txt',
              value: 'A',
            },
            {
              identifier: 'txt',
              value: 'B',
            },
            {
              identifier: 'txt',
              value: 'C',
            },
            {
              operatorIdentifier: 'or', // <-- changed
              children: [
                {
                  identifier: 'txt',
                  value: 'c',
                },
                {
                  identifier: 'txt',
                  value: 'd',
                },
                {
                  operatorIdentifier: 'and',
                  children: [
                    {
                      identifier: 'txt',
                      value: 'a',
                    },
                    {
                      identifier: 'txt',
                      value: 'b',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          operatorIdentifier: 'and',
          children: [
            {
              identifier: 'txt',
              value: 'X',
            },
            {
              identifier: 'txt',
              value: 'Y',
            },
            {
              identifier: 'txt',
              value: 'Z',
            },
          ],
        },
      ],
    });

    // Edit a rule
    expect(qbGroup.vm.$props.query.children).toHaveLength(3);
    const rules = qbGroup.findAllComponents(QueryBuilderRule);
    expect(rules).toHaveLength(4);
    const rule = rules
      .filter(({ vm: { $props } }) => $props.query.identifier === 'txt' && $props.query.value === 'd')
      .at(0);

    await wrapper.vm.$nextTick();
    rule.findComponent('.dummy-component').vm.$emit('update:modelValue', 'D');
    expect(app.vm.$data.query).toStrictEqual({
      operatorIdentifier: 'or',
      children: [
        {
          operatorIdentifier: 'and',
          children: [
            {
              identifier: 'txt',
              value: 'A',
            },
            {
              identifier: 'txt',
              value: 'B',
            },
            {
              identifier: 'txt',
              value: 'C',
            },
            {
              operatorIdentifier: 'or',
              children: [
                {
                  identifier: 'txt',
                  value: 'c',
                },
                {
                  identifier: 'txt',
                  value: 'D', // <-- changed
                },
                {
                  operatorIdentifier: 'and',
                  children: [
                    {
                      identifier: 'txt',
                      value: 'a',
                    },
                    {
                      identifier: 'txt',
                      value: 'b',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          operatorIdentifier: 'and',
          children: [
            {
              identifier: 'txt',
              value: 'X',
            },
            {
              identifier: 'txt',
              value: 'Y',
            },
            {
              identifier: 'txt',
              value: 'Z',
            },
          ],
        },
      ],
    });

    // Add another group
    await wrapper.vm.$nextTick();
    qbGroup.find('.query-builder-group__group-adding-button')
      .trigger('click');
    expect(app.vm.$data.query).toStrictEqual({
      operatorIdentifier: 'or',
      children: [
        {
          operatorIdentifier: 'and',
          children: [
            {
              identifier: 'txt',
              value: 'A',
            },
            {
              identifier: 'txt',
              value: 'B',
            },
            {
              identifier: 'txt',
              value: 'C',
            },
            {
              operatorIdentifier: 'or',
              children: [
                {
                  identifier: 'txt',
                  value: 'c',
                },
                {
                  identifier: 'txt',
                  value: 'D',
                },
                {
                  operatorIdentifier: 'and',
                  children: [
                    {
                      identifier: 'txt',
                      value: 'a',
                    },
                    {
                      identifier: 'txt',
                      value: 'b',
                    },
                  ],
                },
                { // <-- Added
                  operatorIdentifier: 'and',
                  children: [],
                },
              ],
            },
          ],
        },
        {
          operatorIdentifier: 'and',
          children: [
            {
              identifier: 'txt',
              value: 'X',
            },
            {
              identifier: 'txt',
              value: 'Y',
            },
            {
              identifier: 'txt',
              value: 'Z',
            },
          ],
        },
      ],
    });

    // Remove a rule
    await wrapper.vm.$nextTick();
    rule.vm.$parent.$emit('delete-child');
    expect(app.vm.$data.query).toStrictEqual({
      operatorIdentifier: 'or',
      children: [
        {
          operatorIdentifier: 'and',
          children: [
            {
              identifier: 'txt',
              value: 'A',
            },
            {
              identifier: 'txt',
              value: 'B',
            },
            {
              identifier: 'txt',
              value: 'C',
            },
            {
              operatorIdentifier: 'or',
              children: [
                {
                  identifier: 'txt',
                  value: 'c',
                },
                // Delete child here
                {
                  operatorIdentifier: 'and',
                  children: [
                    {
                      identifier: 'txt',
                      value: 'a',
                    },
                    {
                      identifier: 'txt',
                      value: 'b',
                    },
                  ],
                },
                { // <-- Added
                  operatorIdentifier: 'and',
                  children: [],
                },
              ],
            },
          ],
        },
        {
          operatorIdentifier: 'and',
          children: [
            {
              identifier: 'txt',
              value: 'X',
            },
            {
              identifier: 'txt',
              value: 'Y',
            },
            {
              identifier: 'txt',
              value: 'Z',
            },
          ],
        },
      ],
    });
  });
});
