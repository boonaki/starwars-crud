const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 8000
require('dotenv').config()
const connectionString = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@starwars-crud.xayzd.mongodb.net/?retryWrites=true&w=majority`

const MongoClient = require('mongodb').MongoClient

MongoClient.connect(connectionString, { useUnifiedTopology: true }) 
    .then(client => {
        console.log('connected to db')
        const db = client.db('starwars-crud')
        const quotesCollection = db.collection('quotes')
        app.set('view engine', 'ejs')
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(express.static('public'))
        app.use(bodyParser.json())

        //read
        app.get('/', (req,res) => {
            quotesCollection.find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results })
                })
                .catch(error => console.error(error))
        })

        //create
        app.post('/quotes', (req,res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    // console.log(result)
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })

        //update
        app.put('/quotes', (req,res) => {
            quotesCollection.findOneAndUpdate(
                { name: 'yoda'}, //query: lets us filter collection of key-value pairs
                {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                }, //update: tells mongodb what to change
                {
                    upsert: true
                }//options: tells mongodb to define additional options
            )
                .then(result => {
                    console.log(result)
                    res.json('Success')
                })
                .catch(error => console.error(error))
        })

        //delete
        app.delete('/quotes', (req,res) => {
            quotesCollection.deleteOne(
                { name: req.body.name},
                //options: dont need to change any options, so it is omitted
            )
            .then(result => {
                if( result.deletedCount === 0 ){
                    return res.json('no quote to delete')
                }
                res.json('Deleted Darth Vader quote')
            })
            .catch(error => console.error(error))
        })

        app.listen(PORT, () => {
            console.log(`server is now running on ${PORT}`)
        })
    })
    .catch(error => console.error(error))


