import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

export default function DeleteStaffPage() {
    const router = useRouter();
    const [staffInfo, setStaffInfo] = useState();
    const { id } = router.query;
    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('/api/staffs?id=' + id).then(response => {
            if (!response.data) {
                router.push('/staffs');
            } else {
                setStaffInfo(response.data);
            }
        })
    }, [id]);
    function goBack() {
        router.push('/staffs');
    }
    async function deleteStaff() {
        await axios.delete('/api/staffs/?id=' + id);
        toastr.success(`Staff deleted!`, 'Success', { timeOut: 2000 })
        goBack();
    }
    return (
        <Layout>
            <h1 className="text-center">Do you really want to delete staff <b>{staffInfo?.name}</b>?</h1>
            <div className="flex gap-2 justify-center">
                <button className="btn-red" onClick={deleteStaff}>Yes</button>
                <button className="btn-default" onClick={goBack}>No</button>
            </div>
        </Layout>
    )
}