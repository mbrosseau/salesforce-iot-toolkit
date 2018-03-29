public class PlatformEventsChartController {

    @AuraEnabled
	public static String getSessionId() {
 	 return UserInfo.getSessionId();
	}

     @AuraEnabled
    public static List<FieldDefinition> getEventFields(String eventName) {
      
          System.debug('Event name ' + eventName);

       eventName = eventName.left(eventName.length()-3);
       
         List<FieldDefinition> fieldList = [Select Label, DeveloperName, QualifiedApiName, NamespacePrefix,  DataType, FieldDefinition.Publisher.isSalesforce From FieldDefinition where EntityDefinition.DeveloperName=: eventName ];
    
     //   System.debug(fieldList);
        
        List<FieldDefinition> fieldNames = new List<FieldDefinition>();
          System.debug('--------- Getting Field Names -----------');
        for(FieldDefinition item: fieldList) {
            FieldDefinition name = item;
            Boolean isSalesforce =  item.Publisher.IsSalesforce;
            
		    if(!isSalesforce && !item.DataType.contains('Lookup') &&  (item.DataType.contains('Number') || item.DataType.contains('Percent')  || item.DataType.contains('Currency')   ) ) {
                fieldNames.add(name);
                System.debug(name);
            }
        }
        
        return fieldNames;
    }
    
     @AuraEnabled
    public static List<Object> getEventData(String fieldName, String objectName,  String recordId) {
     	
        System.debug('Field Name ' + fieldName);
      /*   
        //Validate the object in the request
         Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
        
       // Get the token for the sobject based on the type. 
        Schema.SObjectType st = gd.get(objectName);
        if(st == null) {   
            throw new AuraHandledException('Object provided: "' + objectName + '" does not map to an sobject in this org. Please double check the configuration of the lightning component.');

        } 
*/
      
        //this was written just so we could write a test class avoiding a custom field 
       String lookupFieldName = PlatformEventSimulatorController.getLookupFieldName(objectName, recordId);      
         System.debug('Lookup Name ' + lookupFieldName);     
         List<sObject> sobjList = Database.query('Select CreatedDate, ' + fieldName + ' from ' + objectName + ' where ' + lookupFieldName + '= \'' + recordId + '\' order by CreatedDate ASC limit 100');
        return sobjList;
    }

}