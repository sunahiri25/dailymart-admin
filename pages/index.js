import Layout from "@/components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
export default function Home() {
  const session = useSession();
  const [orders, setOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [weekOrders, setWeekOrders] = useState(0);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const [weekProfit, setWeekProfit] = useState(0);
  const [store, setStore] = useState();

  useEffect(() => {
    async function fetchDashboardData() {
      if (store) {
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const ordersResponse = await fetch("/api/orders?store=" + store?._id);
          const ordersData = await ordersResponse.json();
          const todayOrders = ordersData.filter(order => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          });
          setOrders(todayOrders.length);
          setRevenue(todayOrders.reduce((acc, cur) => acc + cur.total, 0));

          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekOrdersData = ordersData.filter(order => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate >= weekStart;
          });
          setWeekOrders(weekOrdersData.length);
          setWeekRevenue(weekOrdersData.reduce((acc, cur) => acc + cur.total, 0));
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      }
    };
    fetchDashboardData();
  }, [store]);
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
  return (
    <Layout>
      <div className="text-blue-900 flex justify-between">
        <h2>Hello, <b>{session?.data?.user?.email}</b>!</h2>
        <h2>Store: <b>{store?.name}</b></h2>
        <div className="flex bg-gray-300 text-black gap-1 rounded-lg overflow-hidden flex-row">
          {session?.data?.user?.image && <img src={session?.data?.user?.image} alt={session?.data?.user?.name} className="w-6 h-6" />}
          {!session?.data?.user?.image && <img src='/avt.jpg' alt={session?.data?.user?.name} className="w-6 h-6" />}
          {session?.data?.user?.name &&
            <span className="px-2">
              {session?.data?.user?.name.split(' ')[0]}
            </span>}
        </div>
      </div>
      <h1 className='font-bold my-2'>Welcome to DailyMart Admin 👋</h1>
      <h1 className='text-black'>Today</h1>
      <div className="grid justify-between gap-3 mt-4 grid-cols-3">
        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center">
          <h4 className="uppercase text-gray-700 text-xl">Orders</h4>
          <p className="text-blue-900 p-4 text-2xl">{orders}</p>
        </div>

        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center ">
          <h4 className="uppercase text-gray-700 text-xl">Revenue</h4>
          <p className="text-blue-900 p-4 text-2xl">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue)}</p>
        </div>
        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center ">
          <h4 className="uppercase text-gray-700 text-xl">Profit</h4>
          <p className="text-blue-900 p-4 text-2xl">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profit)}</p>
        </div>
      </div>
      <h1 className='text-black mt-8'>This Week</h1>
      <div className="grid justify-between gap-3 mt-4 grid-cols-3">
        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center">
          <h4 className="uppercase text-gray-700 text-xl">Orders</h4>
          <p className="text-blue-900 p-4 text-2xl">{weekOrders}</p>
        </div>

        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center ">
          <h4 className="uppercase text-gray-700 text-xl">Revenue</h4>
          <p className="text-blue-900 p-4 text-2xl">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(weekRevenue)}</p>
        </div>
        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center ">
          <h4 className="uppercase text-gray-700 text-xl">Profit</h4>
          <p className="text-blue-900 p-4 text-2xl">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(weekProfit)}</p>
        </div>
      </div>
    </Layout>
  );
}
