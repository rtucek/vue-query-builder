# Configuration

The configuration is performed by the `config` prop. A single object, which shape is defined by the
[QueryBuilderConfig interface](https://github.com/rtucek/vue-query-builder/blob/master/types/index.d.ts#L26).

Below, we'll cover every key aspect of the config object.


## Operators

The operators are used for allowing the users to choose how rules within a group should be
evaluated. For instance, you may allow the users select classic boolean operators like *AND* and
*OR* for a group. Additionally, you could also provide less common operators like *ONE OF* for
requiring at least on condition is satisfied for considering an entire group as truthy.
Along your existing operators, you may also provide the negated counterparts like *AND NOT*, *OR
NOT* and *NONE OF* operators.

Every operator is defined by an unique identifier and a visual text.


```js
{
  operators: [
    {
      name: 'AND',
      identifier: 'AND',
    },
    {
      name: 'OR',
      identifier: 'OR',
    },
    {
      name: 'OR NOT',
      identifier: 'OR_NOT',
    },
    {
      name: 'AND NOT',
      identifier: 'AND_NOT',
    },
    // ...
}
```


## Rules

Rules are individual conditions within a group and must be defined as components, adhering to the
[v-modle API](https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components).

Every must have a unique identifier, a display name, the underlying component and optionally an
individual value.

The `initialValue` may provide any primitive value (string, number or null), however any object or
array must be constructed by a factory function.

There are several options for assigning composer with rules:
 - JavaScript modules
 - Pre-defined Vue Components
 - Inline the component's definition directly (requires compiler-included build for templates or use
   render functions directly)


```js
import InputSelection from './InputSelection.vue';

Vue.component('NumberSelection', {
  template: `
    <input
      type="text"
      v-model="model"
      placeholder="dummy input"
    >
  `,
  props: [
    'value',
  ],
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
});

{
  rules: [
    {
      identifier: 'txt',
      name: 'Text Selection',
      component: InputSelection,
      initialValue: '',
    },
    {
      identifier: 'num',
      name: 'Number Selection',
      component: 'NumberSelection',
      initialValue: 10,
    },
    {
      identifier: 'other-num',
      name: 'Other Number Selection',
      component: {
        template: `
          <input
            type="text"
            v-model="model"
            placeholder="dummy input"
          >
        `,
        props: [
          'value',
        ],
        computed: {
          model: {
            get() {
              return this.value;
            },
            set(value) {
              this.$emit('input', value);
            },
          },
        },
      },
    },
  ],
}
```

<iframe
  src="https://codesandbox.io/embed/rules-cyll8?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Config Rules"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>


## Colors

A complex, deep nested query can quickly become confusing. In order to keep an overview, nested
groups may be emphasized with colorful hints.

The colors property should be a string array with a minimum length of at least 2, containing any
valid CSS color definition.


```js
{
  colors: [
    'hsl(88, 50%, 55%)',
    'hsl(187, 100%, 45%)',
    'hsl(15, 100%, 55%)',
  ],
}
```

<iframe
  src="https://codesandbox.io/embed/config-colors-gx5dh?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Config Colors"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>


## Sortable

Thanks to the excellent [Vue.Draggable](https://github.com/SortableJS/Vue.Draggable) library, the
query builder supports re-sorting rules and groups with drag'n'drop.

The sortable feature is disabled by default, however you may enable it simply by any [Sortable
options](https://github.com/SortableJS/Sortable#options) on the dragging property.

::: warning
There are 2 exceptions on the sortable options object:

- `groups` are ignored. The main reason is that the query builder will have set the value internally
for allowing nested dragging.

- All methods with `on` are ignored. From
  [Vue.Sortable's documentation](https://github.com/SortableJS/Vue.Draggable#all-sortable-options):
  > [...]
  >
  > This means that all sortable option are valid sortable props with the notable exception of all
  > the method starting by "on" as draggable component expose the same API via events.
  >
  > [...]
:::

```js
{
    dragging: {
      animation: 300,
      disabled: false,
      ghostClass: 'ghost',
    }
}
```

<iframe
  src="https://codesandbox.io/embed/config-dragging-uwi8o?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Config Dragging"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>
