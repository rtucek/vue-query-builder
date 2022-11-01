import { markRaw } from 'vue';
import { mount, shallowMount, Wrapper } from '@vue/test-utils';
import { vi } from 'vitest';
import Sortable, {
  GroupOptions, PutResult, SortableEvent, SortableOptions,
} from 'sortablejs';
import QueryBuilder from '@/QueryBuilder.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderChild from '@/QueryBuilderChild.vue';
import {
  RuleSet, QueryBuilderConfig, Rule, GroupCtrlSlotProps,
} from '@/types';
import Component from '../components/Component.vue';

interface QueryBuilderGroupInterface extends Vue {
  depth: number,
  maxDepthExeeded: boolean,
  dragOptions: SortableOptions,
  groupControlSlotProps: GroupCtrlSlotProps,
}

interface GroupOptionsInterface extends GroupOptions {
  put: ((to: Sortable, from: Sortable, dragEl: HTMLElement, event: SortableEvent) => PutResult)
}

interface DragOptionsInstance extends SortableOptions {
  group: GroupOptionsInterface,
}

describe('Testing max-depth behaviour', () => {
  const value: RuleSet = {
    operatorIdentifier: 'OR',
    children: [{
      operatorIdentifier: 'AND',
      children: [{
        identifier: 'txt',
        value: 'A',
      }, {
        identifier: 'txt',
        value: 'B',
      }, {
        identifier: 'txt',
        value: 'C',
      }, {
        operatorIdentifier: 'AND',
        children: [{
          identifier: 'txt',
          value: 'D',
        }, {
          identifier: 'txt',
          value: 'E',
        }, {
          operatorIdentifier: 'AND',
          children: [{
            identifier: 'txt',
            value: 'F',
          }, {
            operatorIdentifier: 'AND',
            children: [{
              identifier: 'txt',
              value: 'G',
            }],
          }, {
            identifier: 'txt',
            value: 'H',
          }],
        }],
      }],
    }, {
      operatorIdentifier: 'AND',
      children: [{
        identifier: 'txt',
        value: 'X',
      }, {
        operatorIdentifier: 'AND',
        children: [{
          identifier: 'txt',
          value: 'T',
        }],
      }, {
        identifier: 'txt',
        value: 'Y',
      }, {
        identifier: 'txt',
        value: 'Z',
      }],
    }],
  };

  const config: QueryBuilderConfig = {
    operators: [
      {
        name: 'AND',
        identifier: 'AND',
      },
      {
        name: 'OR',
        identifier: 'OR',
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
    dragging: {
      animation: 300,
      disabled: false,
      ghostClass: 'ghost',
    },
    maxDepth: 4,
  };

  it('verifies not groups are added upon max-depth', () => {
    const createApp = () => mount(QueryBuilder, {
      props: {
        modelValue: { ...value },
        config: { ...config },
      },
    });

    // Test non-leave group
    let app = createApp();
    let group = app.findAllComponents(QueryBuilderGroup)
      .filter(g => g.vm.$props.depth === 3)
      .shift() as Wrapper<QueryBuilderGroupInterface, Element>;
    // Assert button is present
    let button = group.find('.query-builder-group__group-adding-button');
    expect(button.exists()).toBeTruthy();
    button.trigger('click');
    let evQueryUpdate = app.emitted('update:modelValue');
    expect(evQueryUpdate).toHaveLength(1);

    // Test "leaf" group
    app = createApp();
    group = app.findAllComponents(QueryBuilderGroup)
      .filter(g => g.vm.$props.depth === 4)
      .shift() as Wrapper<QueryBuilderGroupInterface, Element>;
    // Assert button is absent
    button = group.find('.query-builder-group__group-adding-button');
    expect(button.exists()).toBeFalsy();
    evQueryUpdate = app.emitted('update:modelValue');
    expect(evQueryUpdate).toBeUndefined();
  });

  it('verifies the behaviour of GroupCtrlSlotProps slot', () => {
    const createApp = () => mount(QueryBuilder, {
      props: {
        modelValue: { ...value },
        config: { ...config },
      },
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
              v-if="! props.maxDepthExeeded"
              @click="props.newGroup"
              class="slot-new-group"
            >
              Add Group
            </button>
          </div>
        </template>`,
      },
    });

    let app = createApp();
    let group = app.findAllComponents(QueryBuilderGroup)
      .filter(g => g.vm.$props.depth === 3)
      .shift() as Wrapper<QueryBuilderGroupInterface, Element>;
    expect(group.vm.groupControlSlotProps.maxDepthExeeded).toBeFalsy();
    // Assert button is present
    let button = group.find('.slot-new-group');
    expect(button.exists()).toBeTruthy();
    button.trigger('click');
    let evQueryUpdate = app.emitted('update:modelValue');
    expect(evQueryUpdate).toHaveLength(1);

    // Test leaf group
    app = createApp();
    group = app.findAllComponents(QueryBuilderGroup)
      .filter(g => g.vm.$props.depth === 4)
      .shift() as Wrapper<QueryBuilderGroupInterface, Element>;
    expect(group.vm.groupControlSlotProps.maxDepthExeeded).toBeTruthy();
    // Assert button is absent
    button = group.find('.slot-new-group');
    expect(button.exists()).toBeFalsy();
    evQueryUpdate = app.emitted('update:modelValue');
    expect(evQueryUpdate).toBeUndefined();
  });

  it('prunes existing branches which are beyond the max-depth setting', async () => {
    const app = mount(QueryBuilder, {
      props: {
        modelValue: { ...value },
        config: { ...config },
      },
    });

    const wrapper = app.findComponent(QueryBuilder);

    // Before, ensure nothing has been changed
    expect(wrapper.vm.$props.modelValue).toHaveProperty('children.0.children.3.children.2.children.1.children.0.value', 'G');
    expect(app.emitted('update:modelValue')).toBeUndefined();

    // Reduce max depth
    await app.setProps({
      modelValue: { ...value },
      config: { ...config, maxDepth: 3 },
    });
    expect(app.emitted('update:modelValue')).toHaveLength(1);
    expect((app.emitted('update:modelValue') as any[])[0]).not.toHaveProperty('0.children.0.children.3.children.2.children.1.children.0.value', 'G');
    expect((app.emitted('update:modelValue') as any[])[0][0].children[0].children[3].children[2].children).toHaveLength(2);
    expect((app.emitted('update:modelValue') as any[])[0]).toHaveProperty('0.children.0.children.3.children.2.children', [{ identifier: 'txt', value: 'F' }, { identifier: 'txt', value: 'H' }]);

    // Don't allow any group children
    await app.setProps({
      modelValue: { ...value },
      config: { ...config, maxDepth: 0 },
    });

    expect((app.emitted('update:modelValue') as any[]).pop()[0].children).toHaveLength(0);
  });

  it('asserts no additional group can be created, beyond the mad-depth setting', () => {
    const app = mount(QueryBuilder, {
      props: {
        modelValue: { ...value },
        config: { ...config },
      },
    });

    const groups = app.findAllComponents(QueryBuilderGroup);

    const group1 = (
        groups.filter(g => g.vm.$props.depth === 1)
          .shift()
      ) as Wrapper<QueryBuilderGroupInterface, Element>;
    expect((group1.vm as QueryBuilderGroupInterface).maxDepthExeeded).toBeFalsy();
    expect(group1.find('.query-builder-group__group-adding-button').exists()).toBeTruthy();

    const group4 = (
        groups.filter(g => g.vm.$props.depth === 4)
          .shift()
      ) as Wrapper<QueryBuilderGroupInterface, Element>;
    expect((group4.vm as QueryBuilderGroupInterface).maxDepthExeeded).toBeTruthy();
    expect(group4.find('.query-builder-group__group-adding-button').exists()).toBeFalsy();
  });

  it('checks and rejects movements, violating the max depth policy', () => {
    const buildDragEl = (r: Rule | RuleSet, c: QueryBuilderConfig): HTMLElement => {
      const rChild = shallowMount(QueryBuilderChild, {
        props: {
          query: { ...r },
          config: { ...c },
        },
      });

      const rEl = {
        __vue__: rChild.vm,
      } as unknown;

      return rEl as HTMLElement;
    };

    const buildDragOptions = (ws: Array<Wrapper<Vue, Element>>): DragOptionsInstance => {
      const w = ws.shift() as Wrapper<Vue, Element>;
      const qbgi = w.vm as QueryBuilderGroupInterface;

      return (qbgi.dragOptions as DragOptionsInstance);
    };

    const app = mount(QueryBuilder, {
      props: {
        modelValue: { ...value },
        config: { ...config },
      },
    });

    const groups = app.findAllComponents(QueryBuilderGroup);
    const s = (null as never) as Sortable;
    const se = (null as never) as SortableEvent;

    // Moving rule is always fine
    const movingRule = (value as any)
      .children[0].children[3].children[2].children[1].children[0] as Rule | RuleSet;

    const dragOptions1 = buildDragOptions(groups.filter(g => g.vm.$props.depth === 1));
    expect(dragOptions1.group.put(s, s, buildDragEl(movingRule, config), se)).toBeTruthy();

    const dragOptions2 = buildDragOptions(groups.filter(g => g.vm.$props.depth === 4));
    expect(dragOptions2.group.put(s, s, buildDragEl(movingRule, config), se)).toBeTruthy();

    // Moving ruleset needs extra check
    const movingRuleSet = (value as any).children[1] as Rule | RuleSet;
    expect(dragOptions1.group.put(s, s, buildDragEl(movingRuleSet, config), se)).toBeTruthy();
    expect(dragOptions2.group.put(s, s, buildDragEl(movingRuleSet, config), se)).toBeFalsy();
  });

  it('checks and verifies GroupCtrlSlot\'s props behaviour', async () => {
    const newRuleSet = (): RuleSet => ({
      operatorIdentifier: 'AND',
      children: [],
    });

    const getMergeTrap = vi.fn();

    const app = shallowMount(QueryBuilderGroup, {
      props: {
        config: { ...config },
        query: newRuleSet(),
        depth: 4,
      },
      provide: {
        getMergeTrap,
      },
    }) as Wrapper<QueryBuilderGroupInterface>;

    const slotPropsLeafGroup = app.vm.groupControlSlotProps;
    expect(slotPropsLeafGroup.maxDepthExeeded).toBeTruthy();
    slotPropsLeafGroup.newGroup();
    expect(app.emitted('query-update')).toBeUndefined();

    // Now try adding another by stepping down 1 depth
    app.setProps({
      config: { ...config },
      query: newRuleSet(),
      depth: 3,
    });
    await app.vm.$nextTick();

    const slotPropsNonLeafGroup = app.vm.groupControlSlotProps;
    expect(slotPropsNonLeafGroup.maxDepthExeeded).toBeFalsy();
    slotPropsNonLeafGroup.newGroup();
    expect(app.emitted('query-update')).toHaveLength(1);

    expect(getMergeTrap).not.toBeCalled();
  });
});
