<template>
    <nav id="header" class="navbar navbar-light bg-light navbar-expand">
    <a class="navbar-brand" @click=goHome href='#'> <span class="oi oi-home"></span>  Invoice Creator <small class='text-muted' v-if="$root.$data.version">v {{$root.$data.version}}</small></a> 

    <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
            <li class="nav-item ">
                <a @click="$root.$emit('openFolder')" class="nav-link" v-bind:class="{ disabled: $route.name != 'home'}" href="#"><span class="oi oi-folder"></span> {{currentDir}}</a>
            </li>
            <li v-if="dirSelected" class="nav-item">
                <a class="nav-link disabled" href="#"><span class="oi oi-file"></span> {{currentFile}}</a>
            </li>
        </ul>
    </div>            
    
    <div v-if="$route.name == 'edit'" class="collapse navbar-collapse">
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">
                <a @click="$root.$emit('print')" class="nav-link" href="#"><span class="oi oi-print"></span></a>
            </li>
            <li class="nav-item">
                <a @click="$root.$emit('save')" class="nav-link" href="#"><span class="oi oi-hard-drive"></span></a>
            </li>
        </ul>
    </div>
</nav>
</template>

<script>
module.exports = {
    data: function(){
        return{
            currentDir: "Select Folder",
            currentFile: "Select File",
            version: null
        }
    },
    methods: {
        goHome: function(){
            if (this.$router.currentRoute.name=='edit'){
                if (!confirm("Möchten Sie die Seite wirklich verlassen?")) return
            }            
            this.$router.push('/');
        }
    },
    mounted: function(){
        this.$root.$on('currentDir', (e)=> this.currentDir = e.name);//root is used as event bus
        this.$root.$on('currentFile', (e)=> this.currentFile = e.name);//root is used as event bus
    },
    computed: {
        dirSelected: function () { return this.currentDir!="Select Folder"}
    }
}
</script>