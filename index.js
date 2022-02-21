const express = require('express')
const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const port = 3000

let products = [
    {
        id: "0111",
        name: "ตุ๊กตาหมี",
        price: 200,
        category: "toy"
    }
]

let orders = {}

app.get('/api/v1/products', (req, res) => {
    if (req.query.q) {
        res.json({
            list: products.filter(p => p.name.includes(req.query.q))
        })
        return
    }

    res.json({
        list: products
    })
})

app.get('/api/v1/products/:id', (req, res) => {
    res.json(products.find(p => p.id === req.params.id))
})

app.post('/api/v1/order', (req, res) => {
    const {user_id, item_id} = req.body

    if (orders[user_id]) {
        let exist = orders[user_id].item_ids.find(i => i.id == item_id)
        if (exist) {
            exist.qty++
        } else {
            orders[user_id].item_ids.push({ id: item_id, qty: 1}) 
        }
    } else {
        orders[user_id] = {
            user_id,
            item_ids: [{id: item_id, qty:1}]
        }
    }
    
    res.status(201).json(orders[user_id])
})

app.post('/api/v1/order/payment', (req, res) => {
    const { user_id, payment_method } = req.body

    if (!user_id) {
        res.status(400).json({
            message: "user_id not found"
        })
        return
    }

    if (!orders[user_id]) {
        res.status(400).json({
            message: "order not found"
        })
        return
    }
    orders[user_id].fee = 0.00
    orders[user_id].price = orders[user_id].item_ids.map((item) => {
        let product = products.find(p => p.id ==item.id)
        return product.price * product.qty
    }).reduce((x,y) => x+y) + orders[user_id].delivery_price
    res.json(orders[user_id])
    delete orders[user_id]
})

app.post('/api/v1/order/address', (req, res) => {
    console.log("api/v1/order/address", req.body)
    const {postal_code,user_id} = req.body
    if (!user_id) {
        res.status(400).json({
            message: "user_id not found"
        })
        return
    }

    if (!orders[user_id]) {
        res.status(400).json({
            message: "order not found"
        })
        return
    }
    const delivery_vendor = req.body['delivery-vendor']

    orders[user_id].postal_code = postal_code

    if (delivery_vendor == 'line-man') {
        orders[user_id].delivery_price = 50
    }
    if (delivery_vendor == 'ems') {
        orders[user_id].delivery_price = 50
    }
    res.json(orders[user_id])
})


app.listen(port, () => {
    console.log(`Shopping Cart on port ${port}`)
})