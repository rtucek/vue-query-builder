import { mount } from '@vue/test-utils';
import { RuleSet, Rule, QueryBuilderConfig } from '@/types';
import QueryBuilder from '@/QueryBuilder.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderRule from '@/QueryBuilderRule.vue';
import Component from '../components/Component.vue';

describe('Testing slot related features', () => {
  const propsData: { value: RuleSet, config: QueryBuilderConfig } = {
    value: {
      operatorIdentifier: 'OR',
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
          name: 'and',
          identifier: 'AND',
        },
        {
          name: 'or',
          identifier: 'OR',
        },
      ],
      rules: [
        {
          identifier: 'txt',
          name: 'Text Selection',
          component: Component,
          initialValue: 'foo',
        },
        {
          identifier: 'num',
          name: 'Number Selection',
          component: Component,
          initialValue: 10,
        },
      ],
    },
  };

  it('tests the `groupOperator` slot', () => {
    const app = mount(QueryBuilder, {
      propsData,
      scopedSlots: {
        groupOperator: `
          <div
            slot-scope="props"
            class="slot-wrapper"
          >
            SLOT Operator
            <select
              class="slot-select"
              :value="props.currentOperator"
              @change="props.updateCurrentOperator($event.target.value)"
            >
              <option
                v-for="operator in props.operators"
                :key="operator.identifier"
                :value="operator.identifier"
                v-text="operator.name"
              />
            </select>
          </div>
        `,
      },
    });

    const group = app.findComponent(QueryBuilderGroup);
    const slot = group.find('.slot-wrapper');

    // Check if current operator is selected
    const select = slot.find('.slot-select');
    expect((select.element as HTMLSelectElement).value).toBe('OR');

    // Check if operators are properly rendered
    const options = select.findAll('option');
    expect(options).toHaveLength(2);
    expect((options.at(0).element as HTMLOptionElement).value).toBe('AND');
    expect((options.at(0).element as HTMLOptionElement).text).toBe('and');
    expect((options.at(1).element as HTMLOptionElement).value).toBe('OR');
    expect((options.at(1).element as HTMLOptionElement).text).toBe('or');

    // Update operator
    options.at(0).setSelected();
    expect((group.emitted('query-update') as any)[0][0]).toStrictEqual({ operatorIdentifier: 'AND', children: propsData.value.children });
    const expected: RuleSet = JSON.parse(JSON.stringify(propsData.value));
    expected.operatorIdentifier = 'AND';
    expect((app.emitted('input') as any)[0][0]).toStrictEqual(expected);
  });

  it('tests the `groupControl` slot', async () => {
    const app = mount(QueryBuilder, {
      propsData,
      scopedSlots: {
        groupControl: `
          <div
            slot-scope="props"
            class="slot-wrapper"
          >
            SLOT
            <select>
              <option
                v-for="rule in props.rules"
                :key="rule.identifier"
                :value="rule.identifier"
                v-text="rule.name"
              />
            </select>
            <button
              @click="props.addRule('txt')"
              class="slot-new-rule"
            >
              Add Rule
            </button>
            <button
              @click="props.newGroup"
              class="slot-new-group"
            >
              Add Group
            </button>
          </div>
        `,
      },
    });

    const slot = app.find('.slot-wrapper');
    const group = app.findComponent(QueryBuilderGroup);

    // Some data we'll be using for our assertions
    const query: RuleSet = JSON.parse(JSON.stringify(propsData.value));
    const children = [...propsData.value.children];

    // check if rules are properly rendered
    const options = slot.findAll('option');
    expect(options).toHaveLength(2);
    expect((options.at(0).element as HTMLOptionElement).value).toBe('txt');
    expect((options.at(0).element as HTMLOptionElement).text).toBe('Text Selection');
    expect((options.at(1).element as HTMLOptionElement).value).toBe('num');
    expect((options.at(1).element as HTMLOptionElement).text).toBe('Number Selection');

    // Add a new rule
    slot.find('.slot-new-rule').trigger('click');
    children.push({ identifier: 'txt', value: 'foo' });
    query.children = [...children];
    expect((group.emitted('query-update') as any)[0][0]).toStrictEqual({ operatorIdentifier: 'OR', children });
    expect((app.emitted('input') as any)[0][0]).toStrictEqual(query);

    // Add new group
    app.setProps({ value: { ...query }, config: { ...propsData.config } });
    await app.vm.$nextTick();
    slot.find('.slot-new-group').trigger('click');
    children.push({ operatorIdentifier: 'AND', children: [] });
    query.children = [...children];
    expect((group.emitted('query-update') as any)[1][0]).toStrictEqual({ operatorIdentifier: 'OR', children });
    expect((app.emitted('input') as any)[1][0]).toStrictEqual(query);
  });

  it('tests the `rule` slot', () => {
    const app = mount(QueryBuilder, {
      propsData,
      scopedSlots: {
        rule: `
          <div
            slot-scope="props"
            class="slot-wrapper"
          >
            SLOT
            <component
              :is="props.ruleComponent"
              :value="props.ruleData"
              @input="props.updateRuleData"
              class="slot-rule"
            />
          </div>
        `,
      },
    });

    const rule = app.findComponent(QueryBuilderRule);
    const slot = rule.find('.slot-wrapper');
    const ruleComponent = slot.find('.slot-rule');

    // Verify rule slot is properly rendered
    expect(ruleComponent.is(Component)).toBeTruthy();
    expect(ruleComponent.vm.$props.value).toBe('A');
    expect(ruleComponent.vm.$props.ruleIdentifier).toBe('txt');
    ruleComponent.vm.$emit('input', 'a');
    expect((rule.emitted('query-update') as any)[0][0]).toStrictEqual({ identifier: 'txt', value: 'a' });

    // Verify update event propagates
    const expected: RuleSet = JSON.parse(JSON.stringify(propsData.value));
    (expected.children[0] as Rule).value = 'a';
    expect((app.emitted('input') as any)[0][0]).toStrictEqual(expected);
  });
});
