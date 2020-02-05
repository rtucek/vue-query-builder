# Styling

The Query Builder's default markup and styling has been consciously been kept simple for maximum
customizability.

Support for styling with slots is available. Below, the following slots may be used for seamless
styling.

A slot may be a simple inline template or a dedicated component. While inline templates allow for
simplicity, dedicated components allow maintaining an internal state and you may use all of Vue's
features, including methods, computed properties and watchers.

:::tip
By instinct, you may would like to us `v-model` on some of the slot props. However, this is not
supported by Vue. The props contain a callback which shall be used instead for updating a value.

Often, you'll have to use `v-bind:value` and `v-on:input` instead.
:::


## groupOperator Slot

The `groupOperator` slot may be used for changing the markup of a group's operator.

The slot receives an object with the shape of the [GroupOperatorSlotProps
object](https://github.com/rtucek/vue-query-builder/blob/master/types/index.d.ts#L33).

```vue
<template>
  <query-builder
    :config="config"
    v-model="query"
  >
    <template #groupOperator="props">
      <div class="query-builder-group-slot__group-selection">
        Custom #groupOperator slot
        <select
          :value="props.currentOperator"
          @input="props.updateCurrentOperator($event.target.value)"
        >
          <option disabled value>Select an operator</option>
          <option
            v-for="operator in props.operators"
            :key="operator.identifier"
            :value="operator.identifier"
            v-text="operator.name"
          />
        </select>
      </div>
    </template>
  </query-builder>
</template>

<style>
  .query-builder-group-slot__group-selection {
    padding: 16px;
    background-color: hsl(0, 0, 95%);
  }
</style>
```

<iframe
  src="https://codesandbox.io/embed/groupoperator-slot-21tkb?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="groupOperator Slot"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>


## groupControl slot

The `groupControl` slot allows for creating a new group or adding a new rule.

The slot receives an object with the shape of the [GroupCtrlSlotProps
object](https://github.com/rtucek/vue-query-builder/blob/master/types/index.d.ts#L39).

<iframe
  src="https://codesandbox.io/embed/groupcontrol-slot-8thx1?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="groupControl Slot"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
 ></iframe>


## rule slot

The `rule` slot allows for customizing markup around each rule component.

The slot receives an object with the shape of the [RuleSlotProps
object](https://github.com/rtucek/vue-query-builder/blob/master/types/index.d.ts#L45).

You'll have to use Vue's [Dynamic
Component](https://vuejs.org/v2/guide/components.html#Dynamic-Components) feature for displaying the
actual rule component.

```vue{10-14}
<script>
export default {
  props: ["ruleCtrl"],
};
</script>

<template>
  <div class="rule-slot">
    <span class="slot-text">SLOT #rule</span>
    <component
      :is="ruleCtrl.ruleComponent"
      :value="ruleCtrl.ruleData"
      @input="ruleCtrl.updateRuleData"
    />
  </div>
</template>
```

<iframe
  src="https://codesandbox.io/embed/rule-slot-ty2qx?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="rule Slot"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>
