import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function OrderInfoPage() {
    const router = useRouter();
    const { id } = router.query;
    const [orderInfo, setOrderInfo] = useState();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Perform form submission logic here
    };

    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get("/api/orders/?id=" + id).then((response) => {
            if (!response.data) {
                router.push("/orders");
            } else {
                setOrderInfo(response.data);
            }
        });
    }, [id]);

    return (
        <Layout>
            <h1>Order {id}</h1>
            <form>
                <label>Customer name:</label>
                <input type="text" value={orderInfo?.name} disabled />
                <label>Email:</label>
                <input type="email" value={orderInfo?.email} disabled />
                <label>Phone:</label>
                <input type="tel" value={orderInfo?.phone} disabled />
                {orderInfo?.address && (
                    <>
                        <label>Address:</label>
                        <input type="text" value={orderInfo?.address + ', ' + orderInfo?.ward + ', ' + orderInfo?.district + ', ' + orderInfo?.city} disabled />

                    </>
                )}

            </form>
        </Layout>
    );
}