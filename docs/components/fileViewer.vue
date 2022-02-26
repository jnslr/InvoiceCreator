<template>
    <div class="container-fluid">
        <div class="row mt-2">
            <div class="col-12" v-if="permission">
                <div class="list-group">
                    <a class="list-group-item list-group-item-action list-group-item-info" @click=newFile()>Create new file</a>
                    <a class="list-group-item disabled">File list:</a>
                    <a v-for="file in files" class="list-group-item list-group-item-action" href="#" @click=readFile(file)>{{file.name}}</a>
                </div>               
            </div>
            <div class="col-md-4" v-else >
                <div class="list-group">
                    <a class="list-group-item list-group-item-action list-group-item-info" @click=getPermission()><span class="oi oi-folder"></span> SelectFolder</a>
                    <a class="list-group-item disabled">Recent Folders:</a>
                    <a v-for="dir in recentDirs" class="list-group-item list-group-item-action" href="#" @click=getPermission(dir)>{{dir.name}}</a>
                </div>                
            </div>
        </div>
    </div>
</template>

<script>
module.exports = {
    data: function(){
        return {
            recentDirs: [],
            permission: null,
            files: [],
            db: null,
            currentDir: null
        }
      },
    methods: {
        readFile: async function (handle){
            this.$router.push({ name: 'edit', params: {handle} });
        },    
        newFile: async function(){
            var FileName = prompt("Please enter a filename", "NewInvoice");
            if (FileName){
                FileName += '.inv';
                const handle = await this.currentDir.getFileHandle(FileName, {create: true});
                if(handle)
                    this.$router.push({ name: 'edit', params: {handle} });
            }
        },
        resetDir: function(){
            this.permission = false;
            this.currentDir = null;
        },
        saveRecentDirs: function(){
            var start = (this.recentDirs.length-5>0) ? this.recentDirs.length-5 : 0;
            var end = this.recentDirs.length;
            this.recentDirs = this.recentDirs.slice(start,end); //only take the last 5 recent dirs
            let transaction = app.db.transaction(["RecentDirs"], "readwrite");
            let request = transaction.objectStore("RecentDirs").put(this.recentDirs,'RecentDirs');
            request.onsuccess = ()=>console.log(`RecentDirs updated: `,this.recentDirs)
        },
        getPermission: async function (dir){ //get Permission for existinig dir
            if(!dir){ //New Folder chosen
                const opts = {
                    type: 'open-directory',
                    accepts: [{description: 'invoices', extensions: ['.inv']}],
                  };                
                dir = await window.showDirectoryPicker();
                //if (!this.recentDirs.find(recentDir => recentDir.isSameEntry(dir))){ //Seems like isSameEntry not working yet
                if (!this.recentDirs.find(recentDir => recentDir.name==dir.name)){
                    this.recentDirs.push(dir);
                    this.saveRecentDirs();
                }
            }
            this.currentDir = dir;
            this.$root.$emit('currentDir',this.currentDir);  
            dir.requestPermission().then ( async perm => {
                if(perm != 'granted'){
                    console.log(`Access to ${handle.name} denied`);
                    this.permission = false;
                    return
                }
                this.permission = true;
                let files = [];
                for await (let [name, entry] of dir.entries()) {
                    files.push(entry);
                }
                files = files.filter((file)=>{
                    return file.kind=='file' && file.name.match(/.*\.inv/g);
                });
                this.files = files;
            })            
          }
    },
    mounted: async function () {

        this.$root.$on('openFolder', this.getPermission);//root is used as event bus
        //this.$root.$on('print', this.print);//root is used as event bus
        
        let transaction = app.db.transaction(["RecentDirs"], "readonly");
        let request = transaction.objectStore("RecentDirs").get('RecentDirs');
        //ReadFileRefs
        request.onsuccess = e => {
            if(e.target.result) this.recentDirs = e.target.result;
        }   
    }
}
</script>