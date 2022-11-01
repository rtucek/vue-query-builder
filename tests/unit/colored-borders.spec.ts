import { markRaw } from 'vue';
import { mount } from '@vue/test-utils';
import Draggable from 'vuedraggable';
import { QueryBuilderConfig, RuleSet } from '@/types';
import QueryBuilder from '@/QueryBuilder.vue';
import QueryBuilderGroup from '@/QueryBuilderGroup.vue';
import QueryBuilderChild from '@/QueryBuilderChild.vue';
import Component from '../components/Component.vue';

describe('Testing drag\'n\'drop related features', () => {
  const config: QueryBuilderConfig = {
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
  };

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
          value: 'c',
        }, {
          identifier: 'txt',
          value: 'd',
        }, {
          operatorIdentifier: 'AND',
          children: [{
            identifier: 'txt',
            value: 'a',
          }, {
            identifier: 'txt',
            value: 'b',
          }],
        }],
      }],
    }, {
      operatorIdentifier: 'AND',
      children: [{
        identifier: 'txt',
        value: 'X',
      }, {
        identifier: 'txt',
        value: 'Y',
      }, {
        identifier: 'txt',
        value: 'Z',
      }, {
        operatorIdentifier: 'AND',
        children: [{
          identifier: 'txt',
          value: '',
        }, {
          operatorIdentifier: 'AND',
          children: [{
            identifier: 'txt',
            value: '',
          }, {
            operatorIdentifier: 'AND',
            children: [{
              operatorIdentifier: 'AND',
              children: [{
                identifier: 'txt',
                value: '',
              }, {
                identifier: 'num',
                value: 10,
              }],
            }],
          }],
        }],
      }],
    }],
  };

  it('asserts nothing happens if colors are not configured', () => {
    const app = mount(QueryBuilder, {
      props: {
        modelValue: value,
        config,
      },
    });

    const groups = app.findAllComponents(QueryBuilderGroup);
    expect(groups).toHaveLength(9);

    groups
      .forEach(w => {
        expect(w.vm.$props).toHaveProperty('depth');
        const el = (w.findComponent(QueryBuilderChild)).element as HTMLDivElement;
        expect(el.style.borderColor).toBeFalsy();
      });
  });

  it('checks border colors are applied properly', () => {
    const colors = [
      'hsl(88, 50%, 55%)',
      'hsl(187, 100%, 45%)',
      'hsl(15, 100%, 55%)',
    ];
    const newConfig: QueryBuilderConfig = { ...config, colors };

    const app = mount(QueryBuilder, {
      props: {
        modelValue: value,
        config: newConfig,
      },
    });

    const groups = app.findAllComponents(QueryBuilderGroup);
    expect(groups).toHaveLength(9);

    groups
      .forEach(w => {
        expect(w.vm.$props).toHaveProperty('depth');
        const el = (w.findComponent(Draggable)).element as HTMLDivElement;
        const targetIdx = w.vm.$props.depth % w.vm.$props.config.colors.length;
        expect(el.style).toHaveProperty('borderColor', colors[targetIdx]);
      });
  });
});
