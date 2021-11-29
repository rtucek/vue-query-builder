import { mount, shallowMount, Wrapper } from '@vue/test-utils';
import Vue from 'vue';
import Sortable, {
  GroupOptions, PutResult, SortableEvent, SortableOptions,
} from 'sortablejs';
import QueryBuilder from '@/QueryBuilder.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderChild from '@/QueryBuilderChild.vue';
import { RuleSet, QueryBuilderConfig, Rule } from '@/types';
import Component from '../components/Component.vue';

interface QueryBuilderGroupInstance extends Vue {
  maxDepthExeeded: boolean,
  dragOptions: SortableOptions,
}

interface GroupOptionsInterface extends GroupOptions {
  put: ((to: Sortable, from: Sortable, dragEl: HTMLElement, event: SortableEvent) => PutResult)
}

interface DragOptionsInterface extends SortableOptions {
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
        component: Component,
        initialValue: '',
      },
      {
        identifier: 'num',
        name: 'Number Selection',
        component: Component,
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

  it('prunes existing branches which are beyond the max-depth setting', async () => {
    const app = mount(QueryBuilder, {
      propsData: {
        value: { ...value },
        config: { ...config },
      },
    });

    const wrapper = app.findComponent(QueryBuilder);

    // Before, ensure nothing has been changed
    expect(wrapper.vm.$props.value).toHaveProperty('children.0.children.3.children.2.children.1.children.0.value', 'G');
    expect(app.emitted('input')).toBeUndefined();

    // Reduce max depth
    await app.setProps({
      value: { ...value },
      config: { ...config, maxDepth: 3 },
    });
    expect(app.emitted('input')).toHaveLength(1);
    expect((app.emitted('input') as any[])[0]).not.toHaveProperty('0.children.0.children.3.children.2.children.1.children.0.value', 'G');
    expect((app.emitted('input') as any[])[0][0].children[0].children[3].children[2].children).toHaveLength(2);
    expect((app.emitted('input') as any[])[0]).toHaveProperty('0.children.0.children.3.children.2.children', [{ identifier: 'txt', value: 'F' }, { identifier: 'txt', value: 'H' }]);

    // Don't allow any group children
    await app.setProps({
      value: { ...value },
      config: { ...config, maxDepth: 0 },
    });

    expect((app.emitted('input') as any[]).pop()[0].children).toHaveLength(0);
  });

  it('asserts no additional group can be created, beyond the mad-depth setting', () => {
    const app = mount(QueryBuilder, {
      propsData: {
        value: { ...value },
        config: { ...config },
      },
    });

    const groups = app.findAllComponents(QueryBuilderGroup).wrappers;

    const group1 = (
        groups.filter(g => g.vm.$props.depth === 1)
          .shift()
      ) as Wrapper<QueryBuilder, Element>;
    expect((group1.vm as QueryBuilderGroupInstance).maxDepthExeeded).toBeFalsy();
    expect(group1.find('.query-builder-group__group-adding-button').exists()).toBeTruthy();

    const group4 = (
        groups.filter(g => g.vm.$props.depth === 4)
          .shift()
      ) as Wrapper<QueryBuilder, Element>;
    expect((group4.vm as QueryBuilderGroupInstance).maxDepthExeeded).toBeTruthy();
    expect(group4.find('.query-builder-group__group-adding-button').exists()).toBeFalsy();
  });

  it('checks and rejects movements, violating the max depth policy', () => {
    const app = mount(QueryBuilder, {
      propsData: {
        value: { ...value },
        config: { ...config },
      },
    });

    const groups = app.findAllComponents(QueryBuilderGroup).wrappers;
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
});

function buildDragEl(r: Rule | RuleSet, config: QueryBuilderConfig): HTMLElement {
  const rChild = shallowMount(QueryBuilderChild, {
    propsData: {
      query: { ...r },
      config: { ...config },
    },
  });

  const rEl = {
    __vue__: rChild.vm,
  } as unknown;

  return rEl as HTMLElement;
}

function buildDragOptions(ws: Array<Wrapper<Vue, Element>>): DragOptionsInterface {
  const w = ws.shift() as Wrapper<QueryBuilder, Element>;
  const qbgi = w.vm as QueryBuilderGroupInstance;

  return (qbgi.dragOptions as DragOptionsInterface);
}
