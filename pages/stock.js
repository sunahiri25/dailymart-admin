import Layout from "@/components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StockPage() {
    const [stock, setStock] = useState([]);
    const [store, setStore] = useState();
    const session = useSession();
    useEffect(() => {
        axios.get('/api/stores').then(res => {
            res.data.map(s => {
                if (s.manager?._id === session?.data?.user?._id) {
                    setStore(s);
                    axios.get('/api/stock?store=' + s?._id).then(res => setStock(res.data));
                }
            }
            );
        }
        );

    }, [session]);
    return (
        <Layout>
            <Link className="bg-blue-900 text-white py-1 px-2 rounded-md " href={'/stock/new'}>
                Add new stock
            </Link>
            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>Product</td>
                        <td>Quantity</td>
                        <td>Date</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {stock.length > 0 && stock.map(stock => (
                        <tr key={stock._id}>
                            <td>{stock.product?.title}</td>
                            <td>{stock.quantity}</td>
                            <td>{new Date(stock.date).toLocaleDateString('vi')}</td>
                            <td>
                                <Link className="bg-blue-900 text-white py-1 px-2 rounded-md " href={'/stock/' + stock._id}>
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    )
}