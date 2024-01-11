import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handler(req, res) {
    await mongooseConnect();
    await isAdminRequest(req, res)
    if (req.method === 'GET') {
        if (req.query?.store) {
            res.json(await Order.find({ store: req.query.store }).sort({ createdAt: -1 }));
        } else {
            res.json(await Order.find({}).sort({ createdAt: -1 }));
        }
    }
}