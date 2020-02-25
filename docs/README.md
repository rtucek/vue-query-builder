# Vue Query Builder

A Vue Query Builder library.


## About

This library got heavily inspired by [Daniel Abernathy's](https://github.com/dabernathy89) awesome
[vue-query-builder](https://github.com/dabernathy89/vue-query-builder) library, which got in turn
inspired by jQuery's [Knockout Query Builder](https://kindohm.github.io/knockout-query-builder/).

The intention behind building my own was adding some missing features such as providing TypeScript
support and re-ordering with drag'n'drop.

<iframe
  src="https://codesandbox.io/embed/introduction-demo-ig55y?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark&view=preview"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Introduction Demo"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>


## Features

The query builder has the following key features:

- Re-ordering of rules and groups with drag'n'drop.
- Emphasizing groups with configurable colors.
- Control maximum depth of nested groups.
- Easy to customize with pure CSS and slots.
- Layout can be serialized and restored.
- Vuex compatible.
- TypeScript support.
