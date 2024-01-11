import { mongooseConnect } from "@/lib/mongoose";
import { Stock } from "@/models/Stock";
import { isAdminRequest } from "./auth/[...nextauth]";
import { Store } from "@/models/Store";

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(req, res)

    if (method === 'GET') {
        if (req.query?.store) {
            res.json(await Stock.find({ store: req.query?.store }).populate('product').sort({ date: -1 }));
        }
        if (req.query?.id) {
            res.json(await Stock.findOne({ _id: req.query.id }));
        }
    }

    if (method === 'POST') {
        const { store, product, quantity, date } = req.body;
        if (Store.findOne({ product, store })) {
            res.status(400).json({ message: 'Stock already exists' });
            return;
        }
        const stockDoc = await Stock.create({
            store,
            product,
            quantity,
            date,
        });
        res.json(stockDoc);
    }

    if (method === 'PUT') {
        const { store, product, quantity, date, _id } = req.body;
        const stockDoc = await Stock.updateOne({ _id }, {
            store,
            product,
            quantity,
            date,
        });
        res.json(stockDoc);
    }
}