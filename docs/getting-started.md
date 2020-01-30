# Getting Started


## Installation

::: warning
Please be aware of that at **least Vue v2.6** is required, due to the new scoped slots features that
this library is making use of.
:::


Add the library with either npm or yarn - simply run one of the following commands:


```bash
yarn add query-builder-vue
npm install query-builder-vue
```

You may also use the pre-transpiled dist files from the Unpkg.com CDN - simply add, but don't forget
to import Vue too!


```html
<script src="https://unpkg.com/browse/query-builder-vue@0.1.0/dist/query-builder.umd.min.js"></script>
```


## Usage

Getting started with the QueryBuilder is easy.
It just requires a minimum configuration.

<iframe
  src="https://codesandbox.io/embed/minimum-configuration-bcdit?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Minimum Configuration"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>


```html
<template>
  <div id="app">
    <query-builder :config="config" v-model="query"></query-builder>
  </div>
</template>

<script>
import QueryBuilder from "query-builder-vue";

import Input from "./components/Input.vue";
import Number from "./components/Number.vue";

export default {
  components: {
    QueryBuilder
  },
  data() {
    return {
      query: null,

      config: {
        operators: [
          {
            name: "AND",
            identifier: "AND"
          },
          {
            name: "OR",
            identifier: "OR"
          }
        ],
        rules: [
          {
            identifier: "txt",
            name: "Text Selection",
            component: Input,
            initialValue: ""
          },
          {
            identifier: "num",
            name: "Number Selection",
            component: Number,
            initialValue: 10
          }
        ],
      }
    };
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  margin: 30px auto;
  width: 90%;
  border: 1px solid hsl(0, 0%, 75%);
}
</style>
```
