import { CreateCollectionOptions, MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

export class MongoDatabase{
    client: MongoClient;    
    database: string;
    url:string;

    constructor(url: string, database: string){
        this.client= new MongoClient();
        this.database = database;
        this.url= url;
    }

    async connect(){
        await this.client.connect(this.url);
    }

    createCollection(name: string, options?:CreateCollectionOptions){
        this.client.database(this.database).createCollection(name,options);
    }

    collection(name: string){
        return this.client.database(this.database).collection(name);
    }

    insertIntoCollection(collection: string, value: any){
        this.client.database(this.database).collection(collection).insertOne(value);
    }
}