<script>
export default {
  props: [
    'groupCtrl',
  ],
  data() {
    return {
      selectedRule: '',
    };
  },
  computed: {
    addRuleBtnClass() {
      if (this.selectedRule) {
        return [
          'hover:bg-blue-700',
        ];
      }


      return [
        'opacity-50',
        'cursor-not-allowed',
      ];
    },
  },
  methods: {
    addRule(rule) {
      this.groupCtrl.addRule(this.selectedRule);
      this.selectedRule = '';
    },
  },
};
</script>

<template>
  <div class="block sm:flex m-8">
    <div class="w-full sm:w-auto">
      <div class="relative inline-block">
        <select
          v-model="selectedRule"
          class="
            block
            appearance-none
            bg-white
            border
            border-gray-400
            hover:border-gray-500
            px-4
            py-2
            pr-8
            rounded
            shadow
            leading-tight
            focus:outline-none
            focus:shadow-outline
          "
        >
          <option value="">Select Rule</option>
          <option
            v-for="rule in groupCtrl.rules"
            :key="rule.identifier"
            :value="rule.identifier"
            v-text="rule.name"
          />
        </select>
        <div
          class="
            pointer-events-none
            absolute
            inset-y-0
            right-0
            flex
            items-center
            px-2
            text-gray-700
          "
        >
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      <button
        @click="addRule"
        v-text="'Add Rule'"
        class="
          ml-2
          bg-blue-500
          text-white
          font-bold
          py-2
          px-4
          rounded
        "
        :class="addRuleBtnClass"
        :disabled="! selectedRule"
      />
    </div>
    <div class="w-full mt-2 sm:w-auto sm:mt-0 sm:ml-8">
      <button
        @click="groupCtrl.newGroup"
        v-text="'Add Group'"
        class="
          hover:bg-blue-700
          bg-blue-500
          text-white
          font-bold
          py-2
          px-4
          rounded
        "
      />
    </div>
  </div>
</template>
