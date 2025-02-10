import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { FiCheck, FiEdit, FiTrash2, FiX} from 'react-icons/fi'
import '../../styles/api.css'
import { useLocation } from 'react-router-dom'

const ToDoList = () => {
    const location = useLocation()
    const { authToken, name} = location.state || {}

    // Function to verify if user is logged
    const verifyToken = async () => {
        try {
        await axios.get('http://localhost:3333/auth/verify-token', { withCredentials: true })
        } catch (error) {
        window.location.href="/"
        console.log(error)
        }
    }

    useEffect(() => {
        verifyToken()
    }, [])
    //

//LIST SCHEMA

    //List States
    type ListaType = {
        id: string,
        title: string,
        CreateAt: Date,
        LastUpdate: Date
      };

    const [titleList, setTitleList] = useState('')
    const [newTitle, setNewTitle] = useState('')
    const [lists, setLists] = useState<ListaType[]>([]);
    const [logout, setLogout] = useState(false)
    const [showLists, setShowLists] = useState(false)
    const [inputOnOff, setInputOnOff] = useState<number | null>(null)
    const [warningError, setWarningError] = useState<string | null>(null)
    const [loadingList, setLoadingList] = useState(false)
    //

    // Function to find a specific list
    const foundLists = useCallback(async () => {
        setLoadingList(true)
        try {
            const response = await axios.get('http://localhost:3333/list', {
                headers: { Authorization: `${authToken}` },
            })
            setLists(response.data.Lista)
        } catch (error) {
            console.error('Error finding lists: ', error)
        } finally{
            setLoadingList(false)
        }
    }, [authToken])
    //

    // Effect to find the lists when showLists == true
    useEffect(() => {
        try {
            if (showLists) {
                foundLists()
            }
        } catch (error) {
            console.error('Error for show the lists: ', error)
        }
    }, [showLists, foundLists])
    //


    // Function to logout user
    const logoutUser = useCallback(async () => {
        try {
          const response = await axios.post('http://localhost:3333/user/logout',{},
            {
                withCredentials: true
            }
            )
          if (response.data.logout) {
            window.location.href="/" 
          }
        } catch (error) {
          console.error('Error to make logout: ', error)
        }
    }, [])
    //
    
    // Effect to logout user when logout == true
    useEffect(() => {
    try {
        if (logout) {
        logoutUser()
        }
    } catch (error) {
        console.error('Error in process of logout: ', error)
        }
    }, [logout, logoutUser])
      //


    // Function to create a new list
    const createList = async (event: React.FormEvent) => {
        event.preventDefault()
        try {
            const response = await axios.post('http://localhost:3333/list/create',
                { titleList },
                { headers: { Authorization: `${authToken}` } }
            )
            setTitleList('')
            setLists([...lists,response.data.Lista])
        } catch (err) {
            console.error('Error for create the list: ', err)
        }
    }
    //

    // Function to open input of title list edit
    const openInputTitleList = (index: number) => {
        setInputOnOff(index) 
        setNewTitle(lists[index].title)
        setWarningError(null)
    }
    //

    // Function to editTitleList pressing the key enter
    const anyChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(e.target.value)
        if (e.target.value.trim()) {
            setWarningError(null)
        } else{
            setWarningError('Empty field! Slave someting...') // Set warningError when empty have 0 charecter
        }
    }
    //

    // Function to edit title list
    const editTitleList = async (index: number) => {
        try {
            const response = await axios.put(
                `http://localhost:3333/list/update/${lists[index].id}`,
                { newTitle },
                { headers: { Authorization: `${authToken}` } }
            )
            
            const updatedLists = [...lists]
            updatedLists[index] = {
                ...updatedLists[index],
                title: newTitle,
                LastUpdate: response.data.LastUpdate,
            }
            setLists(updatedLists)
            setInputOnOff(null) //Close input of edit title
        } catch (error) {
            console.error('Error for edit the title list: ', error)
        }
    }
    //

    // Function to delete list
    const deleteList = async (index: number) => {
        try {

            await axios.delete(
                `http://localhost:3333/list/delete/${lists[index].id}`,
                { headers: { Authorization: `${authToken}` } }
            )
            const updatedLists = lists.filter((_, i) => i !== index) //Filter for update the specific list
            setInputOnOff(null)
            setLists(updatedLists)
        } catch (error) {
            console.error('Error for delete the list: ', error)
        }
    }
    //
//

