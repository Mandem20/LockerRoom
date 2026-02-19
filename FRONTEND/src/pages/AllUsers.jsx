import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify';
import moment from 'moment'
import { MdModeEdit, MdArrowUpward, MdArrowDownward, MdDelete, MdBlock } from "react-icons/md";
import { IoCheckmarkCircle } from "react-icons/io5";
import ChangeUserRole from '../components/ChangeUserRole';

const AllUsers = () => {
   const [allUser,setAllUsers] = useState([])
   const [filteredUsers, setFilteredUsers] = useState([])
   const [openUpdateRole,setOpenUpdateRole] = useState(false)
   const [updateUserDetails,setUpdateUserDetails] = useState({
    email : "",
    name : "",
    role : "",
    _id : ""
   })
   const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
   })
   const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' })

   const fetchAllUsers = async() =>{
      const fetchData = await fetch(SummaryApi.allUser.url,{
        method : SummaryApi.allUser.method,
        credentials : 'include'
      })

      const dataResponse = await fetchData.json()

      if(dataResponse.success){
        setAllUsers(dataResponse.data)
        setFilteredUsers(dataResponse.data)
      }

      if(dataResponse.error){
        toast.error(dataResponse.message)
      }


    }

    useEffect(()=>{
        fetchAllUsers()
    },[])

    useEffect(() => {
        const searchTerm = filters.search?.toLowerCase().trim() || ''
        
        let result = allUser.filter(user => {
            if (searchTerm) {
                const name = (user.name || '').toLowerCase()
                const email = (user.email || '').toLowerCase()
                const mobile = (user.mobile || '').toString().toLowerCase()
                if (!name.includes(searchTerm) && !email.includes(searchTerm) && !mobile.includes(searchTerm)) {
                    return false
                }
            }

            if (filters.role && user.role !== filters.role) {
                return false
            }

            if (filters.status !== '') {
                const isActive = filters.status === 'true'
                if (user.isActive !== isActive) return false
            }

            return true
        })

        result.sort((a, b) => {
            let aValue = a[sortConfig.field]
            let bValue = b[sortConfig.field]

            if (sortConfig.field === 'createdAt') {
                aValue = new Date(aValue).getTime()
                bValue = new Date(bValue).getTime()
            } else if (typeof aValue === 'string') {
                aValue = aValue?.toLowerCase() || ''
                bValue = bValue?.toLowerCase() || ''
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })

        setFilteredUsers(result)
    }, [filters, allUser, sortConfig])

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const clearFilters = () => {
        setFilters({ search: '', role: '', status: '' })
    }

    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const SortIcon = ({ field }) => {
        if (sortConfig.field !== field) return null
        return sortConfig.direction === 'asc' ? <MdArrowUpward className="inline ml-1" /> : <MdArrowDownward className="inline ml-1" />
    }

    const handleDeleteUser = async (userId, userRole) => {
        if (userRole === "ADMIN") {
            toast.error("Cannot delete admin user")
            return
        }
        
        if (!window.confirm("Are you sure you want to delete this user?")) return

        try {
            const response = await fetch(SummaryApi.deleteUser.url, {
                method: SummaryApi.deleteUser.method,
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ id: userId })
            })

            const data = await response.json()

            if (data.success) {
                toast.success("User deleted successfully")
                fetchAllUsers()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("Failed to delete user")
        }
    }

    const handleToggleStatus = async (userId, userRole) => {
        if (userRole === "ADMIN") {
            toast.error("Cannot change status of admin user")
            return
        }

        try {
            const response = await fetch(SummaryApi.toggleUserStatus.url, {
                method: SummaryApi.toggleUserStatus.method,
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ id: userId })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
                fetchAllUsers()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("Failed to update user status")
        }
    }


  return (
    <div className='pb-4 bg-white'>
        <div className='p-4 mb-4 flex flex-wrap gap-4 items-end'>
            <div className='flex-1 min-w-[200px]'>
                <label className='text-sm text-gray-600'>Search</label>
                <input
                    type='text'
                    name='search'
                    placeholder='Search by name, email, or mobile...'
                    value={filters.search || ''}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                />
            </div>

            <div className='min-w-[150px]'>
                <label className='text-sm text-gray-600'>Role</label>
                <select
                    name='role'
                    value={filters.role}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="GENERAL">General</option>
                </select>
            </div>

            <div className='min-w-[150px]'>
                <label className='text-sm text-gray-600'>Status</label>
                <select
                    name='status'
                    value={filters.status}
                    onChange={handleFilterChange}
                    className='w-full p-2 border rounded text-sm'
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <button
                onClick={clearFilters}
                className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm'
            >
                Clear
            </button>

            <div className='min-w-[150px]'>
                <label className='text-sm text-gray-600'>Sort By</label>
                <select
                    value={`${sortConfig.field}-${sortConfig.direction}`}
                    onChange={(e) => {
                        const [field, direction] = e.target.value.split('-')
                        setSortConfig({ field, direction })
                    }}
                    className='w-full p-2 border rounded text-sm'
                >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="email-asc">Email (A-Z)</option>
                    <option value="email-desc">Email (Z-A)</option>
                    <option value="role-asc">Role (A-Z)</option>
                    <option value="role-desc">Role (Z-A)</option>
                </select>
            </div>

            <div className='text-sm text-gray-500 ml-auto'>
                {filteredUsers.length} users
            </div>
        </div>

        <table className='w-full userTable'>
            <thead>
                <tr className='bg-black text-white'>
                <th>Sr.</th>
                <th className='cursor-pointer hover:bg-gray-800' onClick={() => handleSort('name')}>Name <SortIcon field="name" /></th>
                <th className='cursor-pointer hover:bg-gray-800' onClick={() => handleSort('email')}>Email <SortIcon field="email" /></th>
                <th>Mobile</th>
                <th className='cursor-pointer hover:bg-gray-800' onClick={() => handleSort('role')}>Role <SortIcon field="role" /></th>
                <th>Status</th>
                <th className='cursor-pointer hover:bg-gray-800' onClick={() => handleSort('createdAt')}>Created Date <SortIcon field="createdAt" /></th>
                <th>Action</th>
                </tr>
            </thead>
            <tbody className=''>
                {
                    filteredUsers.map((el,index) => {
                        return(
                            <tr key={el._id || index}>
                                <td>{index+1}</td>
                                <td>{el?.name}</td>
                                <td>{el?.email}</td>
                                <td>{el?.mobile || '-'}</td>
                                <td>{el?.role}</td>
                                <td>
                                    <span className={`px-2 py-1 rounded text-xs ${el?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {el?.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{moment(el?.createdAt).format('llll')}</td>
                                <td>
                                    <div className='flex gap-2 justify-center'>
                                        <button className='bg-green-100 p-2 rounded-full cursor-pointer hover:bg-green-500 hover:text-white' 
                                        onClick={()=>{
                                            setUpdateUserDetails(el)
                                            setOpenUpdateRole(true)
                                        }}
                                        >

                                            <MdModeEdit/> 
                                        </button>
                                        {el?.role !== "ADMIN" && (
                                            <button 
                                                className='bg-red-100 p-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white' 
                                                onClick={() => handleDeleteUser(el._id, el.role)}
                                            >
                                                <MdDelete/>
                                            </button>
                                        )}
                                        {el?.role !== "ADMIN" && (
                                            <button 
                                                className={`p-2 rounded-full cursor-pointer ${el?.isActive ? 'bg-yellow-100 hover:bg-yellow-500 hover:text-white' : 'bg-green-100 hover:bg-green-500 hover:text-white'}`}
                                                onClick={() => handleToggleStatus(el._id, el.role)}
                                                title={el?.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {el?.isActive ? <MdBlock/> : <IoCheckmarkCircle/>}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
      
      {
       openUpdateRole && (
        <ChangeUserRole 
        onClose={()=>setOpenUpdateRole(false)} 
        name={updateUserDetails.name}
        email={updateUserDetails.email}
        role={updateUserDetails.role}
        userId={updateUserDetails._id}
        callFunc={fetchAllUsers}
        />
       )

      }  
    </div>
  )
}

export default AllUsers