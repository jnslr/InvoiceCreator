<template>
    <div class="container-fluid">
        <div class="row mt-2">
            <div class="col">
                <div class="list-group">
                    <a class="list-group-item list-group-item-action list-group-item-info" @click=getPermission()><span class="oi oi-folder"></span> Settings</a>
                    <a v-for="(setting,key) in settings" v-bind:key="key" class="list-group-item">{{key}}:  <input @change="saveSettings(key)" v-model="settings[key]" placeholder="edit me"></a>
                </div>                
            </div>
        </div>
    </div>
</template>

<script>
module.exports = {
    data: function(){
        return {
            settings: {
                UserName: "",
                UserStreet: "",
                UserZip: "",
                UserMail: "",
                UserPhone: "",
                UserIBAN: "",
                UserBIC: "",
                UserTaxNumber: ""
            },
        }
      },
    methods: {        
        saveSettings: function(key){
            console.log(`Saving settings for ${key}`)
            let transaction = app.db.transaction(["Settings"], "readwrite");
            let request = transaction.objectStore("Settings").put(this.settings[key],key);
            request.onsuccess =  () => console.log(`updated setting ${key} : ${this.settings[key]}`)
        },
    },
    mounted: async function () {        
        let transaction = app.db.transaction(["Settings"], "readonly");
        for (const key in this.settings){
            let request = transaction.objectStore("Settings").get(key);
            //ReadFileRefs
            request.onsuccess = (e) => {
                this.settings[key] = e.target.result;
                console.log(`Reading settings for ${key}: ${e.target.result}`)
            }
        }
    }
}
</script>