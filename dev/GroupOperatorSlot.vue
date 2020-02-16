<template>
  <div class="group-operator-slot container is-fluid">
    <div class="columns">
      <div class="column">
        <div class="select">
          <select
            :value="groupOperator.currentOperator"
            @input="groupOperator.updateCurrentOperator($event.target.value)"
          >
            <option
              v-for="operator in groupOperator.operators"
              :key="operator.identifier"
              v-text="operator.name"
            />
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'groupOperator',
  ],
};
</script>

<style lang="scss" scoped>
.group-operator-slot {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
