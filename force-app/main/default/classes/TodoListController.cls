public with sharing class TodoListController {
    
    @AuraEnabled(cacheable = true)
    public static List<Task> getTasks(){
        return [Select Subject FROM Task where OwnerId='005N000000A8KG3'];
    }

    @AuraEnabled
    public static Task insertTask(String Subject){
        try{
            Task task = new Task(
            Subject = Subject,
            OwnerId = UserInfo.getUserId(),
            Status = 'Not Started',
            Priority = 'Normal'
        );
        insert task;
        return task;
        }catch(Exception e){
            System.debug(e.getMessage());
        }
        return null;
    }

    @AuraEnabled
    public static Boolean deleteTaskById(Id recordId){
        try {
            Database.delete(recordId);
            return true;
        } catch (Exception e) {
            System.debug(e.getMessage());
        }
        return false;
    }
}
