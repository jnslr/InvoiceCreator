<template>
<div id="invoiceContainer" class="container-fluid" v-on:keyup.delete="deleteSelectedRows">       
            <div class="row mb-5 mt-3">
                <div class="col-sm-6">
                    <table style="width:100%;" ><tbody>
                        <tr><td><input class="input-unstyled" v-model="invoice.customer.company" placeholder="Firma"></td></tr>
                        <tr><td><input class="input-unstyled" v-model="invoice.customer.name" placeholder="Ansprechpartner"></td></tr>
                        <tr><td><input class="input-unstyled" v-model="invoice.customer.address" placeholder="Straße Nr."></td></tr>
                        <tr><td><input class="input-unstyled" v-model="invoice.customer.city" placeholder="Stadt"></td></tr>
                    </tbody></table>
                </div>
                <div class="col-sm-6">
                    <table class="ml-auto"><tbody>
                        <tr>
                            <td class="text-right font-weight-bolder" >Rechnungsnummer</td>
                            <td><input type="number" class="input-unstyled text-right" v-model="invoice.invoice.inv_number" placeholder="Rechnungsnummer"></td>
                        </tr>
                        <tr>
                            <td class="text-right font-weight-bolder">Rechnungsdatum</td>
                            <td><input type="date" class="input-unstyled text-right" v-model="invoice.invoice.inv_date" ></td>
                        </tr>
                        <tr>
                            <td class="text-right font-weight-bolder">Lieferdatum</td>
                            <td><input type="date" class="input-unstyled text-right" v-model="invoice.invoice.del_date"></td>
                        </tr>
                    </tbody></table>
                </div>
            </div>
            <div class="row mb-5">
                <div class="col-12 text-left">
                    <h2 class="font-weight-bold">Rechnung</h2>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-12 text-left">
                    <p>Vielen Dank für Ihren Auftrag. Wir berechnen Ihnen folgende Lieferung bzw. Leistung:</p>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-12 text-left">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" class="align-middle" style="width:60%">Bezeichnung</th>
                                <th scope="col" class="align-middle text-center" style="width:10%">Menge/<br>Stunden</th>
                                <th scope="col" class="align-middle text-center" style="width:15%">Stückpreis/<br>Stundensatz</th>
                                <th scope="col" class="align-middle text-right" style="width:15%">Gesamt</th>
                            </tr>
                        </thead>
                        <tbody id="items">
                            <tr  @click="selectRow" v-for="(item,index) in invoice.items" style="cursor:pointer">
                                <td>                                    
                                    <input @click.stop class="input-table" v-model="item.description" placeholder="Bezeichnung" style="width:100%;"></input>
                                </td>
                                <td class="text-center">
                                    <input @click.stop type="number" step="1" class="input-table" v-model.number="item.quantity" placeholder="Menge" style="width:100%;text-align:center;"></input>
                                </td>
                                <td class="px-0">
                                    <input @change="costChange(item)" @click.stop type="number" step=".50" value='0.00' pattern="[0-9]+([,][0-9]+)?" class="input-table" v-model.number="item.cost" placeholder="Stundensatz" style="width:50%;display:inline-block;text-align:right;"></input>
                                    <div style="width:40%;display:inline-block;text-align:left"> €</div>
                                </td>
                                <td class="text-right">                                    
                                    {{ formatNumber(item.quantity * item.cost) }} €
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button id="btnAddRow" class="btn btn-primary" @click="addRow">+</button>
                </div>
            </div>
            <div class="row mb-5">
                <div class="col-8"></div>
                <div class="col-4">
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Rechnungsbetrag</th>
                                <th scope="col">{{formatNumber(invoice_total)}} €</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-12 text-left">
                    <p>
                    Zahlbar innerhalb von 14 Tagen nach Erhalt der Rechnung.<br>
                    Ich bedanke mich für Ihren Auftrag und freue mich auf die weitere Zusammenarbeit.
                    </p>
                    <p class="text-muted font-weight-bold">
                    Gemäß § 19 Abs. 1 UStG wird keine Umsatzsteuer berechnet.
                    </p>
                </div>
            </div>
        
            <div class="row fixed-bottom">
                <div class="container-fluid">
                    <div class="row text-muted">
                        <div class="col-4 text-left"><ul class="list-unstyled">
                            <li>{{settings.UserName}}</li>
                            <li>{{settings.UserStreet}}</li>
                            <li>{{settings.UserZip}}</li>
                        </ul></div>
                        <div class="col-4 text-center"><ul class="list-unstyled">
                            <li>{{settings.UserMail}}</li>
                            <li>{{settings.UserPhone}}</li>
                        </ul></div>
                        <div class="col-4 text-right"><ul class="list-unstyled">
                            <li>{{settings.UserIBAN}}</li>
                            <li>{{settings.UserBIC}}</li>
                            <li>{{settings.UserTaxNumber}}</li>
                        </ul></div>
                    </div>
                </div>         
            </div>
        </div>
</template>

