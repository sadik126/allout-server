const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 6060;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")('sk_test_51L4KKASJGWFrRQt8S52gYy6WthSEsKdsj67wZyiOElmubjBNiDSBOmRaTTarZq1M2WaVfaBjzkRUs8p6nOdEoql900FLAARsOJ');

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
        const ordercollection = client.db('productsallout').collection('orders')
        const paymentscollection = client.db('productsallout').collection('payments')

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


        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await ordercollection.insertOne(orders)
            res.send(result)
        })


        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await ordercollection.findOne(query)
            res.send(result)
        })

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentscollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: new ObjectId(id) }

            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transationId
                }
            }

            const updatedResult = await ordercollection.updateOne(filter, updatedDoc)

            res.send(result)
        })

        app.get('/orders', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = ordercollection.find(query)
            const orders = await cursor.toArray();
            res.send(orders)
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await ordercollection.deleteOne(filter)
            res.send(result)
        })



        app.post('/create-payment-intent', async (req, res) => {
            // const booking = req.body;
            // const price = booking.price;
            // const amount = price * 100;

            // const paymentIntent = await stripe.paymentIntents.create({
            //     currency: 'usd',
            //     amount: amount,
            //     "payment_method_types": [
            //         "card"
            //     ],


            // })

            // res.send({
            //     clientSecret: paymentIntent.client_secret,
            // });

            const booking = req.body;
            const total = booking.total;
            console.log(total)
            const amount = total * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'inr',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
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