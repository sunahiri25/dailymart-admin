import { mongooseConnect } from "@/lib/mongoose";
import { UserInfo } from "@/models/UserInfo";
import { isAdminRequest } from "./auth/[...nextauth]";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
    await mongooseConnect();
    await isAdminRequest(req, res)
    if (req.method === 'GET') {
        if (req.query?.store) {
            const orders = await Order.find({ store: req.query.store }).sort({ createdAt: -1 });
            const customers = [];
            for (const order of orders) {
                if (!customers.includes(order.email)) {
                    customers.push(order.email);
                }
            }
            res.json(await UserInfo.find({ email: { $in: customers } }).sort({ createdAt: -1 }));
        } else {
            res.json(await UserInfo.find({ role: 'customer' }).sort({ createdAt: -1 }));
        }
    }
}