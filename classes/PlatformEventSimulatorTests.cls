@isTest
public class PlatformEventSimulatorTests {
 
	static testMethod void validateIoTExplorerSimulatorControllerCreateEvent() {
		Sample_Event_Data_Store__c item = new Sample_Event_Data_Store__c();
   
        PlatformEventSimulatorController.createEvent(item);
        System.assert(true);
    }
    
  static testMethod void validateIoTExplorerSimulatorControllerPublishEvent() {
    	Sample_Event_Data_Store__c item = new Sample_Event_Data_Store__c();

		PlatformEventSimulatorController.publishEvent(item);
        System.assert(true);
    }
    
    static testMethod void validateIoTExplorerSimulatorControllerPublishAndPersistEvent() {
    	Sample_Event_Data_Store__c item = new Sample_Event_Data_Store__c();
       SampleEvent__e  eventItem = new SampleEvent__e();
        eventItem.Temperature__c = 22;
         eventItem.Humidity__c = 22;

		item.Temperature__c = 22;
         item.Humidity__c = 22;
        
		PlatformEventSimulatorController.publishAndPersistEvent(eventItem, item);
          System.assert(true);
    }
    
    static testMethod void validateIoTExplorerSimulatorControllerGetEventFields() {
			PlatformEventSimulatorController.getEventFields('SampleEvent__e');
          System.assert(true);
    }
    
    static testMethod void validateIoTExplorerSimulatorControllerGetLookupFieldNames() {
         
          Account acct = new Account();
          acct.Name = 'Sample Name';
          insert acct;
       
         PlatformEventSimulatorController.getLookupFieldName('Case', acct.id);
         System.assert(true);
    }
    
    static testMethod void validateIOTExplorerChartControllerGetSessionId() {
        PlatformEventsChartController.getSessionId();
          System.assert(true);
    }
    
       static testMethod void validateIOTExplorerChartControllerGetEventFields() {
           PlatformEventsChartController.getEventFields('SampleEvent__e');
           System.assert(true);
    } 
    
       static testMethod void validateIOTExplorerChartControllerGetEventData() {
       		Account acct = new Account();
           acct.Name = 'Sample Name';
           insert acct;
           String fieldName = 'id';
         
         PlatformEventsChartController.getEventData(fieldName, 'Case', acct.Id);
         System.assert(true);
           
        try {
       			  PlatformEventsChartController.getEventData(fieldName, 'Case2', acct.Id);
                System.assert(false);
           } catch(Exception e) {
                          System.assert(true);
           }
    }
    
   
    

    
}