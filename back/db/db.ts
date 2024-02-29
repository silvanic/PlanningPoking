import { CreateCollectionOptions, MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

export class MongoDatabase{
    client: MongoClient;    
    database: string;
    url:string;
    connected: boolean;

    constructor(url: string, database: string){
        this.client= new MongoClient();
        this.connected=false;
        this.database = database;
        this.url= url;
    }

    async connect(){
        if(this.url.length>0){
            await this.client.connect(this.url);
            this.connected= true;
        }
    }

    createCollection(name: string, options?:CreateCollectionOptions){
        if(this.isConnected()){
            this.client.database(this.database).createCollection(name,options);
        }
    }

    collection(name: string){
        if(this.isConnected()){
            return this.client.database(this.database).collection(name);
        } else {
            return null;
        }
    }

    insertIntoCollection(collection: string, value: any){
        if(this.isConnected()){
            this.client.database(this.database).collection(collection).insertOne(value);   
        }
    }

    isConnected(){
        return this.connected
    }
}