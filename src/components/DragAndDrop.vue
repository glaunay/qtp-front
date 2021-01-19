/*
 See tricks : https://learnvue.co/2020/01/how-to-add-drag-and-drop-to-your-vuejs-project/
*/
<template>
    <div class="w-full rounded border-dashed bg-gray-300 h-6"
    @drop="handleDrop"
    @click="coucou"
    @dragover.prevent
    @dragenter.prevent
    >
        <h1>
            Drop Me
        </h1>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ref } from 'vue'
export default defineComponent({
    setup(_, { emit }){
        
        const dropData = ref(new ArrayBuffer(0));
        
        const processData = (d: DragEvent["dataTransfer"]) => {
            if(!d) {
                console.warn("Empty file object");
                return;
            }           
            const file = d.files[0] as File;
            const onLoad = (e: ProgressEvent<FileReader>) => {
                dropData.value = e?.target?.result as ArrayBuffer;
                console.log("Fire XLS");
                emit('xml-load', dropData.value);
                /*const d = e?.target?.result;
                if(d) {
                    console.log("data In");
                    console.log(d);
                    const data = new Uint8Array(d as ArrayBuffer);
                    emit('xml-load',data);
                }*/
            };
               
            const reader = new FileReader();
            reader.onload = onLoad;
            reader.readAsArrayBuffer(file);
        }

        const handleDrop = (e: DragEvent) => {
            console.log("DROP!!");
            e.stopPropagation(); e.preventDefault();
            if(e.dataTransfer) 
                processData(e.dataTransfer)
        };

        const coucou = ()=>{
            console.log("You clicked");
        }

        onMounted ( ()=>{
            console.log("Mounting drag&drop");
        });

        return {coucou, handleDrop};
    }
});
</script>