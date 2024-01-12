import Layout from "@/components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [store, setStore] = useState();
    const session = useSession();
    useEffect(() => {
        axios.get('/api/stores').then(res => {
            res.data.map(s => {
                if (s.manager && s.manager?._id === session?.data?.user?._id) {
                    setStore(s);
                }
            }
            );
        }
        );
    }, [session]);
    useEffect(() => {
        if (store) axios.get('/api/orders?store=' + store?._id).then(res => setOrders(res.data));
    }, [store]);

    return (
        <Layout>
            <h1>Orders</h1>
            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>Date</td>
                        <td>Payment</td>
                        <td>Paid</td>
                        <td>Total</td>
                        <td>Recipient</td>
                        <td>Products</td>
                        <td>Process</td>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 && orders.map(order => (
                        <tr key={order._id}>
                            <td>{(new Date(order.createdAt)).toLocaleString()}</td>
                            <td className="text-center">{order.paymentMethod}</td>
                            <td className={order.paid ? "text-green-600 text-center" : "text-red-600 text-center"}>{order.paid ? 'YES' : 'NO'}</td>
                            <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</td>
                            <td>
                                {order.name} {order.email}<br />
                                {order.phone} <br />
                                {order.address && (
                                    <>
                                        {order.address}, {order.ward}, {order.district}, {order.city}
                                    </>
                                )}

                            </td>
                            <td>
                                {
                                    order.address && (
                                        <>{order.line_items.slice(0, order.line_items.length - 1).map(key => (
                                            <p key={key.price_data.product_data.id}>
                                                {key.price_data.product_data?.name} <b>x{key.quantity}</b>
                                            </p>
                                        ))}</>
                                    )
                                }
                                {
                                    !order.address && (
                                        <>{order.line_items.map(key => (
                                            <p key={key.price_data.product_data.id}>
                                                {key.price_data.product_data?.name} <b>x{key.quantity}</b>
                                            </p>
                                        ))}</>
                                    )
                                }
                            </td>
                            <td>
                                {order.processing}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    )
}