import { useEffect, useState } from 'react'
import './List.css'
import { url } from '../../assets/assets'
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { formatPrice, onCurrencyChange } from '../../utils/currency';
import EditFoodModal from '../../components/EditFoodModal/EditFoodModal';

const List = () => {

  const [list,setList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [, setCurrencyTrigger] = useState(0);

  useEffect(() => {
    return onCurrencyChange(() => {
      setCurrencyTrigger((prev) => prev + 1);
    });
  }, []);
  
  const fetchList = async () => {
    const response = await api.get(`${url}/api/food/list`)
    if(response.data.success)
    {
      setList(response.data.data);
    }
    else{
      toast.error("Error")
    }
  }

  const removeFood = async (foodId) => {
    const response = await api.post(`${url}/api/food/remove`,{
      id:foodId
    })
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    }
    else {
      toast.error("Error")
    }
  }

  const handleSaved = (updatedItem) => {
    setList((current) => current.map((item) => item._id === updatedItem._id ? updatedItem : item));
  }

  useEffect(()=>{
    fetchList();
  },[])

  return (
    <div className='list add flex-col'>
        <p>All Foods List</p>
        <div className='list-table'>
          <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
          </div>
          {list.map((item,index)=>{
            return (
              <div key={index} className='list-table-format'>
                <img src={`${url}/images/`+item.image} alt={item.name} />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>{formatPrice(item.price)}</p>
                <div className='list-table-actions'>
                  <button type='button' className='list-edit-button' onClick={()=>setEditingItem(item)}>Edit</button>
                  <button type='button' className='list-remove-button' onClick={()=>removeFood(item._id)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
        <EditFoodModal item={editingItem} onClose={()=>setEditingItem(null)} onSaved={handleSaved} />
    </div>
  )
}

export default List
