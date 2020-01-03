import { mount, Wrapper, WrapperArray } from '@vue/test-utils';
import Input from '../components/Input.vue';
import Number from '../components/Number.vue';
import QueryBuilder from '@/QueryBuilder.vue';
import App from '../components/App.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderRule from '@/QueryBuilderRule.vue';
import { Rule } from '@/types';

describe('Test basic functionality of QueryBuilder.vue', () => {
  const getTemplate = () => ({
    value: null,
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
          component: Input,
          initialValue: '',
        },
        {
          identifier: 'num',
          name: 'Number Selection',
          component: Number,
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
      propsData: template,
    });
  });

  it('selects an operator', () => {
    const app = mount(App, {
      data: getTemplate,
    });
    const wrapper = app.find(QueryBuilder);

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
    expect(wrapper.emittedByOrder()).toHaveLength(1);
    expect(wrapper.emittedByOrder()[0]).toStrictEqual({
      name: 'input',
      args: [{ operatorIdentifier: 'or', children: [] }],
    });
  });

  it('selects a rule', () => {
    const app = mount(App, {
      data: getTemplate,
    });
    const wrapper = app.find(QueryBuilder);

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
    expect((addRuleBtn.element as HTMLButtonElement).disabled).toBeFalsy();
    addRuleBtn.trigger('click');
    expect(wrapper.emittedByOrder()).toHaveLength(1);
    expect(wrapper.emittedByOrder()[0]).toStrictEqual({
      name: 'input',
      args: [{ operatorIdentifier: 'and', children: [{ identifier: 'num', value: 10 }] }],
    });


    // Manually update value
    const num = wrapper.find(Number);
    num.setValue('20');
    expect(wrapper.emittedByOrder()).toHaveLength(2);
    expect(wrapper.emittedByOrder()[1]).toStrictEqual({
      name: 'input',
      args: [{ operatorIdentifier: 'and', children: [{ identifier: 'num', value: 20 }] }],
    });
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
            component: Input,
            initialValue: '',
          },
          {
            identifier: 'num',
            name: 'Number Selection',
            component: Number,
            initialValue: 10,
          },
        ],
      },
    });

    const app = mount(App, {
      data,
    });

    app.findAll(QueryBuilderRule)
      .filter((qbr: Wrapper<Vue>) => {
        const vm = qbr.vm as QueryBuilderRule;

        return vm.$props.query.identifier === 'txt'
          && vm.$props.query.value === 'B';
      })
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

  it('renders a complex dataset', () => {
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
            component: Input,
            initialValue: '',
          },
          {
            identifier: 'num',
            name: 'Number Selection',
            component: Number,
            initialValue: 10,
          },
        ],
      },
    });

    const app = mount(App, {
      data,
    });
    const wrapper = app.find(QueryBuilder) as Wrapper<QueryBuilder>;

    const qbGroup = wrapper.findAll(QueryBuilderGroup)
      .filter((qbg: Wrapper<QueryBuilderGroup>) => {
        const vm = qbg.vm as (QueryBuilderGroup & { selectedOperator: string });

        return vm.selectedOperator === 'and'
            && vm.$props.query.children.length === 3
            && vm.$props.query.children[0].identifier === 'txt'
            && vm.$props.query.children[0].value === 'c';
      })
      .at(0) as Wrapper<QueryBuilderGroup>;

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
    const rules = qbGroup.findAll(QueryBuilderRule) as WrapperArray<QueryBuilderRule>;
    expect(rules).toHaveLength(4);
    const rule = rules.filter((qbr: Wrapper<Vue>) => {
      const query = qbr.vm.$props.query as Rule;

      return query.identifier === 'txt'
            && query.value === 'd';
    })
      .at(0) as Wrapper<QueryBuilderRule>;

    rule.find('input').setValue('D');
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
