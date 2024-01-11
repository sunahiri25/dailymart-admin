import Layout from "@/components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Select from 'react-select';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

export default function NewStock() {
    const [store, setStore] = useState();
    const [product, setProduct] = useState();
    const [quantity, setQuantity] = useState();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const router = useRouter();
    const [optionListProducts, setOptionListProducts] = useState([]);


    const session = useSession();
    useEffect(() => {
        axios.get('/api/stores').then(res => {
            res.data.map(store => {
                if (store.manager?._id === session?.data?.user?._id) {
                    setStore(store);
                    axios.get('/api/products').then(res => {
                        if (res.data.length > 0) {
                            const optionListProduct = res.data.map(product => (
                                {
                                    value: product._id,
                                    label: product.title
                                }))
                            setOptionListProducts(optionListProduct);
                        };
                    })
                }
            }
            );
        }
        );
    }, [session]);
    function saveStock(e) {
        e.preventDefault();
        axios.post('/api/stock', {
            product,
            quantity,
            date,
            store: store._id
        }).then(res => {
            toastr.success(`Stock added!`, 'Success', { timeOut: 2000 })
            router.push('/stock');
        });
    }

    return (
        <Layout>
            <h1>New Stock</h1>
            <form onSubmit={saveStock}>
                <label>Product</label>
                <Select options={optionListProducts} placeholder='Select product' value={optionListProducts.find(option => option.value === product)} onChange={e => setProduct(e.value)} />
                <label>Quantity</label>
                <input type="number" placeholder="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                <label>Date</label>
                <input type="date" placeholder="date" value={date} onChange={e => setDate(e.target.value)} required />
                <button className="btn-primary">Save</button>
            </form>
        </Layout>
    )
}