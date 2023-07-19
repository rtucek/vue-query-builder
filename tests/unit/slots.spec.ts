import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import { RuleSet, Rule, QueryBuilderConfig } from '@/types';
import QueryBuilder from '@/QueryBuilder.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderRule from '@/QueryBuilderRule.vue';
import Component from '../components/Component.vue';

describe('Testing slot related features', () => {
  const props: { modelValue: RuleSet, config: QueryBuilderConfig } = {
    modelValue: {
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
          component: markRaw(Component),
          initialValue: 'foo',
        },
        {
          identifier: 'num',
          name: 'Number Selection',
          component: markRaw(Component),
          initialValue: 10,
        },
      ],
    },
  };

  it('tests the `groupOperator` slot', () => {
    const app = mount(QueryBuilder, {
      props,
      slots: {
        groupOperator: `
        <template v-slot="props">
          <div
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
        </template>`,
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
    expect((group.emitted('query-update') as any)[0][0]).toStrictEqual({ operatorIdentifier: 'AND', children: props.modelValue.children });
    const expected: RuleSet = JSON.parse(JSON.stringify(props.modelValue));
    expected.operatorIdentifier = 'AND';
    expect((app.emitted('update:modelValue') as any)[0][0]).toStrictEqual(expected);
  });

  it('tests the `groupControl` slot', async () => {
    const app = mount(QueryBuilder, {
      props,
      slots: {
        groupControl: `
        <template v-slot="props">
          <div
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
        </template>`,
      },
    });

    const slot = app.find('.slot-wrapper');
    const group = app.findComponent(QueryBuilderGroup);

    // Some data we'll be using for our assertions
    const query: RuleSet = JSON.parse(JSON.stringify(props.modelValue));
    const children = [...props.modelValue.children];

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
    expect((app.emitted('update:modelValue') as any)[0][0]).toStrictEqual(query);

    // Add new group
    app.setProps({ modelValue: { ...query }, config: { ...props.config } });
    await app.vm.$nextTick();
    slot.find('.slot-new-group').trigger('click');
    children.push({ operatorIdentifier: 'AND', children: [] });
    query.children = [...children];
    expect((group.emitted('query-update') as any)[1][0]).toStrictEqual({ operatorIdentifier: 'OR', children });
    expect((app.emitted('update:modelValue') as any)[1][0]).toStrictEqual(query);
  });

  it('tests the `rule` slot', () => {
    const app = mount(QueryBuilder, {
      props,
      slots: {
        rule: `
        <template v-slot="props">
          <div
            class="slot-wrapper"
          >
            SLOT
            <component
              :is="props.ruleComponent"
              :modelValue="props.ruleData"
              :identifier="props.ruleIdentifier"
              @update:modelValue="props.updateRuleData"
              class="slot-rule"
            />
          </div>
        </template>`,
      },
    });

    const rule = app.findComponent(QueryBuilderRule);
    const slot = rule.find('.slot-wrapper');
    const ruleComponent = slot.findComponent('.slot-rule');

    // Verify rule slot is properly rendered
    if (false) { // is no longer part of @vue/test-utils
      expect(ruleComponent.is(Component)).toBeTruthy();
    }
    expect(ruleComponent.vm.$props.modelValue).toBe('A');
    expect(rule.vm.$props.query.identifier).toBe('txt');
    expect(ruleComponent.vm.$props.identifier).toBe('txt');
    ruleComponent.vm.$emit('update:modelValue', 'a');
    expect((rule.emitted('query-update') as any)[0][0]).toStrictEqual({ identifier: 'txt', value: 'a' });

    // Verify update event propagates
    const expected: RuleSet = JSON.parse(JSON.stringify(props.modelValue));
    (expected.children[0] as Rule).value = 'a';
    expect((app.emitted('update:modelValue') as any)[0][0]).toStrictEqual(expected);
  });
});
