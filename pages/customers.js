import Layout from "@/components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
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
        if (store) axios.get('/api/customers?store=' + store?._id).then(res => setCustomers(res.data));
    }, [store]);
    return (
        <Layout>
            <h1>Customers</h1>
            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Email</td>
                        <td>Phone</td>
                        <td>Address</td>
                    </tr>
                </thead>
                <tbody>
                    {customers.length > 0 && customers.map(customer => (
                        <tr key={customer._id}>
                            <td>{customer.name}</td>
                            <td>{customer.email}</td>
                            <td>{customer.phone}</td>
                            <td>{customer.address &&
                                (<p>{customer.address}, {customer.ward}, <br />
                                    {customer.district}, {customer.city}</p>)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    )
}