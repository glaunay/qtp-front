<template>
<nav class="w-full bg-gradient-to-r from-blue-800 to-bblue-600 text-white px-4 py-2">
<router-link
v-for="item in itemList"
:key="item.to"
:to="item.to"
 class="mx-2"
>{{item.title}}
</router-link>
</nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Header',
  data(){
    return {
      itemList : [
                { title: "Data"      , to: "/data-spreadsheet" },
                { title: "Explore", to: "/data-explore" }
                ]
    };
  },
  props: {
    msg: String,
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
