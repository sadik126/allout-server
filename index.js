const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 6060;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

// pass:XzUq1rPkkLDLyCm0



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7pkvckk.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });


async function run() {
    try {
        const collection = client.db('productsallout').collection('products')

        app.get('/products', async (req, res) => {
            // console.log('query', req.query)
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)

            const query = {};
            const cursor = collection.find(query);
            let products;

            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            // const count = await collection.estimatedDocumentCount()
            res.send(products)
        })

        app.get('/productcount', async (req, res) => {
            const query = {};
            const cursor = collection.find(query)
            const count = await collection.estimatedDocumentCount()
            res.send({ count })
        })

    }
    finally {

    }
}

run().catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send('Running all out ecommerce')
})

app.listen(port, () => {
    console.log('running all out server')
})