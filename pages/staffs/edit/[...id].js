import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import StaffForm from "@/components/StaffForm";

export default function EditStaffPage() {
    const [staffInfo, setStaffInfo] = useState(null);
    const router = useRouter();
    const { id } = router.query;
    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('/api/staffs?id=' + id).then(
            response => {
                setStaffInfo(response.data);
            }
        )
    }, [id]);

    return (
        <Layout>
            <h1>Edit Staff</h1>
            {staffInfo && (
                <StaffForm  {...staffInfo} />
            )}
        </Layout>
    )
}