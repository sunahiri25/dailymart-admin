import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { withSwal } from "react-sweetalert2";
function Categories({ swal }) {
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState('');
    const [vat, setVat] = useState('');
    const [categories, setCategories] = useState([]);
    const [showMore, setShowMore] = useState(1);

    const [editedCategory, setEditedCategory] = useState(null);
    useEffect(() => {
        fetchCategories();
    }, []);
    useEffect(() => {
        axios.get('/api/categories?id=' + parentCategory).then(res => {
            setVat(res.data.vat);
        })
    }, [parentCategory]);
    function fetchCategories() {
        axios.get('/api/categories').then(res => {
            setCategories(res.data);
        })
    };
    function handleShowMore() {
        setShowMore(showMore + 1);
    }

    function handleShowLess() {
        setShowMore(1);
    }
    async function saveCategory(e) {
        e.preventDefault();
        const data = { name, parentCategory, vat };
        if (editedCategory) {
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);
            setEditedCategory(null);
            toastr.success(`Category ${name} updated!`, 'Success', { timeOut: 2000 })

        } else {
            await axios.post('/api/categories', data);
            toastr.success(`Category ${name} created!`, 'Success', { timeOut: 2000 })
        };
        setName('');
        setParentCategory('');
        setVat('');
        fetchCategories();
    };
    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id || '');
        setVat(category.vat);
    };

    function deleteCategory(category) {
        swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete category ${category.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: "#d55",
            reverseButtons: true,
        }).then(async result => {
            if (result.isConfirmed) {
                const { _id } = category;
                axios.delete('/api/categories?_id=' + _id)
                swal.fire('Deleted!', `Category ${category.name} has been deleted.`, 'success');
                fetchCategories();
            }
        })

    };

    return (
        <Layout>
            <h1>Categories</h1>
            <label>{editedCategory ? `Edit category ${editedCategory.name}` : "New category name "}</label>
            <form onSubmit={saveCategory} className="flex gap-1">
                <input className='mb-0' type="text" placeholder={"Category name"} value={name} onChange={e => setName(e.target.value)} required />
                <select className="mb-0" onChange={e => setParentCategory(e.target.value)} value={parentCategory}>
                    <option value='' >No parent category</option>
                    {categories.length > 0 &&
                        categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))
                    }
                </select>
                <input className='mb-0' type="number" placeholder={"VAT"} value={vat} onChange={e => setVat(e.target.value)} />
                <button className="btn-primary py-1 " type="submit">Save</button>
            </form>

            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>Category Name</td>
                        <td>Parent Category</td>
                        <td>VAT (%)</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {categories.slice(0, showMore * 10 < categories.length ? showMore * 10 : categories.length).map(category => (
                        <tr key={category._id}>
                            <td>{category.name}</td>
                            <td>{category?.parent?.name}</td>
                            <td>{category.vat}</td>
                            <td>
                                <button onClick={() => editCategory(category)} className="btn-primary mr-1">Edit</button>
                                <button onClick={() => deleteCategory(category)} className="btn-primary">Delete</button>
                            </td>
                        </tr>
                    ))
                    }
                </tbody>
            </table>
            <div className="flex gap-5">
                {showMore * 10 < categories.length && categories.length > 10 && (
                    <button onClick={handleShowMore} className="btn-primary mt-2">More</button>
                )}
                {showMore > 1 && (
                    <button onClick={handleShowLess} className="btn-primary mt-2">Hide</button>
                )}
            </div>
        </Layout>
    )
};
export default withSwal(({ swal }, ref) =>
    (<Categories swal={swal} />)
);