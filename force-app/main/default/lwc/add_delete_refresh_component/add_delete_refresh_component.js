import { LightningElement, track, wire } from 'lwc';
import getTasks from '@salesforce/apex/TodoListController.getTasks'
import insertTask from '@salesforce/apex/TodoListController.insertTask'
import deleteTaskById from '@salesforce/apex/TodoListController.deleteTaskById'
import { refreshApex } from '@salesforce/apex';

export default class Add_delete_refresh_component extends LightningElement {
    @track todoTasks = [];
    
    newTask = "";
    isProcessing = true;
    todoTasksResponse;

    setNewTask(event) {
        this.newTask = event.target.value;
    }

    @wire(getTasks)
    getTodoTasks(response) {
        this.todoTasksResponse = response;

        let data = response.data;
        let error = response.error;

        if(data || error){
            this.isProcessing = false;
        }

        this.todoTasks = [];
        if(data){
            console.log(data);
            data.forEach(todoTask => {
                this.todoTasks.push({
                    id: this.todoTasks.length + 1,
                    name: todoTask.Subject,
                    recordId: todoTask.Id
                });
            });
        }else if(error){
            console.log('Error fetching the data from the server')
            console.log(error);
        }
    }

    addNewTodoTask(event) {

        if(this.newTask == ''){
            return;
        }

        this.isProcessing = true;

        insertTask( {Subject: this.newTask})
        .then(result => {
            console.log(result);

            this.todoTasks.push({
                id: this.todoTasks[this.todoTasks.length - 1] ? this.todoTasks[this.todoTasks.length - 1].id + 1 : 1,
                name: this.newTask,
                recordId: result.Id
            });
            this.newTask = "";
        })
        .catch(error => console.log(error))
        .finally(() => this.isProcessing=false);
    }

    deleteTask(event) {
        this.isProcessing=true;

        let idToDelete = event.target.name;
        let todoTasks = this.todoTasks;
        let todoTaskToDeleteIndex;
        let recordIdToDelete;


        for(let i = 0; i < todoTasks.length; i++){
            if(todoTasks[i].id ===  idToDelete){
                todoTaskToDeleteIndex = i;
            }
        }

        recordIdToDelete = this.todoTasks[todoTaskToDeleteIndex].recordId;

        deleteTaskById( { recordId: recordIdToDelete } )
        .then(result => {
            console.log(result);
            if(result){
                todoTasks.splice(todoTaskToDeleteIndex, 1);
            }else{
                console.log('unable to delete task')
            }
        })
        .catch(error => console.log('Unable to delete task'))
        .finally(() => this.isProcessing=false);
    }

    refreshTodoList(event){
        this.isProcessing = true;

        refreshApex(this.todoTasksResponse)
        .finally(() => this.isProcessing = false);
    }
}