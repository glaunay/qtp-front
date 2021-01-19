<template>
  <div class="home">
   <h1> Manipulating XLS Record </h1>
   <XmlLoader />
   <!--
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
   -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import XmlLoader from '@/components/XmlLoader.vue'; // @ is an alias to /src
export default defineComponent({
  name: 'DataSpreadSheet',
  components: {
    XmlLoader
  //  HelloWorld,
  },
  mounted(){
    console.log("Mounting spreadsheet");
  }
});
</script>