//MODAL TASKS SCHEMA
    //Modal Task States
    type TasksType = {
        id: string,
        description: string,
        CreateAt: Date,
        LastUpdate: Date
      };
    const [modalTitle, setModalTitle] = useState('')
    const [tasks, setTasks] = useState<TasksType[]>([])
    const [showModalTask, setShowModalTask] = useState(false)
    const [modalId, setModalId] = useState('')
    const [descriptionTask, setDescriptionTask] = useState('')
    const [descriptionCreateTask, setDescriptionCreateTask] = useState('')
    const [inputTaskOnOff, setInputTaskOnOff] = useState<string | null | number>(null)
    const [warningErrorTask, setWarningErrorTask] = useState<string | null>(null)
    const [loadingTask, setLoadingTask] = useState(false)
    //
    
    // Function to open modal task
    const openModalTask = (listId: string,listName: string) => {
        console.log(listId)
        foundTasks(listId) // Find the tasks from list
        setModalTitle(listName)
        setModalId(listId)
        setShowModalTask(true)
    }

    // Function to close modal task
    const closeModalTask = () => {
        setShowModalTask(false)
        setTasks([]) // Hide tasks for close the modal
    }

    //  Function to find tasks
    const foundTasks = async (listId: string) => {
        setLoadingTask(true)
        try {
            const response = await axios.get(`http://localhost:3333/task/find/${listId}`, 
                { headers: { Authorization: `${authToken}` } }
            )

            setTasks(response.data.tasks)
            setLoadingTask(false) 
        } catch (error) {
            console.error('Error for found the tasks: ', error)
        }
    }
    

//

    // Function to add task in the list
    const addTask = async(listId: string | React.FormEvent) => {
        try {
            const response = await axios.post(`http://localhost:3333/task/add/${listId}`,
                { descriptionCreateTask },
                { headers: { Authorization: `${authToken}` }}
            )
            setDescriptionCreateTask('')
            setTasks([...tasks, response.data.Task])
        } catch (error) {
            console.error('Error for add the task: ', error)
        }
    }

    // Function to delete a task
    const deleteTask = async (taskId: string) => {
        try {
            await axios.delete(`http://localhost:3333/task/delete/${taskId}`, {
                headers: { Authorization: `${authToken}` },
            })
            setTasks(tasks.filter((task) => task.id !== taskId)) // Remove a tarefa da lista localmente
        } catch (error) {
            console.error('Error for delete the task: ', error)
        }
    }

    // Function for editTitleList pressing the key enter
    const anyChangeInputTask = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescriptionTask(e.target.value)
        if (e.target.value.trim()) {
            setWarningErrorTask(null)
        } else{
            setWarningErrorTask('Empty field! Slave someting...') // Set warningError when empty have 0 charecter
        }
    }
    //

    // Function for open input of title list edit
    const openInputEditTask = (index: number) => {
        setInputTaskOnOff(index)
        setDescriptionTask(tasks[index].description) 
        setWarningErrorTask(null) 
    
    }
    //

    // Function to edit a task
    const editTask = async (index: number) => {
        try {
            console.log(tasks[index].id)
            const response = await axios.put(
                `http://localhost:3333/task/update/${tasks[index].id}`,
                { descriptionTask },
                { headers: { Authorization: `${authToken}` } }
            )
            console.log('Lista editada com sucesso!', response.data)
            const updatedTasks = [...tasks]
            updatedTasks[index] = {
                ...updatedTasks[index],
                description: descriptionTask,
                LastUpdate: response.data.LastUpdate,
            }
            setTasks(updatedTasks)
            setInputTaskOnOff(null)
        } catch (error) {
            console.error('Error for edit the list: ', error)
        }
    }
