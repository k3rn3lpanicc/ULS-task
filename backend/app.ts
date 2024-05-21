import { abi } from 'abi.js';
import { configDotenv } from 'dotenv';
import {ethers} from 'ethers';
import {writeFile} from 'node:fs';
configDotenv();

type MetadataChange = {
    parent: string,
    child: string,
    childIdentifier: string,
    parentIdentifier: string
}

const provider = new ethers.providers.WebSocketProvider(
    `wss://sepolia.infura.io/ws/v3/${process.env.api}`
);

const deployedAddress = '0x4319Da6D5641f93c607e6f903cD00cB55773E1bC';
const ulsOperator = new ethers.Contract(deployedAddress, abi, provider);
ulsOperator.on('AddChild', metadataChanged);

let changeBuffer: MetadataChange[] = [];

function metadataChanged(parent: string, child: string, childIdentifier: string, parentIdentifier: string){
    console.log(`+ Metadata change:\nParent: ${parent}\nChild: ${child}\nChildIdentifier: ${childIdentifier}\nParentIdentifier: ${parentIdentifier}`)
    changeBuffer.push({parent, child, childIdentifier, parentIdentifier});
}

function updateMetadatas(){
    console.log(`* Updating metadatas...`)
    for(let i = 0; i < changeBuffer.length; i++){
        const change = changeBuffer[i];
        applyChange(change);
    }
    console.log(`* Updated metadatas\n`);
    changeBuffer = [];
}

function applyChange(change: MetadataChange){
    const toWrite = "salam";
    writeFile(
        `./metadatas/${
            change.parentIdentifier.split('/')[
                change.parentIdentifier.split('/').length - 1
            ]
        }`,
        toWrite, (data) => console.log
    );
}

setInterval(updateMetadatas, 30000);
console.log(`app started...`)