<script>
module.exports = {
    data: function(){
        
        var itemImportSchema = joi.object({
            description: joi.string(),
            quantity: joi.number().min(0).precision(2),
            cost: joi.number().min(0).precision(2)
        });
        var itemExportSchema = itemImportSchema.fork(['description','quantity','cost'],it=>it.required()).required();

        var importSchema = joi.object({
            customer: joi.object({
                company: joi.string(),
                name: joi.string(),
                address: joi.string(),
                city: joi.string()
            }),            
            invoice: joi.object({
                inv_number: joi.number().integer(),
                inv_date: joi.date().iso().raw().max('now'),
                del_date: joi.date().iso().raw().max('now')
            }),
            items: joi.array().items(itemImportSchema)
        });

        var exportSchema = importSchema.fork(
            [  'customer',
               'customer.company',
               'customer.name',
               'customer.address',
               'customer.city',
               'invoice',
               'invoice.inv_number',
               'invoice.inv_date',
               'invoice.del_date',
            ],
            schema=>schema.required()
        )
        exportSchema = exportSchema.fork('items',it=>joi.array().items(itemExportSchema)); //override old items definition

        return {
            handle: null,
            invoice: {
                customer: {
                    name: null,
                    company: null,
                    address: null,
                    city: null
                },
                invoice: {
                    inv_number: null,
                    inv_date: null,
                    del_date: null
                },
                items: []
            },
            importSchema: importSchema, //Schema for importing/reading from file
            exportSchema: exportSchema, //Schema for saving to file,
            settings: {}
        }
      },
    computed: {
        invoice_total: function(){
            let sum = 0;
            this.invoice.items.forEach((item)=>{
                sum += item.cost*item.quantity;
            });
            return sum
        }
    },
    methods: {
        save: async function(){
            if (this.verify()){
                writable = await this.handle.createWritable();
                await writable.write(JSON.stringify(this.invoice))
                await writable.close()
                console.log('Contents saved');
                Swal.fire({
                    icon: 'success',
                    title: 'Data saved',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500
                  })
            }
        },
        print(){
            if (this.verify())
                window.print();
        },
        verify(){
            let res = this.exportSchema.validate(this.invoice,{stripUnknown:true,abortEarly:false});
            console.log(res);
            if (res.error){
                console.log(res.error.message);
                var text ='';
                res.error.details.forEach(err => {
                    text+=err.message+'<br>';
                });
                Swal.fire({
                    icon: 'error',
                    title: 'Error while saving: ',
                    html: text,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 5000
                })
                return false               
            }
            else {
                console.log('validation success')
                return true
            }
        },
        addRow: function(){
            this.invoice.items.push({});
        },
        formatNumber(num){
            return String(num.toFixed(2)).replace(/\./g,","); //Format 8.4 to 8,40
        },
        costChange(item){
            //console.log(item.cost);
            item.cost = item.cost.toFixed(2);
        },
        selectRow(e){
            //console.log(e);
            var targetRow = e.target.closest('tr');
            var css_selected = 'table-primary';

            if (e.ctrlKey)
                targetRow.classList.toggle(css_selected);
            else{                
                var tableRows = targetRow.closest('tbody').querySelectorAll('tr');
                tableRows.forEach(row => {
                    if (row != targetRow)
                        row.classList.remove(css_selected)
                    else
                        row.classList.toggle(css_selected)
                })
            }           
        },
        deleteSelectedRows(e){
            document.getElementById('items').querySelectorAll('tr').forEach((tr,i)=>{
                if(tr.classList.contains('table-primary')){
                    delete this.invoice.items[i]; //Remove at pos i
                    console.log('row to remove:',i)
                }
                tr.classList.remove('table-primary'); // remove this for all rows
            })
            this.invoice.items = this.invoice.items.filter(it=>it!=null);
        },
        keyDownHandler(e){
            if (e.ctrlKey && e.key.toLowerCase()=='s'){
                e.preventDefault();
                this.$root.$emit('save');
            }
        },
        keyUpHandler(e){
            if (e.key=='Delete')
            this.deleteSelectedRows();
        },
        loadSettings(){
            let transaction = app.db.transaction(["Settings"], "readonly");
            let request = transaction.objectStore("Settings").openCursor();
            request.onsuccess = (e) => {
                let cursor = e.target.result;
                if (cursor) {
                    console.log(cursor.primaryKey, cursor.value);
                    this.settings[cursor.primaryKey] = cursor.value;
                    cursor.continue();
                }
                else{
                    this.$forceUpdate(); 
                }
            }
        }
    },
    created: function () {
        this.$root.$on('print', this.print);//root is used as event bus
        this.$root.$on('save', this.save);

        this.handle = this.$route.params.handle;
        if(!this.handle){
            this.$router.push('/');
            return
        }
        this.handle.requestPermission().then ( async perm => {
            if(perm != 'granted'){
              console.log(`Access to ${this.handle.name} denied`);
              return
            }
            console.log('access granted to ', this.handle.name);
            //console.log(this.schema.describe());
            this.$root.$emit('currentFile',this.handle);
            this.handle.getFile()
            .then( file => file.text() )
            .then( text => JSON.parse(text) )
            .catch(() => {} ) //Return empty object if JSON parsing fails
            .then( obj  => _.merge(this.invoice,obj) ) //use lodash to deep-merge object 
            .then( merg => joi.attempt(merg,this.importSchema,{stripUnknown:true,abortEarly:false}) )
            .then( res  => {
                console.log('Import Result: ',res);
                res.items.forEach(it=>{
                    it.cost = it.cost.toFixed(2);
                });
                this.invoice = res;
            })
            .catch((e,v)=> {
                console.log(e,v);
                var text ='';
                e.details.forEach(err => {
                    text+=err.message+'<br>';
                });
                Swal.fire({
                    icon: 'error',
                    title: 'ImportError: ',
                    html: text,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 5000
                })
            })
        })

        document.addEventListener ("keyup", this.keyUpHandler);
        document.addEventListener ("keydown", this.keyDownHandler);
        this.loadSettings();
    },
    destroyed: function(){
        document.removeEventListener("keyup",this.keyUpHandler);
        document.removeEventListener("keydown",this.keyDownHandler);
    }
}
</script>