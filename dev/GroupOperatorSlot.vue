<template>
  <div class="container-fluid group-operator">
    <div class="row">
      <div class="col-md-12">
        <div class="dropdown" :class="{ show: expanded }">
          <button
            class="btn btn-primary dropdown-toggle"
            type="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            :aria-expanded="String(expanded)"
            v-text="groupOperator.currentOperator"
            @click="expanded = ! expanded"
          />
          <div
            class="dropdown-menu"
            :class="{ show: expanded }"
            aria-labelledby="dropdownMenuButton"
          >
            <a
              v-for="operator in groupOperator.operators"
              :key="operator.identifier"
              v-text="operator.name"
              @click="selectOperator(operator.identifier)"
              class="dropdown-item"
              href="#"
            />
          </div>
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
  data() {
    return {
      expanded: false,
    };
  },
  methods: {
    selectOperator(operator) {
      this.expanded = false;
      this.groupOperator.updateCurrentOperator(operator);
    },
  },
};
</script>

<style scoped>
.group-operator {
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>