//

    return (
        <div className="container-page">
            <p className="name-user">Welcome, {`${name}`}</p>
                <button className="btn-logout" onClick={() => {
                setLogout(true)
                logoutUser()
                }}
                >Logout</button>

  
            <h1 className="title" style={{color: "gainsboro"}}>Create your To-Do List</h1>
            <form onSubmit={createList} className="header-form">
            <div className="input-container">
                
                <input
                    className="input-create-list"
                    type="text"
                    value={titleList}
                    maxLength={Number("100")}
                    required
                    placeholder="Write the title of your To-Do List..."
                    onChange={(e) => setTitleList(e.target.value)}
                />
                <span className="char-counter">{`${titleList.length}/100`}</span>
                </div>
                <button 
                    type="submit" 
                    className="button"
                    style={{ marginLeft: '10px'}}
                >Create</button>

            </form>

            <button
                type="button"
                onClick={() => setShowLists(!showLists)}
                className="button"
            >
                {showLists ? 'Hide My Lists' : 'Show My Lists'}
            </button>

            {showLists && (
                <div className="container-list">
                    {loadingList ? (
                        <p className="no-lists-message">Loading lists...</p>
                    ) : lists.length === 0 ? (
                        <p className="no-lists-message">No list found... Add a new list!</p>
                    ) : (
                        <div className="list">
                            {lists.map((list, index: number) => (
                                <div className="card-list" key={index} onClick={() => openModalTask(list.id, list.title)}>
                                    <div className="icon-list">
                                        <span
                                            className="icon-edit-list"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openInputTitleList(index)
                                            }}
                                            style={{ cursor: 'pointer', color: 'green' }}
                                        >
                                            <FiEdit />
                                        </span>

                                        <span
                                            className="icon-delete-list"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deleteList(index)
                                            }}
                                            style={{ cursor: 'pointer', color: 'red' }}
                                        >
                                            <FiTrash2 />
                                        </span>
                                    </div>

                                    <div className="card-title">
                                        {inputOnOff === index ? (
                                            <div className="input-container">
                                                <input
                                                    className="input-list"
                                                    type="text"
                                                    maxLength={Number("100")}
                                                    required
                                                    onClick={(e) =>{
                                                        e.stopPropagation()
                                                    }}
                                                    value={newTitle}
                                                    onChange={anyChangeInput}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && newTitle) {
                                                            editTitleList(index)
                                                        }
                                                    }}
                                                    
                                                    placeholder="Write your new title for the list..."
                                                />
                                                <span className="char-counter">{`${newTitle.length}/100`}</span>
                                            </div>
                                        ) : (
                                            <p className="list-title">{list.title}</p>
                                        )}

                                        {inputOnOff === index && (
                                            <span   
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (newTitle.length > 0) {
                                                        editTitleList(index)
                                                    }
                                                }}
                                                className="icon-check-list"
                                                style={{ cursor: 'pointer', color: 'green' }}
                                            ><FiCheck /></span>
                                        )}
                                    </div>
                                    
                                    {inputOnOff === index && warningError && (<div className="error-message">{warningError}</div>)}

                                    <div className="card-footer">
                                        <div className="date-container">
                                            <span className="date">
                                                Created: {new Date(list.CreateAt).toLocaleString()}
                                            </span>
                                            <br />
                                            <span className="date">
                                                Updated: {new Date(list.LastUpdate).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {showModalTask && (
                <>
                   <div
                    className="modal-overlay"
                    style={{ display: showModalTask ? 'block' : 'none' }}
                    ></div>

                    <div className="modal-container">
                        <div className="modal-header">
                            <h2 className="modal-title">{modalTitle}</h2>
                            <span 
                                className="close-icon-modal"
                                onClick={closeModalTask}
                                style={{ cursor: 'pointer', color: 'red'}}
                            ><FiX /></span>
                        </div>
                        <div className="modal-mid">
                            <div className="modal-list">
                            {loadingTask ? ( <p className="modal-found-task" style = {{color: "white"}}>Loading tasks...</p>
                            ) : tasks.length === 0 ? (<div className="modal-found-task" style = {{color: "white"}}>No task found...Add a new task!</div>
                            ) : (tasks.map((task, index) => (
                                        <div key={task.id}>
                                            <div className="modal-description">                                    
                                                {inputTaskOnOff === index ? (
                                                    <div className="input-container">
                                                        <input
                                                            className="input-task"
                                                            type="text"
                                                            required
                                                            value={descriptionTask}
                                                            onChange={anyChangeInputTask}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" && descriptionTask) {
                                                                    editTask(index)
                                                                }
                                                            }}
                                                            
                                                            placeholder="Write to edit the title of task..."
                                                        />
                                                        
                                                    </div>
                                                ) : (
                                                    <p className="title-task">{task.description}</p>
                                                )}

                                                {inputTaskOnOff === index && (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (descriptionTask.length > 0) {
                                                            editTask(index)
                                                            }
                                                        }}
                                                        className="icon-check-task"
                                                        style={{ cursor: 'pointer', color: 'green' }}
                                                    ><FiCheck /></span>
                                                )}
                                
                                                <div className="icons-modal">
                                                    <div
                                                        onChange={anyChangeInputTask}
                                                        onClick={() => {
                                                            setDescriptionTask(task.description)
                                                            openInputEditTask(index)}
                                                        }
                                                        className="edit-icon-task"
                                                        style={{cursor: 'pointer',color: 'green'}}
                                                    ><FiEdit /></div>
                                                    <div
                                                        onClick={() => deleteTask(task.id)}
                                                        className="delete-icon-task"
                                                        style={{ cursor: 'pointer', color: 'red'}}
                                                    ><FiTrash2 /></div>
                                                </div>
                                            </div>
                                            {inputTaskOnOff === index && warningErrorTask && (<div className="error-message">{warningErrorTask}</div>)}
                                        </div>
                                    ))
                                )}

                            </div>
                        </div>
                        <div className="modal-footer">
                            <form onSubmit={addTask}></form>
                            <input
                                className="input-title-task"
                                type="text"
                                required
                                value= {descriptionCreateTask}
                                onKeyDown={(e) =>{
                                    if(e.key === 'Enter'){
                                        addTask(modalId)
                                    }
                                }}
                                onChange={(e) => {
                                    setDescriptionCreateTask(e.target.value)
                                }}
                                placeholder="Write your new title to the task..."
                             />
                            <button 
                                className="button-add-task" 
                                onClick={()=> {addTask(modalId)}}>Add Task
                            </button>
                        </div>
                    </div>
                    
                </>
            )}
        </div>
    )
}

export default ToDoList
