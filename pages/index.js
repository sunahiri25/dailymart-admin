import Layout from "@/components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Chart } from "chart.js";

export default function Home() {
  const session = useSession();
  const [orders, setOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [weekOrders, setWeekOrders] = useState(0);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const [weekProfit, setWeekProfit] = useState(0);
  const [monthOrders, setMonthOrders] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);

  const [store, setStore] = useState();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/products').then(res => {
      setProducts(res.data);
    });
  }, []);

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
            return orderDate.getTime() === today.getTime() && (order.paid || order.paymentMethod === 'cod');
          });
          setOrders(todayOrders.length);
          setRevenue(todayOrders.reduce((acc, cur) => acc + cur.total, 0));

          let cost = 0;
          for (let i = 0; i < todayOrders.length; i++) {
            for (let j = 0; j < todayOrders[i].line_items.length; j++) {
              const product = products.find(p => p._id === todayOrders[i].line_items[j].price_data.product_data.id);
              if (product === undefined) {
                cost += todayOrders[i].line_items[j].price_data.unit_amount
              } else {
                cost += (product.purchasePrice + todayOrders[i].line_items[j].price_data.vat) * todayOrders[i].line_items[j].quantity;
              }
            }
          }
          setProfit(todayOrders.reduce((acc, cur) => acc + cur.total, 0) - cost);
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekOrdersData = ordersData.filter(order => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate >= weekStart && (order.paid || order.paymentMethod === 'cash');
          });
          setWeekOrders(weekOrdersData.length);
          setWeekRevenue(weekOrdersData.reduce((acc, cur) => acc + cur.total, 0));

          let weekCost = 0;
          for (let i = 0; i < weekOrdersData.length; i++) {
            for (let j = 0; j < weekOrdersData[i].line_items.length; j++) {
              const product = products.find(p => p._id === weekOrdersData[i].line_items[j].price_data.product_data.id);
              if (product === undefined) {
                weekCost += weekOrdersData[i].line_items[j].price_data.unit_amount
              } else {
                weekCost += (product.purchasePrice + weekOrdersData[i].line_items[j].price_data.vat) * weekOrdersData[i].line_items[j].quantity;
              }
            }
          }
          setWeekProfit(weekOrdersData.reduce((acc, cur) => acc + cur.total, 0) - weekCost);
          console.log(weekOrdersData);
          const monthStart = new Date();
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          const monthOrdersData = ordersData.filter(order => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate >= monthStart && (order.paid || order.paymentMethod === 'cash');
          });
          setMonthOrders(monthOrdersData.length);
          setMonthRevenue(monthOrdersData.reduce((acc, cur) => acc + cur.total, 0));

          let monthCost = 0;
          for (let i = 0; i < monthOrdersData.length; i++) {
            for (let j = 0; j < monthOrdersData[i].line_items.length; j++) {
              const product = products.find(p => p._id === monthOrdersData[i].line_items[j].price_data.product_data.id);
              if (product === undefined) {
                monthCost += monthOrdersData[i].line_items[j].price_data.unit_amount
              } else {
                monthCost += (product.purchasePrice + monthOrdersData[i].line_items[j].price_data.vat) * monthOrdersData[i].line_items[j].quantity;
              }
            }
          }
          setMonthProfit(monthOrdersData.reduce((acc, cur) => acc + cur.total, 0) - monthCost);

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
      <h1 className='text-black mt-8'>This Month</h1>
      <div className="grid justify-between gap-3 mt-4 grid-cols-3">
        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center">
          <h4 className="uppercase text-gray-700 text-xl">Orders</h4>
          <p className="text-blue-900 p-4 text-2xl">{monthOrders}</p>
        </div>

        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center ">
          <h4 className="uppercase text-gray-700 text-xl">Revenue</h4>
          <p className="text-blue-900 p-4 text-2xl">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(monthRevenue)}</p>
        </div>
        <div className="border bg-gray-200 px-6 py-3 font-bold rounded shadow-lg text-center ">
          <h4 className="uppercase text-gray-700 text-xl">Profit</h4>
          <p className="text-blue-900 p-4 text-2xl">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(monthProfit)}</p>
        </div>
      </div>

    </Layout>
  );
}
