import { abi } from 'abi.js';
import { configDotenv } from 'dotenv';
import { ethers } from 'ethers';
import { writeFile, readFile } from 'node:fs';
var express = require('express');
var app = express();
const port = 8084;
configDotenv();

app.get('/:identifier', async function (req, res) {    
    res.send(
        await readMetadata(
            req.params.identifier.split('/')[req.params.identifier.split('/').length - 1].split(".")[0]
        )
    );
});


type MetadataChange = {
    parent: string;
    child: string;
    childIdentifier: string;
    parentIdentifier: string;
    parentFormerIdentifier: string;
};

const provider = new ethers.providers.WebSocketProvider(
    `wss://sepolia.infura.io/ws/v3/${process.env.api}`
);

const deployedAddress = '0xc5724A96440102879f5e8084e1640120F5E72cFD';
const ulsOperator = new ethers.Contract(deployedAddress, abi, provider);
ulsOperator.on('AddChild', metadataChanged);

let changeBuffer: MetadataChange[] = [];

function metadataChanged(
    parent: string,
    child: string,
    childIdentifier: string,
    parentIdentifier: string,
    parentFormerIdentifier: string
) {
    console.log(
        `+ Metadata change:\nParent: ${parent}\nChild: ${child}\nChildIdentifier: ${childIdentifier}\nParentIdentifier: ${parentIdentifier}`
    );
    changeBuffer.push({
        parent,
        child,
        childIdentifier,
        parentIdentifier,
        parentFormerIdentifier,
    });
}

function updateMetadatas() {
    console.log(`* Updating metadatas...`);
    for (let i = 0; i < changeBuffer.length; i++) {
        const change = changeBuffer[i];
        applyChange(change);
    }
    console.log(`* Updated metadatas\n`);
    changeBuffer = [];
}

function readMetadata(identifier: string): Promise<any> {
    return new Promise((resolve, reject) => {
        readFile(
            `./metadatas/${
                identifier.split('/')[identifier.split('/').length - 1]
            }.json`,
            'utf-8',
            (err, data) => {
                resolve(JSON.parse(data));
            }
        );
    });
}

function getExampleMetadata() {
    return {
        description: '',
        image: '',
        name: '',
        properties: {
            children: [],
        },
    };
}

async function isEmptyMetadata(identifier: string): Promise<boolean>{
    return (await readMetadata(identifier)).name === '';
}

async function applyChange(change: MetadataChange) {
    const currentMetadata = await readMetadata(change.parentFormerIdentifier); 
    currentMetadata.properties.children.push(change.child);
    writeFile(
        `./metadatas/${
            change.parentIdentifier.split('/')[
                change.parentIdentifier.split('/').length - 1
            ]
        }`,
        JSON.stringify(currentMetadata),
        (data) => {}
    );
    let childMetadata = getExampleMetadata();
    writeFile(
        `./metadatas/${
            change.childIdentifier.split('/')[
                change.childIdentifier.split('/').length - 1
            ]
        }`,
        JSON.stringify(childMetadata),
        (data) => {}
    );
}

setInterval(updateMetadatas, 10000);
app.listen(port);
console.log(`app started...`);