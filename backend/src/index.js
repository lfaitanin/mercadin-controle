import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET ?? 'super‑secret'

function auth(req, res, next) {
  const h = req.headers.authorization ?? ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  try { req.user = jwt.verify(token, JWT_SECRET); next() }
  catch { return res.status(401).json({error:'unauthorized'}) }
}

app.post('/auth/register', async (req,res)=>{
  const {email,password} = req.body
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.users.create({data:{email,password_hash:hash}})
  const token = jwt.sign({id:user.id}, JWT_SECRET)
  res.status(201).json({token})
})

app.post('/auth/login', async (req,res)=>{
  const {email,password} = req.body
  const user = await prisma.users.findUnique({where:{email}})
  if(!user || !await bcrypt.compare(password,user.password_hash))
    return res.status(401).json({error:'invalid'})
  const token = jwt.sign({id:user.id}, JWT_SECRET)
  res.json({token})
})

app.get('/barcode/:ean', auth, async (req,res)=>{
  const {ean} = req.params
  let product = await prisma.products.findUnique({where:{ean}})
  if(!product){
    // tenta OpenFoodFacts
    try{
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${ean}.json`)
      const j = await r.json()
      if(j.status===1) {
        const name = j.product.product_name ?? 'Produto'
        product = await prisma.products.create({data:{ean,name}})
      }
    }catch{}
  }
  if(!product) return res.status(404).json({error:'not found'})
  res.json(product)
})

app.post('/purchases', auth, async (req,res)=>{
  const {ean,name,price,quantity=1} = req.body
  let product = null
  if(ean){
    product = await prisma.products.findUnique({where:{ean}})
    if(!product) product = await prisma.products.create({data:{ean,name:name??'Produto'}})
  } else {
    product = await prisma.products.create({data:{name}})
  }
  const purchase = await prisma.purchases.create({
    data:{user_id:req.user.id, product_id:product.id, price, quantity}
  })
  res.status(201).json(purchase)
})

app.get('/purchases', auth, async (req,res)=>{
  const limit = Number(req.query.limit ?? 30)
  const data = await prisma.purchases.findMany({
    where:{user_id:req.user.id},
    orderBy:{purchased_at:'desc'},
    take:limit,
    include:{products:true}
  })
  res.json(data)
})

app.get('/stats/monthly', auth, async (req,res)=>{
  const year = Number(req.query.year ?? new Date().getFullYear())
  const rows = await prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM purchased_at) AS mes,
           SUM(price*quantity)::numeric(10,2) AS total
    FROM purchases
    WHERE user_id = ${req.user.id}
      AND EXTRACT(YEAR FROM purchased_at) = ${year}
    GROUP BY mes ORDER BY mes`
  res.json(rows)
})

app.post('/shopping', auth, async (req, res) => {
    const { items, store } = req.body;  
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'Nenhum item enviado' })
  
    // Cria ou encontra os produtos
    const productIds = []
    for (const item of items) {
      let product = null
      if (item.ean) {
        product = await prisma.products.findUnique({ where: { ean: item.ean } })
        if (!product) product = await prisma.products.create({ data: { ean: item.ean, name: item.name ?? 'Produto' } })
      } else {
        product = await prisma.products.create({ data: { name: item.name } })
      }
      productIds.push({ ...item, product_id: product.id })
    }
  
    // Cria a compra (Shopping) e os itens
    const shopping = await prisma.shopping.create({
      data: {
        user_id: req.user.id,
        store,
        items: {
          create: productIds.map(item => ({
            product_id: item.product_id,
            price: item.price,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    })
  
    res.status(201).json(shopping)
  })

app.get('/shopping', auth, async (req, res) => {
  const data = await prisma.shopping.findMany({
    where: { user_id: req.user.id },
    orderBy: { created_at: 'desc' },
    include: {
      items: {
        include: { product: true }
      }
    }
  })
  // Calcula total de cada compra
  const result = data.map(s => ({
    ...s,
    total: s.items.reduce((acc, i) => acc + Number(i.price) * Number(i.quantity), 0)
  }))
  res.json(result)
})

app.get('/shopping/:id', auth, async (req, res) => {
  const shopping = await prisma.shopping.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: { product: true }
      }
    }
  })
  if (!shopping || shopping.user_id !== req.user.id) return res.status(404).json({ error: 'not found' })
  res.json(shopping)
})

app.listen(3000)
app.use(cors());