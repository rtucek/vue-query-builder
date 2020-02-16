# Demos

The Query Builder has been designed with 2 goals in mind: allowing support of arbitrary components
for selecting values and easy custom styling.

The following samples demonstrate the capabilities of the library.


## Custom Components

The Vue Query Builder may be combined with any library, supporting the [v-model
API](https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components).

In the sample below, we're demonstrating usage of 3 different libraries: range selection
(vue-range-component), select2 (vue-select) and a date-picker (vue-flatpickr-component).


<iframe
  src="https://codesandbox.io/embed/demo-components-67vro?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="demo components"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>


## Theming

Many work has been put into the ability of overriding the styling and markup for making the Query
Builder agnostic to various CSS frameworks and responsive. Of course, you'll have to ensure by
yourself that Query Builder rules are responsive.


### Bootstrap

Query Builder with [Bootstrap 4](https://getbootstrap.com/) theme.

<iframe
  src="https://codesandbox.io/embed/demo-bootstrap-4-e37eq?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="demo bootstrap 4"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>


### Bulma

Query Builder with [Bulma](https://bulma.io/) theme.

<iframe
  src="https://codesandbox.io/embed/demo-bulma-9m5r4?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Demo: Bulma"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>
