/*
 See tricks : https://learnvue.co/2020/01/how-to-add-drag-and-drop-to-your-vuejs-project/
*/
<template>
   <h1> XML Loader II</h1>
   <DragAndDrop 
   @xml-load="doIt"
   />
   HERE{{name}}HERE
   <button
   class="bg-gray-500"
   @click="increment"
   > ++
   </button>
    {{wsHead}}

    <div 
    v-if="loaded"
    >
        <div
            class="flex flex-row"
        >
            <div
            class="w-full"
            v-for="sTitle in headers"
            :key="sTitle"
            >
                {{sTitle}}
            </div>
        </div>
        <table>
            <tr
            v-for="n in dimensions[0]"
            :key="n"
            >
                <td
                v-for="m in dimensions[1]"
                :key="m"
                >
                {{cell(n-1, m-1)}}
                </td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
//import { ref } from 'vue'

import DragAndDrop from '@/components/DragAndDrop.vue';
import XLSX  from 'xlsx';
import { useStore } from 'vuex'

import { UniprotDatabase } from '../utilities/uniprot-database';

export default defineComponent({
    components : { DragAndDrop },
    setup(){
        const loaded = ref(false);
        const store = useStore()
        const wsHead = computed(()=>{ return store.getters.test})
        const doIt = (dropData: any) => {
            //console.log("Tryin to read ...");
            const workbook = XLSX.read(dropData, {type: 'array'});
            //console.dir(workbook)
            store.dispatch('initStoreBook', workbook);
            //console.log(workbook.SheetNames);
            /*const _ = workbook.SheetNames[0];
            const sheet = workbook.Sheets[_];*/            
            loaded.value = true;             
        };

        const name = computed(() => store.state.count);

        //const active = computed(() => store.state.count);
        const headers = computed( () => {
            return  store.getters.sheetNames;
        });
        const dimensions = computed( () => {
            return  store.getters.dimensions;
        });
        const cell = (x: number, y: number)=>{
            //const _ = store.getters.cell(x, y)
            return store.getters.cell(x, y);
        };
        const increment = () => {
            store.commit('pushUp');
        };
        onMounted(()=>{
            setTimeout(async() => {
                console.log("trying to fecth")
                const arrayData = await fetch(
                    'xls/TMT-donées brutes_Results_20-0609-0618_VegetativeExp_V2_proteins.xlsx'
                    )//'../TMT-donées brutes_Results_20-0609-0618_VegetativeExp_V2_proteins.xlsx')//fetch("../TMT-donées brutes_dev.xlsx")
                    .then( (response) =>{
                        console.log(response.status);
                        console.log("success");
                    return response.arrayBuffer();
                    })
                    .catch(()=>console.error("No XLS found"));
                if(arrayData) {
                    console.log("OUOUH");
                    const data = new Uint8Array(arrayData);
                    const wb = XLSX.read(data, {type:"array"});
                    store.dispatch('initStoreBook', wb);
                    loaded.value = true;
                    
                    const uniprotIdList: string[]|undefined = store.getters.getColDataByName("Accession", "string");
                    if (uniprotIdList) {
                        console.log(`Trying to load ${uniprotIdList.length} elements`);
                        try{
                            const n = await UniprotDatabase.add(uniprotIdList);
                            console.log(`${n} additions OK`);

                        }catch(e){
                            console.log("ERROR")
                            throw(e);
                        }                       
                        await UniprotDatabase.readAll();
                        const d = await UniprotDatabase.get("P00961");
                        console.dir(d);
                    }
                    //console.log(store.getters.json);
                }
            }
            , 1000);
        })
        return { doIt, name, wsHead, increment, loaded, headers, dimensions, cell };
    }
});
</script>